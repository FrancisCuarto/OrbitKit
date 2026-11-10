import { z } from 'zod';
import { isAllowedRemoteUrl } from './config.js';

export const SkillSchema = z.object({
  id: z.string().min(1),
  name: z.string().optional(),
  version: z.string().min(1),
  description: z.string().optional(),
  checksum: z.string().optional(),
  url: z.string().url().optional(),
  tags: z.array(z.string()).default([]),
  minGodot: z.string().optional(),
  channel: z.enum(['stable', 'beta']).default('stable')
});

export const CatalogSchema = z.object({
  schema: z.literal(1),
  generatedAt: z.string(),
  signature: z.string().optional(),
  cli: z.object({
    latest: z.string(),
    minSupported: z.string(),
    channel: z.enum(['stable', 'beta']).default('stable')
  }),
  skills: z.array(SkillSchema)
});

export type Catalog = z.infer<typeof CatalogSchema>;
export type CatalogSkill = Catalog['skills'][number];

export async function fetchCatalog(
  url: string,
  etag?: string,
  timeoutMs = 2500
): Promise<{
  catalog: Catalog | null;
  etag?: string;
  notModified: boolean;
  unsupportedSchema?: boolean;
  error?: string;
}> {
  if (!isAllowedRemoteUrl(url)) {
    return {
      catalog: null,
      notModified: false,
      error: `URL de catálogo rechazada (se requiere HTTPS): ${url}`
    };
  }

  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
        ...(etag ? { 'If-None-Match': etag } : {})
      },
      signal: AbortSignal.timeout(timeoutMs)
    });

    if (res.status === 304) {
      return { catalog: null, etag, notModified: true };
    }
    if (!res.ok) {
      return {
        catalog: null,
        notModified: false,
        error: `HTTP ${res.status} al descargar catálogo`
      };
    }

    const rawJson: unknown = await res.json();
    if (
      rawJson &&
      typeof rawJson === 'object' &&
      'schema' in rawJson &&
      (rawJson as { schema: unknown }).schema !== 1
    ) {
      return {
        catalog: null,
        notModified: false,
        unsupportedSchema: true,
        error: `Versión de schema de catálogo no soportada: ${String(
          (rawJson as { schema: unknown }).schema
        )}`
      };
    }

    const catalog = CatalogSchema.parse(rawJson);
    return {
      catalog,
      etag: res.headers.get('etag') ?? undefined,
      notModified: false
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { catalog: null, notModified: false, error: msg };
  }
}
