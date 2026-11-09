import { z } from 'zod';
import type { ResourceManifest } from '@devdock/shared-types';

// Allowed destination prefixes for security
export const ALLOWED_DESTINATION_PREFIXES = [
  'res://addons/',
  'res://scripts/',
  'res://Scripts/',
  'res://shaders/',
  'res://scenes/',
  'res://assets/',
  '.agents/skills/',
  '.claude/skills/',
  '.devdock/'
] as const;

// SemVer RegEx
const SEMVER_REGEX = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

// Resource ID RegEx (kebab-case)
const RESOURCE_ID_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// SHA-256 / SHA-512 regex
const SHA256_REGEX = /^[a-fA-F0-9]{64}$/;
const SHA512_REGEX = /^[a-fA-F0-9]{128}$/;

export const ResourceTypeSchema = z.enum([
  'godot_addon',
  'ai_skill',
  'script_system',
  'shader_material',
  'graphic_asset',
  'tool'
]);

export const ResourceCompatibilitySchema = z.object({
  godot: z.array(z.string()).optional(),
  ai_agents: z.array(z.string()).optional(),
  operating_systems: z.array(z.enum(['linux', 'windows', 'macos'])).optional()
});

export const ResourceSourceSchema = z.object({
  provider: z.enum(['github', 'gitlab', 'direct_url', 'local']),
  repository: z.string().optional(),
  release: z.string().optional(),
  url: z.string().url().optional()
}).refine(
  (source) => {
    if (source.provider === 'github' || source.provider === 'gitlab') {
      return !!source.repository;
    }
    if (source.provider === 'direct_url') {
      return !!source.url && source.url.startsWith('https://');
    }
    return true;
  },
  {
    message: 'Repository is required for GitHub/GitLab sources, and direct_url must be HTTPS'
  }
);

export const ResourceIntegritySchema = z.object({
  algorithm: z.enum(['sha256', 'sha512']),
  checksum: z.string()
}).refine(
  (integrity) => {
    if (integrity.algorithm === 'sha256') {
      return SHA256_REGEX.test(integrity.checksum);
    }
    if (integrity.algorithm === 'sha512') {
      return SHA512_REGEX.test(integrity.checksum);
    }
    return false;
  },
  {
    message: 'Checksum must match the specified hash algorithm length and hex format'
  }
);

export const ResourceInstallationSchema = z.object({
  method: z.enum(['archive', 'single_file', 'directory_copy', 'skill_definition']),
  destination: z.string().min(1),
  strip_components: z.number().int().nonnegative().optional(),
  post_install_message: z.string().optional()
}).refine(
  (inst) => {
    // Prevent path traversal
    if (inst.destination.includes('..') || inst.destination.includes('\\')) {
      return false;
    }
    // Must start with allowed prefix
    return ALLOWED_DESTINATION_PREFIXES.some((prefix) =>
      inst.destination.startsWith(prefix)
    );
  },
  {
    message: `Destination must not contain path traversal ('..') and must start with one of: ${ALLOWED_DESTINATION_PREFIXES.join(', ')}`
  }
);

export const ResourceDependencySchema = z.object({
  id: z.string().regex(RESOURCE_ID_REGEX, 'Dependency ID must be valid kebab-case'),
  version_requirement: z.string().optional(),
  optional: z.boolean().optional()
});

export const ResourceHealthCheckSchema = z.object({
  type: z.enum(['file_validation', 'config_validation', 'manifest_validation', 'custom']),
  required_files: z.array(z.string().refine(
    (f) => !f.includes('..') && !f.startsWith('/'),
    { message: 'Required file path must not contain traversal or leading slash' }
  )).optional(),
  config_path: z.string().optional(),
  expected_keys: z.record(z.string(), z.string()).optional()
});

export const ResourceManifestSchema = z.object({
  id: z.string().regex(RESOURCE_ID_REGEX, 'ID must be kebab-case (e.g. godot-dialogue-system)'),
  name: z.string().min(2).max(100),
  version: z.string().regex(SEMVER_REGEX, 'Version must follow SemVer (e.g. 1.2.0)'),
  type: ResourceTypeSchema,
  description: z.string().min(10).max(1000),
  author: z.string().min(2).max(100),
  license: z.string().min(1).max(50),
  homepage: z.string().url().optional(),
  tags: z.array(z.string()).optional(),
  compatibility: ResourceCompatibilitySchema,
  source: ResourceSourceSchema,
  installation: ResourceInstallationSchema,
  dependencies: z.array(ResourceDependencySchema).optional(),
  integrity: ResourceIntegritySchema.optional(),
  health_check: ResourceHealthCheckSchema.optional()
});

export type ValidatedManifest = z.infer<typeof ResourceManifestSchema>;
