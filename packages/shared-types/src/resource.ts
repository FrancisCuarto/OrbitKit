/**
 * Types of resources supported by DevDock
 */
export type ResourceType =
  | 'godot_addon'
  | 'ai_skill'
  | 'script_system'
  | 'shader_material'
  | 'graphic_asset'
  | 'tool';

/**
 * Local installation states as specified in DevDock architecture
 */
export type InstallStatus =
  | 'Available'
  | 'Installing'
  | 'Installed'
  | 'Update Available'
  | 'Outdated'
  | 'Warning'
  | 'Failed'
  | 'Disabled'
  | 'Incompatible';

/**
 * Source provider types
 */
export type SourceProvider = 'github' | 'gitlab' | 'direct_url' | 'local';

/**
 * Installation method
 */
export type InstallMethod =
  | 'archive'
  | 'single_file'
  | 'directory_copy'
  | 'skill_definition';

/**
 * Health check type
 */
export type HealthCheckType =
  | 'file_validation'
  | 'config_validation'
  | 'manifest_validation'
  | 'custom';

export interface ResourceHealthCheck {
  type: HealthCheckType;
  required_files?: string[];
  config_path?: string;
  expected_keys?: Record<string, string>;
}

export interface ResourceCompatibility {
  godot?: string[];
  ai_agents?: string[];
  operating_systems?: ('linux' | 'windows' | 'macos')[];
}

export interface ResourceSource {
  provider: SourceProvider;
  repository?: string;
  release?: string;
  url?: string;
}

export interface ResourceIntegrity {
  algorithm: 'sha256' | 'sha512';
  checksum: string;
}

export interface ResourceInstallation {
  method: InstallMethod;
  destination: string;
  strip_components?: number;
  post_install_message?: string;
}

export interface ResourceDependency {
  id: string;
  version_requirement?: string;
  optional?: boolean;
}

/**
 * Complete DevDock Resource Manifest definition
 */
export interface ResourceManifest {
  id: string;
  name: string;
  version: string;
  type: ResourceType;
  description: string;
  author: string;
  license: string;
  homepage?: string;
  tags?: string[];
  compatibility: ResourceCompatibility;
  source: ResourceSource;
  installation: ResourceInstallation;
  dependencies?: ResourceDependency[];
  integrity?: ResourceIntegrity;
  health_check?: ResourceHealthCheck;
}

/**
 * Local installation record stored on user's machine
 */
export interface LocalInstallationRecord {
  resource_id: string;
  installed_version: string;
  status: InstallStatus;
  installed_at: string;
  updated_at: string;
  installed_files: string[];
  destination_path: string;
  last_health_check?: {
    passed: boolean;
    checked_at: string;
    details?: string;
  };
}
