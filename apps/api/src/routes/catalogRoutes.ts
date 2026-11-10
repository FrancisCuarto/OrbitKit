import { Router, Request, Response } from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import { ResourceModel } from '../models/Resource.js';
import { ResourceVersionModel } from '../models/ResourceVersion.js';

const router: Router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_CATALOG_PATH = path.resolve(__dirname, '../../../../catalog.json');

interface CatalogSkillEntry {
  id: string;
  name?: string;
  version: string;
  description?: string;
  checksum?: string;
  url?: string;
  tags: string[];
  minGodot?: string;
  channel: 'stable' | 'beta';
}

router.get('/', async (req: Request, res: Response) => {
  try {
    let baseCatalog: {
      schema: 1;
      generatedAt: string;
      cli: { latest: string; minSupported: string; channel: 'stable' | 'beta' };
      skills: CatalogSkillEntry[];
    } = {
      schema: 1,
      generatedAt: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
      cli: {
        latest: '0.6.0',
        minSupported: '0.5.0',
        channel: 'stable'
      },
      skills: []
    };

    try {
      const raw = await fs.readFile(ROOT_CATALOG_PATH, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && parsed.schema === 1) {
        baseCatalog = parsed;
      }
    } catch {
      // Fallback to default catalog header if file not present
    }

    const skillsMap = new Map<string, CatalogSkillEntry>();
    for (const s of baseCatalog.skills) {
      skillsMap.set(s.id, s);
    }

    // Merge verified AI skills from MongoDB when connected
    if (mongoose.connection.readyState === 1) {
      const dbSkills = await ResourceModel.find({ type: 'ai_skill' }).lean();
      for (const resource of dbSkills) {
        const latestVerified = await ResourceVersionModel.findOne({
          resource_id: resource.id,
          verified: true
        })
          .sort({ created_at: -1 })
          .lean();

        if (!latestVerified) continue;

        const manifest = latestVerified.manifest;
        const checksum = manifest?.integrity
          ? `${manifest.integrity.algorithm}:${manifest.integrity.checksum}`
          : undefined;

        skillsMap.set(resource.id, {
          id: resource.id,
          name: resource.name,
          version: latestVerified.version,
          description: resource.description,
          checksum,
          url: manifest?.source?.url,
          tags: Array.isArray(resource.tags) ? resource.tags : [],
          minGodot: manifest?.compatibility?.godot?.[0],
          channel: 'stable'
        });
      }
    }

    const payload = {
      schema: 1 as const,
      generatedAt: baseCatalog.generatedAt,
      cli: baseCatalog.cli,
      skills: Array.from(skillsMap.values()).sort((a, b) => a.id.localeCompare(b.id))
    };

    const bodyJson = JSON.stringify(payload);
    const etag = `"${crypto.createHash('sha256').update(bodyJson).digest('hex').slice(0, 32)}"`;

    res.setHeader('ETag', etag);
    if (req.headers['if-none-match'] === etag) {
      res.status(304).end();
      return;
    }

    res.json(payload);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Catalog error';
    res.status(500).json({ error: msg });
  }
});

export default router;
