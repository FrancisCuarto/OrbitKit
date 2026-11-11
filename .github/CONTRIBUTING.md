# Contributing to VGSkillFrame 🚀

First off, thanks for taking the time to contribute! ⭐

VGSkillFrame is the AI Skills, MCP servers and package manager ecosystem for
**Godot 4** and **Blender 3D** game developers. All contributions — bug
reports, new skills, MCP integrations, addons, docs and ideas — are welcome.

## 🧭 Ways to Contribute

| Type | Where |
|---|---|
| 🐛 Bug report | [Open a bug report](https://github.com/FrancisCuarto/OrbitKit/issues/new?template=bug_report.yml) |
| ✨ Feature request | [Open a feature request](https://github.com/FrancisCuarto/OrbitKit/issues/new?template=feature_request.yml) |
| 💬 Question / idea | [Start a discussion](https://github.com/FrancisCuarto/OrbitKit/discussions) |
| 🔒 Security issue | [Security policy](SECURITY.md) — do **not** open a public issue |

## 🛠️ Development Setup

**Prerequisites:** [Node.js ≥ 20](https://nodejs.org), [pnpm](https://pnpm.io)
(`corepack enable`), and Godot 4.x for plugin/skill testing.

```bash
git clone https://github.com/FrancisCuarto/OrbitKit.git
cd OrbitKit
pnpm install
pnpm build
```

### Useful Scripts

```bash
pnpm test                                           # All workspace tests (vitest)
pnpm lint                                           # Lint every package
pnpm build:catalog                                   # Regenerate catalog.json + skills/*.zip
pnpm --filter=@devdock/manifest-schema test         # Validate manifest schema
pnpm dev:web                                        # Local docs/web portal (Vite + React)
pnpm dev:api                                        # Local REST API (Express)
```

## 🌳 Branching Model

```text
feature/<name>  ───►  develop  ───►  stage  ───►  main (Production)
```

- Create `feature/<short-name>` branches off `develop`.
- Keep PRs focused: one feature or fix per PR.

## ✍️ Commit & PR Conventions

This project follows [Conventional Commits](https://www.conventionalcommits.org):

```text
feat(cli): add orbitkit mcp add command
fix(updater): verify checksum before atomic swap
docs: add blender-3d-pipeline skill guide
chore(web): update catalog badge
```

Scope hints: `cli`, `web`, `api`, `skills`, `godot`, `updater`, `docs`.

### Pull Request Checklist

- [ ] PR targets `develop` (not `main`)
- [ ] `pnpm lint` and `pnpm test` pass locally
- [ ] New/changed skills pass `pnpm --filter=@devdock/manifest-schema test`
- [ ] Docs updated if behavior changed
- [ ] No secrets or personal data in diffs or logs

## 🧠 Submitting a New AI Skill or MCP Server

1. **Create the skill** under `skills/<skill-id>/` with a `SKILL.md`
   (kebab-case id, Godot 4.3+ / Blender 4.x idioms only — no legacy Godot 3 syntax).
2. **Create a manifest (`manifest.json`)** satisfying the schema spec:
   - Valid kebab-case `id`
   - Valid SemVer `version` (e.g. `1.0.0`)
   - Permitted `destination` (e.g. `res://addons/your_addon/`, `.agents/skills/`)
   - Accurate SHA-256 integrity checksum
3. **Validate locally**:
   ```bash
   pnpm --filter=@devdock/manifest-schema test
   pnpm build:catalog
   ```
4. **Open a Pull Request** — community submissions undergo automated format
   checks and security review before inclusion in the catalog.

## 📦 Monorepo Map

```text
VGSkillFrame/
├── packages/
│   ├── cli/               # @francisiv/vgskillframe (published to NPM)
│   ├── manifest-schema/   # Zod manifest schema & security verification
│   └── shared-types/      # Shared TypeScript types & API contracts
├── apps/
│   ├── web/               # Documentation & web portal (Vite + React)
│   └── api/               # Central REST API (Express + Argon2id)
├── godot-plugin/
│   └── addons/vgskillframe/ # Native Godot 4 editor addon
├── skills/                # Curated AI skill sources (SKILL.md + manifest)
└── docs/                  # In-depth architecture & API guides
```

## 📄 License

By contributing, you agree that your contributions will be licensed under the
[MIT License](../LICENSE).
