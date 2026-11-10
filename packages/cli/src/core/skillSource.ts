import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import AdmZip from 'adm-zip';
import type { CatalogSkill } from './catalog.js';
import { isAllowedRemoteUrl } from './config.js';

const MAX_SKILL_DOWNLOAD_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_ZIP_ENTRIES = 64;
const ALLOWED_DEST_PREFIXES = ['.agents/skills/', '.claude/skills/', 'addons/'];

export function isAllowedSkillDestination(relDestination: string): boolean {
  if (typeof relDestination !== 'string' || !relDestination) return false;
  if (relDestination.includes('..') || relDestination.includes('\\') || path.isAbsolute(relDestination)) {
    return false;
  }
  return ALLOWED_DEST_PREFIXES.some((prefix) => relDestination.startsWith(prefix));
}

export function parseChecksum(checksumStr?: string): {
  algorithm: 'sha256' | 'sha512';
  hex: string;
} | null {
  if (!checksumStr || typeof checksumStr !== 'string') return null;
  const match = checksumStr.trim().match(/^(sha256|sha512):([a-fA-F0-9]+)$/);
  if (!match) return null;
  const algorithm = match[1] as 'sha256' | 'sha512';
  const hex = match[2].toLowerCase();
  const expectedLen = algorithm === 'sha256' ? 64 : 128;
  if (hex.length !== expectedLen) return null;
  return { algorithm, hex };
}

export function verifyBufferChecksum(
  buffer: Buffer,
  checksumStr?: string
): { valid: boolean; reason?: string } {
  const parsed = parseChecksum(checksumStr);
  if (!parsed) {
    return { valid: false, reason: 'Checksum ausente o con formato inválido (se requiere sha256:<hex>)' };
  }
  const actual = crypto.createHash(parsed.algorithm).update(buffer).digest('hex').toLowerCase();
  if (actual !== parsed.hex) {
    return {
      valid: false,
      reason: `Checksum inválido para el artefacto (${parsed.algorithm} esperado ${parsed.hex.slice(0, 12)}…, recibido ${actual.slice(0, 12)}…)`
    };
  }
  return { valid: true };
}

/**
 * Downloads, verifies, and extracts a remote skill ZIP into .agents/skills/<id> and .claude/skills/<id>.
 */
export async function installRemoteSkill(
  projectDir: string,
  skillId: string,
  source: CatalogSkill,
  timeoutMs = 5000
): Promise<{ success: boolean; version: string; message: string }> {
  if (!source.url) {
    return {
      success: false,
      version: '0.0.0',
      message: `La skill '${skillId}' no tiene URL remota configurada.`
    };
  }

  if (!isAllowedRemoteUrl(source.url)) {
    return {
      success: false,
      version: '0.0.0',
      message: `URL no permitida para '${skillId}' (solo HTTPS): ${source.url}`
    };
  }

  const parsedChecksum = parseChecksum(source.checksum);
  if (!parsedChecksum) {
    return {
      success: false,
      version: '0.0.0',
      message: `Checksum obligatorio ausente o inválido para '${skillId}'.`
    };
  }

  // Validate skillId against traversal
  if (!skillId || skillId.includes('..') || skillId.includes('/') || skillId.includes('\\')) {
    return {
      success: false,
      version: '0.0.0',
      message: `Identificador de skill inválido: '${skillId}'`
    };
  }

  let buffer: Buffer;
  try {
    const res = await fetch(source.url, {
      signal: AbortSignal.timeout(timeoutMs)
    });
    if (!res.ok) {
      return {
        success: false,
        version: '0.0.0',
        message: `Error HTTP ${res.status} al descargar '${skillId}'`
      };
    }

    const contentLength = Number(res.headers.get('content-length') || '0');
    if (contentLength > MAX_SKILL_DOWNLOAD_BYTES) {
      return {
        success: false,
        version: '0.0.0',
        message: `El archivo de '${skillId}' excede el límite de ${MAX_SKILL_DOWNLOAD_BYTES} bytes.`
      };
    }

    const arrayBuf = await res.arrayBuffer();
    if (arrayBuf.byteLength > MAX_SKILL_DOWNLOAD_BYTES) {
      return {
        success: false,
        version: '0.0.0',
        message: `El archivo descargado de '${skillId}' excede el límite de 10 MB.`
      };
    }
    buffer = Buffer.from(arrayBuf);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      version: '0.0.0',
      message: `Fallo de red descargando '${skillId}': ${msg}`
    };
  }

  const integrity = verifyBufferChecksum(buffer, source.checksum);
  if (!integrity.valid) {
    return {
      success: false,
      version: '0.0.0',
      message: integrity.reason || 'Checksum inválido'
    };
  }

  let entries: AdmZip.IZipEntry[];
  try {
    const zip = new AdmZip(buffer);
    entries = zip.getEntries();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      version: '0.0.0',
      message: `Archivo ZIP corrupto para '${skillId}': ${msg}`
    };
  }

  if (entries.length === 0 || entries.length > MAX_ZIP_ENTRIES) {
    return {
      success: false,
      version: '0.0.0',
      message: `Cantidad de entradas ZIP inválida (${entries.length}) para '${skillId}'.`
    };
  }

  // Validate all entries before writing anything
  const filesToWrite: { relPath: string; data: Buffer }[] = [];
  let totalUncompressed = 0;

  for (const entry of entries) {
    const rawName = entry.entryName;
    if (
      !rawName ||
      rawName.includes('..') ||
      rawName.includes('\\') ||
      rawName.startsWith('/')
    ) {
      return {
        success: false,
        version: '0.0.0',
        message: `Entrada ZIP insegura detectada en '${skillId}': ${rawName}`
      };
    }

    if (entry.isDirectory) continue;

    // Strip optional leading "<skillId>/" folder if archive was packaged with top-level folder
    const normalizedRel = rawName.startsWith(`${skillId}/`)
      ? rawName.slice(skillId.length + 1)
      : rawName;

    if (!normalizedRel || normalizedRel.includes('..') || path.isAbsolute(normalizedRel)) {
      return {
        success: false,
        version: '0.0.0',
        message: `Ruta relativa inválida en ZIP de '${skillId}': ${rawName}`
      };
    }

    for (const prefix of ['.agents/skills', '.claude/skills']) {
      const candidateDest = `${prefix}/${skillId}/${normalizedRel}`;
      if (!isAllowedSkillDestination(candidateDest)) {
        return {
          success: false,
          version: '0.0.0',
          message: `Destino no permitido: ${candidateDest}`
        };
      }
    }

    const data = entry.getData();
    totalUncompressed += data.length;
    if (totalUncompressed > MAX_SKILL_DOWNLOAD_BYTES) {
      return {
        success: false,
        version: '0.0.0',
        message: `El contenido descomprimido de '${skillId}' excede el límite de seguridad.`
      };
    }

    filesToWrite.push({ relPath: normalizedRel, data });
  }

  const targetBases = [
    path.join(projectDir, '.agents', 'skills'),
    path.join(projectDir, '.claude', 'skills')
  ];

  try {
    for (const baseDir of targetBases) {
      await fs.mkdir(baseDir, { recursive: true });
      const finalDir = path.join(baseDir, skillId);
      const tmpDir = path.join(baseDir, `.tmp-${skillId}-${process.pid}-${Date.now()}`);

      await fs.mkdir(tmpDir, { recursive: true });
      try {
        for (const file of filesToWrite) {
          const destFile = path.join(tmpDir, file.relPath);
          await fs.mkdir(path.dirname(destFile), { recursive: true });
          await fs.writeFile(destFile, file.data);
        }

        // Ensure skill.json has current metadata
        const metaPath = path.join(tmpDir, 'skill.json');
        const hasMeta = await fs
          .access(metaPath)
          .then(() => true)
          .catch(() => false);
        if (!hasMeta) {
          const meta = {
            id: source.id,
            name: source.name || source.id,
            version: source.version,
            updated_at: new Date().toISOString()
          };
          await fs.writeFile(metaPath, JSON.stringify(meta, null, 2), 'utf8');
        }

        await fs.rm(finalDir, { recursive: true, force: true });
        await fs.rename(tmpDir, finalDir);
      } catch (innerErr) {
        await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
        throw innerErr;
      }
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      version: '0.0.0',
      message: `Error al extraer '${skillId}': ${msg}`
    };
  }

  return {
    success: true,
    version: source.version,
    message: `Installed ${source.name || source.id} (v${source.version}) into .agents/skills and .claude/skills`
  };
}
