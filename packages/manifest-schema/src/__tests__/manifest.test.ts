import { describe, it, expect } from 'vitest';
import { validateManifest, parseManifestJson, verifyIntegrity, isAllowedDestination } from '../index.js';
import crypto from 'node:crypto';

describe('Manifest Schema and Validation', () => {
  const validManifest = {
    id: 'godot-dialogue-system',
    name: 'Dialogue System',
    version: '1.2.0',
    type: 'godot_addon',
    description: 'Dialogue management system for narrative adventure games',
    author: 'Example Developer',
    license: 'MIT',
    compatibility: {
      godot: ['4.4', '4.5']
    },
    source: {
      provider: 'github',
      repository: 'example/dialogue-system',
      release: 'v1.2.0'
    },
    installation: {
      method: 'archive',
      destination: 'res://addons/dialogue_system'
    },
    dependencies: [],
    integrity: {
      algorithm: 'sha256',
      checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    },
    health_check: {
      type: 'file_validation',
      required_files: ['plugin.cfg']
    }
  };

  it('validates a correct manifest according to spec', () => {
    const result = validateManifest(validManifest);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe('godot-dialogue-system');
      expect(result.data.version).toBe('1.2.0');
    }
  });

  it('rejects path traversal in destination', () => {
    const maliciousManifest = {
      ...validManifest,
      installation: {
        method: 'archive',
        destination: 'res://addons/../../etc/cron.d'
      }
    };
    const result = validateManifest(maliciousManifest);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.some((e) => e.includes('Destination must not contain path traversal'))).toBe(true);
    }
  });

  it('rejects unapproved destination prefixes', () => {
    const unapprovedManifest = {
      ...validManifest,
      installation: {
        method: 'archive',
        destination: '/var/www/html'
      }
    };
    const result = validateManifest(unapprovedManifest);
    expect(result.success).toBe(false);
  });

  it('rejects invalid semver versions', () => {
    const invalidVer = {
      ...validManifest,
      version: 'v1.0' // semver should be 1.0.0 without leading v
    };
    const result = validateManifest(invalidVer);
    expect(result.success).toBe(false);
  });

  it('rejects non-kebab-case resource ID', () => {
    const invalidId = {
      ...validManifest,
      id: 'Dialogue_System_123'
    };
    const result = validateManifest(invalidId);
    expect(result.success).toBe(false);
  });

  it('rejects invalid sha256 checksum format', () => {
    const invalidChecksum = {
      ...validManifest,
      integrity: {
        algorithm: 'sha256',
        checksum: 'short_not_hex'
      }
    };
    const result = validateManifest(invalidChecksum);
    expect(result.success).toBe(false);
  });

  it('validates integrity correctly against SHA-256 buffer', () => {
    const content = Buffer.from('Hello DevDock World');
    const realSha256 = crypto.createHash('sha256').update(content).digest('hex');

    const validResult = verifyIntegrity(content, {
      algorithm: 'sha256',
      checksum: realSha256
    });
    expect(validResult).toBe(true);

    const invalidResult = verifyIntegrity(content, {
      algorithm: 'sha256',
      checksum: '0000000000000000000000000000000000000000000000000000000000000000'
    });
    expect(invalidResult).toBe(false);
  });

  it('checks allowed destination safely', () => {
    expect(isAllowedDestination('res://addons/my_addon')).toBe(true);
    expect(isAllowedDestination('.agents/skills/gdscript-expert')).toBe(true);
    expect(isAllowedDestination('res://addons/../escape')).toBe(false);
    expect(isAllowedDestination('/etc/shadow')).toBe(false);
  });

  it('parses JSON string manifest', () => {
    const jsonStr = JSON.stringify(validManifest);
    const result = parseManifestJson(jsonStr);
    expect(result.success).toBe(true);
  });
});
