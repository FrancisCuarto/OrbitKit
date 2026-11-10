#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const SKILLS_DIR = path.join(ROOT_DIR, 'skills');
const CLI_PKG_PATH = path.join(ROOT_DIR, 'packages', 'cli', 'package.json');
const CATALOG_OUT_PATH = path.join(ROOT_DIR, 'catalog.json');

// Precomputed CRC32 table for Node 20 compatibility if zlib.crc32 is absent
const CRC_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  CRC_TABLE[i] = c >>> 0;
}

function crc32(buf) {
  if (typeof zlib.crc32 === 'function') {
    return zlib.crc32(buf) >>> 0;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/**
 * Builds a deterministic standard ZIP buffer from an array of { name, data } entries.
 * Uses STORE (0) or DEFLATE (8) with fixed DOS timestamp (2026-01-01 00:00:00) for reproducible SHA-256 hashes.
 */
export function createDeterministicZip(entries) {
  const sorted = [...entries].sort((a, b) => a.name.localeCompare(b.name));
  const localHeaders = [];
  const centralHeaders = [];
  let offset = 0;

  // Fixed DOS date/time: 2026-01-01 00:00:00 -> date = ((2026-1980)<<9)|(1<<5)|1 = 0x5c21, time = 0
  const dosTime = 0x0000;
  const dosDate = 0x5c21;

  for (const entry of sorted) {
    const nameBuf = Buffer.from(entry.name.replace(/\\/g, '/'), 'utf8');
    const rawData = Buffer.isBuffer(entry.data) ? entry.data : Buffer.from(entry.data, 'utf8');
    const crc = crc32(rawData);
    const compressed = zlib.deflateRawSync(rawData, { level: 9 });
    const useDeflate = compressed.length < rawData.length;
    const method = useDeflate ? 8 : 0;
    const payload = useDeflate ? compressed : rawData;

    // Local file header (30 bytes + name)
    const localHeader = Buffer.alloc(30 + nameBuf.length);
    localHeader.writeUInt32LE(0x04034b50, 0); // signature
    localHeader.writeUInt16LE(20, 4); // version needed (2.0)
    localHeader.writeUInt16LE(0, 6); // general purpose bit flag
    localHeader.writeUInt16LE(method, 8); // compression method
    localHeader.writeUInt16LE(dosTime, 10); // last mod time
    localHeader.writeUInt16LE(dosDate, 12); // last mod date
    localHeader.writeUInt32LE(crc, 14); // crc-32
    localHeader.writeUInt32LE(payload.length, 18); // compressed size
    localHeader.writeUInt32LE(rawData.length, 22); // uncompressed size
    localHeader.writeUInt16LE(nameBuf.length, 26); // file name length
    localHeader.writeUInt16LE(0, 28); // extra field length
    nameBuf.copy(localHeader, 30);

    localHeaders.push(localHeader, payload);

    // Central directory file header (46 bytes + name)
    const centralHeader = Buffer.alloc(46 + nameBuf.length);
    centralHeader.writeUInt32LE(0x02014b50, 0); // signature
    centralHeader.writeUInt16LE(20, 4); // version made by
    centralHeader.writeUInt16LE(20, 6); // version needed
    centralHeader.writeUInt16LE(0, 8); // flags
    centralHeader.writeUInt16LE(method, 10); // compression method
    centralHeader.writeUInt16LE(dosTime, 12); // last mod time
    centralHeader.writeUInt16LE(dosDate, 14); // last mod date
    centralHeader.writeUInt32LE(crc, 16); // crc-32
    centralHeader.writeUInt32LE(payload.length, 20); // compressed size
    centralHeader.writeUInt32LE(rawData.length, 24); // uncompressed size
    centralHeader.writeUInt16LE(nameBuf.length, 28); // file name length
    centralHeader.writeUInt16LE(0, 30); // extra field length
    centralHeader.writeUInt16LE(0, 32); // file comment length
    centralHeader.writeUInt16LE(0, 34); // disk number start
    centralHeader.writeUInt16LE(0, 36); // internal file attributes
    centralHeader.writeUInt32LE(0, 38); // external file attributes
    centralHeader.writeUInt32LE(offset, 42); // relative offset of local header
    nameBuf.copy(centralHeader, 46);

    centralHeaders.push(centralHeader);
    offset += localHeader.length + payload.length;
  }

  const centralDirSize = centralHeaders.reduce((acc, b) => acc + b.length, 0);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0); // EOCD signature
  eocd.writeUInt16LE(0, 4); // number of this disk
  eocd.writeUInt16LE(0, 6); // disk where central directory starts
  eocd.writeUInt16LE(sorted.length, 8); // total entries on this disk
  eocd.writeUInt16LE(sorted.length, 10); // total entries in central directory
  eocd.writeUInt32LE(centralDirSize, 12); // size of central directory
  eocd.writeUInt32LE(offset, 16); // offset of central directory
  eocd.writeUInt16LE(0, 20); // comment length

  return Buffer.concat([...localHeaders, ...centralHeaders, eocd]);
}

export async function buildCatalog(options = {}) {
  const skillsDir = options.skillsDir || SKILLS_DIR;
  const outPath = options.outPath || CATALOG_OUT_PATH;
  const cliPkgRaw = await fs.readFile(CLI_PKG_PATH, 'utf8');
  const cliPkg = JSON.parse(cliPkgRaw);

  const dirEntries = await fs.readdir(skillsDir, { withFileTypes: true });
  const skillDirs = dirEntries
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort((a, b) => a.localeCompare(b));

  const skills = [];

  for (const id of skillDirs) {
    const skillFolder = path.join(skillsDir, id);
    const skillMdPath = path.join(skillFolder, 'SKILL.md');
    const skillJsonPath = path.join(skillFolder, 'skill.json');

    const [skillMd, skillJsonRaw] = await Promise.all([
      fs.readFile(skillMdPath, 'utf8'),
      fs.readFile(skillJsonPath, 'utf8')
    ]);

    const meta = JSON.parse(skillJsonRaw);
    const normalizedJson = JSON.stringify(meta, null, 2) + '\n';

    const zipBuffer = createDeterministicZip([
      { name: 'SKILL.md', data: skillMd },
      { name: 'skill.json', data: normalizedJson }
    ]);

    const zipOutPath = path.join(skillsDir, `${id}.zip`);
    await fs.writeFile(zipOutPath, zipBuffer);

    const hash = crypto.createHash('sha256').update(zipBuffer).digest('hex');

    const skillEntry = {
      id: meta.id || id,
      name: meta.name,
      version: meta.version,
      description: meta.description,
      checksum: `sha256:${hash}`,
      url: `https://raw.githubusercontent.com/FrancisCuarto/OrbitKit/main/skills/${id}.zip`,
      tags: Array.isArray(meta.tags) ? meta.tags : [],
      ...(meta.minGodot ? { minGodot: meta.minGodot } : {}),
      channel: meta.channel || 'stable'
    };

    skills.push(skillEntry);
  }

  skills.sort((a, b) => a.id.localeCompare(b.id));

  const catalog = {
    schema: 1,
    generatedAt: options.generatedAt || new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
    cli: {
      latest: cliPkg.version || '0.6.0',
      minSupported: '0.5.0',
      channel: 'stable'
    },
    skills
  };

  await fs.writeFile(outPath, JSON.stringify(catalog, null, 2) + '\n', 'utf8');
  return catalog;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  buildCatalog()
    .then((catalog) => {
      console.log(`Generated catalog.json with ${catalog.skills.length} skills (CLI v${catalog.cli.latest}).`);
    })
    .catch((err) => {
      console.error('Failed to build catalog:', err);
      process.exitCode = 1;
    });
}
