import { ResourceManifestSchema, ALLOWED_DESTINATION_PREFIXES } from './schema.js';
import type { ResourceManifest, ResourceIntegrity } from '@devdock/shared-types';
import crypto from 'node:crypto';

export interface ValidationSuccess {
  success: true;
  data: ResourceManifest;
}

export interface ValidationFailure {
  success: false;
  errors: string[];
}

export type ManifestValidationResult = ValidationSuccess | ValidationFailure;

/**
 * Validates a resource manifest object against the schema and security policies
 */
export function validateManifest(manifest: unknown): ManifestValidationResult {
  const result = ResourceManifestSchema.safeParse(manifest);
  if (!result.success) {
    const errorMessages = result.error.errors.map(
      (err) => `${err.path.join('.')}: ${err.message}`
    );
    return {
      success: false,
      errors: errorMessages
    };
  }

  return {
    success: true,
    data: result.data as ResourceManifest
  };
}

/**
 * Parses and validates a JSON string manifest
 */
export function parseManifestJson(jsonString: string): ManifestValidationResult {
  try {
    const parsed = JSON.parse(jsonString);
    return validateManifest(parsed);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Invalid JSON format';
    return {
      success: false,
      errors: [`JSON Parse Error: ${msg}`]
    };
  }
}

/**
 * Verifies if destination path meets security boundaries
 */
export function isAllowedDestination(destination: string): boolean {
  if (typeof destination !== 'string') return false;
  if (destination.includes('..') || destination.includes('\\')) return false;
  return ALLOWED_DESTINATION_PREFIXES.some((prefix) => destination.startsWith(prefix));
}

/**
 * Verifies integrity of downloaded buffer against manifest checksum
 */
export function verifyIntegrity(
  buffer: Buffer,
  integrity: ResourceIntegrity
): boolean {
  const hash = crypto.createHash(integrity.algorithm);
  hash.update(buffer);
  const calculatedHex = hash.digest('hex');
  return calculatedHex.toLowerCase() === integrity.checksum.toLowerCase();
}
