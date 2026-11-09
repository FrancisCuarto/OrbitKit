import {
  ResourceSummary,
  ResourceDetail,
  CategorySummary,
  PaginatedResponse,
  ApiResponse
} from '@devdock/shared-types';

const API_BASE_URL = '/api';

export interface FetchResourcesParams {
  search?: string;
  type?: string;
  tag?: string;
  page?: number;
  limit?: number;
}

export const FALLBACK_RESOURCES: ResourceDetail[] = [
  {
    id: 'godot-dialogue-system',
    name: 'Dialogue Flow System',
    type: 'godot_addon',
    description: 'Branching dialogue editor and runtime with portrait support and localization for Godot 4.x.',
    author: 'DevDock Team',
    license: 'MIT',
    latest_version: '1.2.0',
    tags: ['dialogue', 'narrative', 'ui', 'godot-4'],
    downloads_count: 1420,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    versions: ['1.2.0', '1.1.0', '1.0.0'],
    manifest: {
      id: 'godot-dialogue-system',
      name: 'Dialogue Flow System',
      version: '1.2.0',
      type: 'godot_addon',
      description: 'Branching dialogue editor and runtime with portrait support and localization for Godot 4.x.',
      author: 'DevDock Team',
      license: 'MIT',
      homepage: 'https://github.com/devdock/dialogue-flow',
      tags: ['dialogue', 'narrative', 'ui', 'godot-4'],
      compatibility: {
        godot: ['4.2', '4.3', '4.4', '4.5', '4.8'],
        operating_systems: ['linux', 'windows', 'macos']
      },
      source: {
        provider: 'github',
        repository: 'devdock/dialogue-flow',
        release: 'v1.2.0'
      },
      installation: {
        method: 'archive',
        destination: 'res://addons/dialogue_system',
        post_install_message: 'Enable in Project -> Project Settings -> Plugins.'
      },
      integrity: {
        algorithm: 'sha256',
        checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
      },
      health_check: {
        type: 'file_validation',
        required_files: ['plugin.cfg']
      }
    }
  },
  {
    id: 'gdscript-architect-skill',
    name: 'GDScript Architect Agent Skill',
    type: 'ai_skill',
    description: 'Guidelines and idioms for AI coding assistants writing high-performance Godot 4 GDScript.',
    author: 'AI GameLab',
    license: 'Apache-2.0',
    latest_version: '1.0.0',
    tags: ['ai-skill', 'gdscript', 'architecture', 'antigravity'],
    downloads_count: 980,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    versions: ['1.0.0'],
    manifest: {
      id: 'gdscript-architect-skill',
      name: 'GDScript Architect Agent Skill',
      version: '1.0.0',
      type: 'ai_skill',
      description: 'Guidelines and idioms for AI coding assistants writing high-performance Godot 4 GDScript.',
      author: 'AI GameLab',
      license: 'Apache-2.0',
      tags: ['ai-skill', 'gdscript', 'architecture', 'antigravity'],
      compatibility: {
        ai_agents: ['antigravity', 'claude-code', 'codex'],
        godot: ['4.x']
      },
      source: {
        provider: 'github',
        repository: 'aigamelab/gdscript-architect',
        release: 'v1.0.0'
      },
      installation: {
        method: 'archive',
        destination: '.agents/skills/gdscript-architect'
      },
      integrity: {
        algorithm: 'sha256',
        checksum: 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
      },
      health_check: {
        type: 'file_validation',
        required_files: ['SKILL.md']
      }
    }
  },
  {
    id: 'retro-crt-shader',
    name: 'PSX CRT Screen Shader',
    type: 'shader_material',
    description: 'Authentic cathode-ray tube screen curvature, scanline, and phosphor glow post-processing shader for Godot 4.',
    author: 'PixelForge',
    license: 'MIT',
    latest_version: '2.0.0',
    tags: ['shader', 'crt', 'retro', 'post-processing'],
    downloads_count: 2150,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    versions: ['2.0.0', '1.0.0'],
    manifest: {
      id: 'retro-crt-shader',
      name: 'PSX CRT Screen Shader',
      version: '2.0.0',
      type: 'shader_material',
      description: 'Authentic cathode-ray tube screen curvature, scanline, and phosphor glow post-processing shader for Godot 4.',
      author: 'PixelForge',
      license: 'MIT',
      tags: ['shader', 'crt', 'retro', 'post-processing'],
      compatibility: {
        godot: ['4.2', '4.3', '4.4', '4.5', '4.8']
      },
      source: {
        provider: 'direct_url',
        url: 'https://cdn.example.com/shaders/retro-crt-v2.0.0.zip'
      },
      installation: {
        method: 'archive',
        destination: 'res://shaders/retro_crt'
      },
      integrity: {
        algorithm: 'sha256',
        checksum: 'a883dafc480d385504f94b5f770e54c000d70144d1787b3f0c66063e05230da5'
      },
      health_check: {
        type: 'file_validation',
        required_files: ['crt.gdshader']
      }
    }
  }
];

export const FALLBACK_CATEGORIES: CategorySummary[] = [
  {
    id: 'godot-addons',
    name: 'Godot Addons',
    slug: 'godot-addons',
    description: 'Plugins and extensions integrated into the Godot 4 editor.',
    resource_count: 1,
    icon: 'cpu'
  },
  {
    id: 'ai-skills',
    name: 'AI Agent Skills',
    slug: 'ai-skills',
    description: 'Context, rules and workflows for AI agents (Antigravity, Claude Code, Codex).',
    resource_count: 1,
    icon: 'bot'
  },
  {
    id: 'shaders',
    name: 'Shaders & Materials',
    slug: 'shaders',
    description: 'Visual post-processing, spatial materials and visual effects.',
    resource_count: 1,
    icon: 'sparkles'
  },
  {
    id: 'scripts',
    name: 'Scripts & Systems',
    slug: 'scripts',
    description: 'Modular game mechanics, state machines, and character controllers.',
    resource_count: 0,
    icon: 'code'
  }
];

export async function fetchResources(
  params: FetchResourcesParams = {}
): Promise<{ items: ResourceSummary[]; total: number; isFallback?: boolean }> {
  try {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.type && params.type !== 'all') query.set('type', params.type);
    if (params.tag) query.set('tag', params.tag);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));

    const res = await fetch(`${API_BASE_URL}/resources?${query.toString()}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);

    const body: PaginatedResponse<ResourceSummary> = await res.json();
    return { items: body.data, total: body.meta.total, isFallback: false };
  } catch {
    // Graceful offline fallback
    let items = FALLBACK_RESOURCES;
    if (params.search) {
      const q = params.search.toLowerCase();
      items = items.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (params.type && params.type !== 'all') {
      items = items.filter((r) => r.type === params.type);
    }
    return { items, total: items.length, isFallback: true };
  }
}

export async function fetchResourceDetail(id: string): Promise<ResourceDetail | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/resources/${id}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);

    const body: ApiResponse<ResourceDetail> = await res.json();
    return body.data;
  } catch {
    const found = FALLBACK_RESOURCES.find((r) => r.id === id);
    return found || null;
  }
}

export async function fetchCategories(): Promise<{ items: CategorySummary[]; isFallback?: boolean }> {
  try {
    const res = await fetch(`${API_BASE_URL}/categories`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);

    const body: ApiResponse<CategorySummary[]> = await res.json();
    return { items: body.data, isFallback: false };
  } catch {
    return { items: FALLBACK_CATEGORIES, isFallback: true };
  }
}
