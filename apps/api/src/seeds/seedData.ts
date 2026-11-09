import { ResourceManifest } from '@devdock/shared-types';

export const SEED_CATEGORIES = [
  {
    id: 'godot-addons',
    name: 'Godot Addons',
    slug: 'godot-addons',
    description: 'Plugins and extensions for the Godot 4.x editor and game engine.',
    icon: 'cpu',
    resource_count: 1
  },
  {
    id: 'ai-skills',
    name: 'AI Agent Skills',
    slug: 'ai-skills',
    description: 'Context and instructions for AI agents like Antigravity, Claude Code, and Codex.',
    icon: 'bot',
    resource_count: 1
  },
  {
    id: 'shaders',
    name: 'Shaders & Materials',
    slug: 'shaders',
    description: 'Visual effects, screen shaders, and reusable materials.',
    icon: 'sparkles',
    resource_count: 1
  },
  {
    id: 'scripts',
    name: 'Scripts & Systems',
    slug: 'scripts',
    description: 'Modular game architecture, state machines, and gameplay controllers.',
    icon: 'code',
    resource_count: 0
  }
];

export const SEED_MANIFESTS: ResourceManifest[] = [
  {
    id: 'godot-dialogue-system',
    name: 'Dialogue Flow System',
    version: '1.2.0',
    type: 'godot_addon',
    description: 'Branching dialogue editor and runtime with portrait support and localization for Godot 4.x.',
    author: 'DevDock Team',
    license: 'MIT',
    homepage: 'https://github.com/example/dialogue-flow',
    tags: ['dialogue', 'narrative', 'ui', 'godot-4'],
    compatibility: {
      godot: ['4.2', '4.3', '4.4', '4.5', '4.8'],
      operating_systems: ['linux', 'windows', 'macos']
    },
    source: {
      provider: 'github',
      repository: 'devdock/dialogue-flow',
      release: 'v1.2.0',
      url: 'https://github.com/devdock/dialogue-flow/archive/refs/tags/v1.2.0.zip'
    },
    installation: {
      method: 'archive',
      destination: 'res://addons/dialogue_system',
      post_install_message: 'Enable Dialogue Flow System in Project -> Project Settings -> Plugins.'
    },
    integrity: {
      algorithm: 'sha256',
      checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    },
    health_check: {
      type: 'file_validation',
      required_files: ['plugin.cfg']
    }
  },
  {
    id: 'gdscript-architect-skill',
    name: 'GDScript Architect Agent Skill',
    version: '1.0.0',
    type: 'ai_skill',
    description: 'Comprehensive guidelines and idioms for AI coding assistants writing high-performance Godot 4 GDScript.',
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
      destination: '.agents/skills/gdscript-architect',
      post_install_message: 'Skill available to your AI assistant in .agents/skills/gdscript-architect.'
    },
    integrity: {
      algorithm: 'sha256',
      checksum: 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
    },
    health_check: {
      type: 'file_validation',
      required_files: ['SKILL.md']
    }
  },
  {
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
];
