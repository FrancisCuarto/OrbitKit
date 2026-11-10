# OrbitKit — Sistema de chequeo y auto-actualización continua

> **Tipo:** Implementation brief / handoff
> **Objetivo:** que OrbitKit detecte skills nuevas, actualice las instaladas y avise cuando hay una versión nueva (de skills o del CLI), de forma continua y sin intervención manual.
> **Branch sugerida:** `feature/auto-update-system` (desde `develop`, PR a `develop`).

---

## 1. Contexto del repo

Monorepo pnpm + TypeScript ESM (`module: NodeNext`), Node 20+.

| Ruta | Contenido |
|---|---|
| `packages/cli` | CLI `@francisiv/orbitkit` (commander + ora + picocolors + zod + adm-zip) |
| `packages/manifest-schema` | Zod schemas, verificación SHA-256, defensa Zip Slip |
| `packages/shared-types` | Tipos compartidos |
| `apps/api` | Express + Mongoose. Ya tiene `Resource` y `ResourceVersion` con `verified` |
| `apps/web` | Portal Vite + React |
| `godot-plugin/addons/devdock` | Plugin nativo Godot 4 (dock) |

### Estado actual (lo que hay que cambiar)

- `packages/cli/src/core/skillsManager.ts` → `CURATED_SKILLS` está **hardcodeado** en TS. El CLI solo conoce skills nuevas si se publica una versión nueva del CLI.
- `checkSkillUpdates(projectDir)` compara lo instalado contra `CURATED_SKILLS`. **No detecta skills que no están instaladas en el proyecto.**
- `installSkill(projectDir, skillId)` escribe desde el array en memoria; no descarga ni verifica checksums.
- `packages/cli/src/core/selfUpdater.ts` → `checkCliVersion()` ya consulta npm registry + GitHub raw, pero solo se usa al ejecutar `upgrade` o `update` manualmente.
- `packages/cli/src/core/updater.ts` → `updateProject()` / `updateAllProjects()` existen y funcionan, pero son on-demand.
- `packages/cli/src/cli.ts` → `.version('0.5.0')` está hardcodeado y hay que sincronizarlo con `packages/cli/package.json`.
- No hay estado persistente, ni caché, ni notificaciones, ni daemon, ni scheduler.

### Convenciones obligatorias

- Imports ESM con extensión `.js` (ej: `import { foo } from './bar.js'`).
- `node:` prefix para builtins (`node:fs/promises`, `node:path`, `node:crypto`).
- `strict: true`. Nada de `any` sin justificar.
- Tests con Vitest en `packages/cli/src/__tests__/`.
- No agregar dependencias nuevas si se resuelve con Node builtins. Si hace falta semver con prereleases, proponer `semver` + `@types/semver` y justificarlo en el PR.
- Comentarios y docs en el estilo existente. Mensajes user-facing en español (consistente con `selfUpdater.ts`).

---

## 2. Alcance

### Dentro del alcance

1. Catálogo remoto versionado (`catalog.json`) como fuente de verdad.
2. Motor de diff: skills nuevas, skills desactualizadas, versión del CLI.
3. Estado persistente con caché + ETag + dedupe de notificaciones.
4. Trigger pasivo en cada invocación del CLI (background, no bloqueante).
5. Comando `orbitkit check [--json] [--force]`.
6. Comando `orbitkit watch` (daemon foreground).
7. `orbitkit autoupdate enable|disable` (systemd / launchd / schtasks).
8. Notificaciones: terminal, escritorio, archivo marcador para el plugin Godot.
9. Aplicación segura de updates: checksum, backup, escritura atómica, rollback, política major.

### Fuera del alcance (para este PR)

- Interfaz web para gestionar el catálogo.
- Firma criptográfica asimétrica del catálogo (dejar preparado el campo, no implementar).
- Auto-update del CLI sin confirmación (solo notificar; opt-in explícito).
- Migración de todas las skills a archivos remotos: se hace en Fase 0, pero manteniendo `CURATED_SKILLS` como fallback bundled.

---

## 3. Arquitectura

```
┌──────────────────┐   HTTPS + ETag   ┌───────────────────┐
│  catalog.json    │◄────────────────│  updateChecker.ts │
│  (repo o API)    │                  └─────────┬─────────┘
└──────────────────┘                            │ diff
                                     ┌──────────▼──────────┐
                                     │  state.json (caché) │
                                     │  + config.json      │
                                     └──────┬───────┬──────┘
                                            │       │
                              ┌─────────────▼─┐   ┌─▼──────────────┐
                              │ notifier.ts   │   │ updater.ts     │
                              │ terminal/     │   │ apply seguro   │
                              │ desktop/marker│   │ backup+rollback│
                              └───────────────┘   └────────────────┘
```

### Disparadores

| # | Disparador | Cuándo | Coste |
|---|---|---|---|
| A | Hook pasivo en cada comando | Al usar el CLI, si `now >= nextCheckAt` | 1 request con ETag, en child process detached |
| B | `orbitkit watch` | Daemon foreground, intervalo con jitter | Proceso vivo |
| C | `orbitkit autoupdate enable` | systemd/launchd/schtasks cada N horas | 0 procesos residentes |
| D | Plugin Godot | Timer 30 min leyendo `.devdock/update-available.json` | Sin red |

**Regla de oro:** el chequeo pasivo **nunca** bloquea ni retrasa el comando. Se lanza un proceso hijo detached, y el banner se pinta desde la caché.

---

## 4. Contrato del catálogo

`catalog.json` en la raíz del repo, generado en CI por release (ver §12).

```json
{
  "schema": 1,
  "generatedAt": "2026-11-10T12:00:00Z",
  "cli": {
    "latest": "0.6.0",
    "minSupported": "0.5.0",
    "channel": "stable"
  },
  "skills": [
    {
      "id": "godot4-syntax-guardian",
      "name": "Godot 4 Syntax Guardian (Anti-Hallucination)",
      "version": "1.4.0",
      "description": "Enforces strict Godot 4.3+ rules…",
      "checksum": "sha256:9f2c…",
      "url": "https://raw.githubusercontent.com/FrancisCuarto/OrbitKit/main/skills/godot4-syntax-guardian.zip",
      "tags": ["syntax", "core"],
      "minGodot": "4.3",
      "channel": "stable"
    }
  ]
}
```

**Reglas del contrato**

- `schema: 1` obligatorio. Si el CLI no soporta esa versión, ignora el catálogo y avisa.
- `checksum` con formato `sha256:<hex>` (o `sha512:`). Sin checksum → no se instala.
- `minGodot`: si el proyecto declara una versión menor en `project.godot`, la skill no se ofrece.
- `channel`: `stable` | `beta`. Por defecto solo se consume `stable`.
- `generatedAt` se usa para mostrar "catálogo del …" en `check --json`.
- Compatibilidad con `apps/api`: una futura ruta `GET /api/catalog` debe devolver el mismo shape, agregando `Resource` + última `ResourceVersion` con `verified: true`. No implementar en este PR salvo que sobre tiempo (ver §12).

---

## 5. Archivos nuevos

| Archivo | Responsabilidad |
|---|---|
| `packages/cli/src/core/paths.ts` | Resolver rutas XDG (`configDir`, `stateDir`, `cacheDir`) cross-platform |
| `packages/cli/src/core/config.ts` | Leer/escribir config con defaults y validación Zod |
| `packages/cli/src/core/catalog.ts` | `CatalogSchema`, `fetchCatalog()` con ETag + timeout |
| `packages/cli/src/core/state.ts` | `OrbitKitState`, `readState()`, `writeState()` atómico |
| `packages/cli/src/core/updateChecker.ts` | `checkForUpdates()` → `UpdateReport` |
| `packages/cli/src/core/notifier.ts` | Terminal, desktop notify, marker file, dedupe |
| `packages/cli/src/core/background.ts` | `shouldBackgroundCheck()`, `scheduleBackgroundCheck()`, `printCachedBanner()` |
| `packages/cli/src/core/checkWorker.ts` | Entrypoint del child process (`node dist/core/checkWorker.js`) |
| `packages/cli/src/core/applier.ts` | `applyUpdates()` con checksum, backup, rollback |
| `packages/cli/src/core/scheduler.ts` | systemd / launchd / schtasks enable/disable |
| `packages/cli/src/core/skillSource.ts` | Descargar skill remota, verificar checksum, extraer con defensas |
| `catalog.json` | Catálogo publicado (raíz) |
| `scripts/build-catalog.mjs` | Genera `catalog.json` + checksums desde `skills/` |
| `skills/<id>/SKILL.md` + `skill.json` | Skills como archivos (Fase 0) |

## 6. Archivos modificados

| Archivo | Cambio |
|---|---|
| `packages/cli/src/cli.ts` | `.version()` desde package.json; comandos `check`, `watch`, `autoupdate`; hooks de background/banner |
| `packages/cli/src/core/skillsManager.ts` | `installSkill()` acepta `SkillSource` (bundled o remoto); `checkSkillUpdates(projectDir, catalog?)` usa catálogo si está disponible |
| `packages/cli/src/core/updater.ts` | Reutiliza `checkForUpdates`; añade backups; respeta política de versiones |
| `packages/cli/src/index.ts` | Exportar los nuevos módulos |
| `packages/cli/package.json` | Script `build:catalog`; sin deps nuevas si es posible |
| `docs/cli.md` | Documentar `check`, `watch`, `autoupdate`, env vars |
| `docs/architecture.md` | Añadir el catálogo y el flujo de updates |
| `README.md` | Sección "Auto-updates & notifications" |

---

## 7. Tipos y API interna (contratos exactos)

```ts
// core/paths.ts
export function configDir(): string;   // XDG_CONFIG_HOME || ~/.config  (+ /orbitkit)
export function stateDir(): string;    // XDG_STATE_HOME  || ~/.local/state (+ /orbitkit)
export function cacheDir(): string;    // XDG_CACHE_HOME  || ~/.cache      (+ /orbitkit)
```

```ts
// core/catalog.ts
export const CatalogSchema; // zod
export type Catalog = z.infer<typeof CatalogSchema>;
export type CatalogSkill = Catalog['skills'][number];

export async function fetchCatalog(
  url: string,
  etag?: string,
  timeoutMs?: number
): Promise<{ catalog: Catalog | null; etag?: string; notModified: boolean }>;
```

```ts
// core/state.ts
export interface OrbitKitState {
  schemaVersion: 1;
  etag?: string;
  lastCheckAt?: number;
  nextCheckAt?: number;
  consecutiveFailures: number;
  catalog?: Catalog;
  notified: Record<string, string>; // "skill:<id>@<ver>" | "cli@<ver>" -> ISO
}

export async function readState(): Promise<OrbitKitState>;
export async function writeState(state: OrbitKitState): Promise<void>; // tmp + rename, 0600
```

```ts
// core/updateChecker.ts
export interface UpdateReport {
  checkedAt: number;
  offline: boolean;
  fromCache: boolean;
  catalogGeneratedAt?: string;
  cli?: {
    current: string;
    latest: string;
    updateAvailable: boolean;
    major: boolean;
    belowMin: boolean;
  };
  newSkills: CatalogSkill[];
  outdatedSkills: { id: string; from: string; to: string }[];
  errors: string[];
}

export async function checkForUpdates(
  projectDir: string,
  opts?: { force?: boolean; catalogUrl?: string }
): Promise<UpdateReport>;
```

```ts
// core/notifier.ts
export async function notify(
  report: UpdateReport,
  opts?: { terminal?: boolean; desktop?: boolean; projectDir?: string }
): Promise<{ notified: string[] }>; // vacío si todo ya fue notificado
```

```ts
// core/applier.ts
export interface ApplyOptions {
  autoUpdateSkills: boolean;
  autoInstallNewSkills: boolean;
  autoUpdateMcps: boolean;
  autoUpdateCli: boolean;
  allowMajor: boolean;
}
export interface ApplyResult {
  applied: string[];
  skipped: string[];
  failed: { id: string; reason: string }[];
  backupDir?: string;
}
export async function applyUpdates(
  projectDir: string,
  report: UpdateReport,
  opts: ApplyOptions
): Promise<ApplyResult>;
```

```ts
// core/background.ts
export function shouldBackgroundCheck(): boolean;
export function scheduleBackgroundCheck(): void;
export async function printCachedBanner(): Promise<void>;
```

---

## 8. Implementación de referencia

### 8.1 `core/catalog.ts`

```ts
import { z } from 'zod';

const SkillSchema = z.object({
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
): Promise<{ catalog: Catalog | null; etag?: string; notModified: boolean }> {
  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
        ...(etag ? { 'If-None-Match': etag } : {})
      },
      signal: AbortSignal.timeout(timeoutMs)
    });

    if (res.status === 304) return { catalog: null, etag, notModified: true };
    if (!res.ok) return { catalog: null, notModified: false };

    return {
      catalog: CatalogSchema.parse(await res.json()),
      etag: res.headers.get('etag') ?? undefined,
      notModified: false
    };
  } catch {
    return { catalog: null, notModified: false }; // offline, timeout o JSON inválido
  }
}
```

### 8.2 `core/state.ts` (escritura atómica)

```ts
import fs from 'node:fs/promises';
import path from 'node:path';
import { stateDir } from './paths.js';

const STATE_FILE = () => path.join(stateDir(), 'state.json');

const DEFAULT_STATE: OrbitKitState = {
  schemaVersion: 1,
  consecutiveFailures: 0,
  notified: {}
};

export async function readState(): Promise<OrbitKitState> {
  try {
    const raw = await fs.readFile(STATE_FILE(), 'utf8');
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STATE, ...parsed, schemaVersion: 1 };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

export async function writeState(state: OrbitKitState): Promise<void> {
  const dir = stateDir();
  await fs.mkdir(dir, { recursive: true });
  const tmp = path.join(dir, `.state.${process.pid}.tmp`);
  await fs.writeFile(tmp, JSON.stringify(state, null, 2), { encoding: 'utf8', mode: 0o600 });
  await fs.rename(tmp, STATE_FILE()); // atómico
}
```

### 8.3 `core/updateChecker.ts`

Lógica clave:

1. Si `!force && now < nextCheckAt` → construir report desde `state.catalog` con `fromCache: true` (0 requests).
2. `fetchCatalog(url, state.etag)`.
3. Si `notModified` → usar `state.catalog`.
4. Si fallo → usar `state.catalog`, marcar `offline: true`, `consecutiveFailures++`, backoff.
5. Si éxito → parsear skills instaladas, calcular diff, actualizar `nextCheckAt` con jitter, resetear failures.
6. Nunca lanzar: todo en `try/catch`, errores al array `errors`.

```ts
const BASE_INTERVAL = cfg.check.intervalMinutes * 60_000;
const nextWithJitter = () =>
  Date.now() + Math.round(BASE_INTERVAL * (0.85 + Math.random() * 0.3));

const backoff = (failures: number) =>
  Math.min(BASE_INTERVAL * 2 ** Math.min(failures, 4), 7 * 24 * 60 * 60_000);
```

Diff:

```ts
const installed = await readInstalledSkills(projectDir); // lee .agents/skills/*/skill.json
const installedIds = new Set(installed.map((s) => s.id));

const newSkills = catalog.skills.filter(
  (s) => s.channel === 'stable' && !installedIds.has(s.id) && meetsGodot(s, projectDir)
);

const outdatedSkills = installed.flatMap((local) => {
  const remote = catalog.skills.find((s) => s.id === local.id);
  if (!remote) return [];
  return compareSemver(remote.version, local.version) > 0
    ? [{ id: local.id, from: local.version, to: remote.version }]
    : [];
});
```

CLI:

```ts
const current = await getCurrentCliVersion();
const updateAvailable = compareSemver(catalog.cli.latest, current) > 0;
const major = Number(catalog.cli.latest.split('.')[0]) > Number(current.split('.')[0]);
const belowMin = compareSemver(current, catalog.cli.minSupported) < 0;
```

> Reutilizar `compareSemver` y `getCurrentCliVersion` de `core/selfUpdater.ts`. Si se necesita soportar prereleases, mover la comparación a `core/semver.ts` con tests propios.

`meetsGodot()`: leer `config/features=PackedStringArray("4.3", …)` de `project.godot` (ya lo hace `inspectProject`), comparar `major.minor` contra `minGodot`. Si no se puede determinar, no filtrar.

### 8.4 `core/notifier.ts`

- Claves de dedupe: `skill:<id>@<version>`, `cli@<version>`.
- Solo notificar cada clave una vez. Persistir `state.notified`.
- Terminal: una sola línea + detalle (ver §10).
- Desktop: `notify-send` / `osascript` / PowerShell, `spawn(..., { stdio: 'ignore' }).unref()`, ignorar errores.
- Marker: escribir `<projectDir>/.devdock/update-available.json` con `{ checkedAt, cli, newSkills, outdatedSkills }`.
- Respetar `NO_COLOR` (picocolors ya lo hace) y `--json` (no banner).

### 8.5 `core/background.ts`

```ts
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const WORKER = fileURLToPath(new URL('./checkWorker.js', import.meta.url));

export function shouldBackgroundCheck(): boolean {
  if (process.env.ORBITKIT_NO_UPDATE_CHECK) return false;
  if (process.env.ORBITKIT_WORKER) return false;
  if (process.env.CI) return false;
  if (!process.stdout.isTTY) return false;
  return true;
}

export function scheduleBackgroundCheck(): void {
  // detached + unref: no bloquea el comando y sobrevive al exit del padre
  const child = spawn(process.execPath, [WORKER, '--quiet'], {
    detached: true,
    stdio: 'ignore',
    env: { ...process.env, ORBITKIT_WORKER: '1' }
  });
  child.unref();
}
```

`printCachedBanner()` lee `state.json` (≈1 ms), compara contra lo ya notificado y pinta. **No hace red.**

Hook en `cli.ts`:

```ts
if (shouldBackgroundCheck()) scheduleBackgroundCheck();
program.hook('postAction', async () => {
  if (!process.argv.includes('--json')) await printCachedBanner();
});
```

### 8.6 `core/checkWorker.ts`

```ts
import { checkForUpdates } from './updateChecker.js';
import { notify } from './notifier.js';
import { applyUpdates } from './applier.js';
import { readConfig } from './config.js';

const quiet = process.argv.includes('--quiet');

(async () => {
  const cfg = await readConfig();
  const report = await checkForUpdates(process.cwd());
  await notify(report, cfg.notify);

  if (cfg.autoUpdate.skills || cfg.autoUpdate.cli) {
    await applyUpdates(process.cwd(), report, cfg.autoUpdate);
  }
  if (!quiet && report.offline) process.exitCode = 0; // silencio si offline
})();
```

### 8.7 `core/applier.ts`

Orden seguro:

1. Validar que el catálogo tenga `url` + `checksum`.
2. Descargar a memoria/tmp con timeout.
3. `verifyIntegrity()` de `@devdock/manifest-schema` (crypto built-in).
4. Extraer con `adm-zip` validando cada entry contra path traversal (reutilizar `isAllowedDestination`).
5. Backup: copiar `.agents/skills/<id>` y `.claude/skills/<id>` a `<projectDir>/.devdock/backups/<ISO-ts>/<id>/`.
6. Escribir en tmp y `rename` atómico.
7. Actualizar `.devdock/installed.json` (registro que ya lee `scanner.ts`).
8. Si algo falla: restaurar backup y registrar en `failed`.
9. Política: solo `patch`/`minor` salvo `allowMajor`.

### 8.8 `core/scheduler.ts`

`orbitkit autoupdate enable --every 6h`:

| SO | Artefacto | Activación |
|---|---|---|
| Linux | `~/.config/systemd/user/orbitkit-check.{service,timer}` | `systemctl --user daemon-reload && systemctl --user enable --now orbitkit-check.timer` |
| macOS | `~/Library/LaunchAgents/dev.orbitkit.check.plist` | `launchctl load -w …` |
| Windows | `schtasks /create /tn OrbitKitCheck /sc hourly /tr "orbitkit check --quiet --notify" /f` | idem |

El comando del scheduler debe ser `orbitkit check --quiet --notify` (no `update`). Nunca auto-instalar desde el scheduler salvo config explícita.

`disable` elimina el artefacto y hace `systemctl --user disable --now` / `launchctl unload` / `schtasks /delete`.

---

## 9. Configuración

Ruta: `configDir()/config.json`, override por `ORBITKIT_CONFIG`.
Override por proyecto opcional: `<projectDir>/.orbitkitrc.json` (merge superficial, gana el de proyecto).

```json
{
  "catalogUrl": "https://raw.githubusercontent.com/FrancisCuarto/OrbitKit/main/catalog.json",
  "check": {
    "onCliStart": true,
    "intervalMinutes": 720,
    "timeoutMs": 2500
  },
  "autoUpdate": {
    "skills": true,
    "newSkills": false,
    "mcps": false,
    "cli": false,
    "allowMajor": false
  },
  "notify": {
    "terminal": true,
    "desktop": true
  },
  "channel": "stable"
}
```

Validar con Zod, aplicar defaults, **nunca** fallar el CLI por config inválida (log en `errors` y usar defaults).

Variables de entorno:

| Variable | Efecto |
|---|---|
| `ORBITKIT_NO_UPDATE_CHECK=1` | Desactiva todo chequeo automático |
| `ORBITKIT_CATALOG_URL` | Override del catálogo (tests/enterprise) |
| `ORBITKIT_CONFIG` | Override de la ruta de config |
| `CI` | Desactiva chequeo pasivo |
| `NO_COLOR` | Sin color (ya soportado) |

---

## 10. UX y mensajes

`orbitkit check`:

```
OrbitKit Check · catálogo 2026-11-10T12:00Z

  CLI          v0.5.0 → v0.6.0   (actualización disponible)
  Skills       2 nuevas, 1 desactualizada
    + godot-dialogue-system v1.0.0
    + godot-inventory-ui     v1.0.0
    ↑ godot4-syntax-guardian v1.3.0 → v1.4.0

  Ejecuta `orbitkit update --all` para aplicar.
```

Banner pasivo (máx. 1 línea + 1 de acción):

```
⬆  3 novedades en OrbitKit (2 skills nuevas, CLI v0.6.0) · orbitkit update --all
```

`check --json` → `UpdateReport` serializado, sin banner ni spinner (para CI/plugin).

Estados:

| Estado | Mensaje |
|---|---|
| offline + caché | sin banner (silencio), `check` muestra "sin conexión, usando catálogo del …" |
| CLI < `minSupported` | `⚠ Tu OrbitKit v0.5.0 es anterior al mínimo soportado (0.5.1). Actualiza para continuar.` |
| major disponible | `⚠ Hay una major nueva (v1.0.0). No se aplicará automáticamente.` |
| sin novedades | `✓ Todo en órbita. Sin novedades.` |

---

## 11. Tests (Vitest, sin red real)

Inyectar `fetch` vía parámetro o `vi.stubGlobal('fetch', …)`. Usar `mkdtemp` como en `cli.test.ts`.

| Test | Qué verifica |
|---|---|
| `catalog: 304` | `notModified: true`, usa caché, no reescribe catálogo |
| `catalog: JSON inválido` | devuelve `null`, no lanza |
| `catalog: timeout` | `offline: true` con `AbortSignal` |
| `checker: skill nueva` | aparece en `newSkills`, no en `outdatedSkills` |
| `checker: desactualizada` | `from`/`to` correctos |
| `checker: minGodot` | skill con `minGodot: "4.4"` se filtra en proyecto 4.3 |
| `checker: CLI major` | `major: true` y `applyUpdates` la saltea |
| `notifier: dedupe` | dos llamadas seguidas → segunda devuelve `notified: []` |
| `notifier: dedupe por versión` | versión nueva sí vuelve a notificar |
| `state: atómico` | escribir 2 veces no deja `.tmp` |
| `applier: checksum inválido` | no escribe, restaura backup, `failed` con razón |
| `applier: rollback` | contenido original intacto tras fallo |
| `scheduler: enable idempotente` | dos `enable` no duplican unidades |
| `env: CI` | `shouldBackgroundCheck()` false |
| `docs/version` | `getCurrentCliVersion()` coincide con `package.json` y con `.version()` |

Comando: `pnpm --filter @francisiv/orbitkit test`.

---

## 12. Fase 0 — skills como archivos (prerrequisito)

Hoy las skills viven dentro de `skillsManager.ts`. Para instalar desde catálogo remoto hacen falta artefactos:

```
skills/
  godot4-syntax-guardian/
    SKILL.md        # frontmatter: name, id, version, description
    skill.json      # { id, name, version, updated_at }
```

- `scripts/build-catalog.mjs`: recorre `skills/`, calcula `sha256` del zip/tar determinista, escribe `catalog.json` ordenado por `id`.
- CI (`.github/workflows/release.yml`): en tag `v*`, corre `build-catalog` y commitea/adjunta `catalog.json` + `skills/*.zip`.
- `skillsManager.ts` mantiene `CURATED_SKILLS` como **fallback bundled** para `init` offline. `installSkill()`:

```ts
export async function installSkill(
  projectDir: string,
  skillId: string,
  source?: CatalogSkill
): Promise<{ success: boolean; version: string; message: string }>;
```

Si `source?.url` existe → descarga + verifica + extrae; si no → usa bundled.

> No romper los tests existentes: `installSkill(dir, 'gdscript-architect')` debe seguir funcionando sin `source`.

---

## 13. Seguridad (no negociable)

- Solo HTTPS en `catalogUrl` (rechazar `http:` salvo `localhost` en tests).
- Checksum obligatorio para instalación remota; si falta, `failed` con razón.
- Validar cada entry del ZIP contra traversal (`..`, absolutos, `\`) antes de extraer; reutilizar `isAllowedDestination`.
- Destinos permitidos: `.agents/skills/`, `.claude/skills/`, `addons/`. Nada fuera del proyecto.
- Escritura atómica siempre (tmp + rename).
- Backup antes de sobrescribir; rollback automático en fallo.
- **Nunca** ejecutar código del catálogo.
- Limitar tamaño de descarga (ej. 10 MB) y número de entries del ZIP.
- Timeouts en todas las requests (`AbortSignal.timeout`).
- `chmod 0600` para `state.json` y `config.json`.
- No loggear tokens ni rutas de usuario en `--json`.

---

## 14. Checklist de implementación

### Fase 0 — artefactos
- [x] `skills/<id>/SKILL.md` + `skill.json` para las 10 skills actuales
- [x] `scripts/build-catalog.mjs` con checksums
- [x] `catalog.json` generado y commiteado
- [x] CI publica `catalog.json` en cada tag
- [x] `installSkill()` acepta `source` sin romper firma actual

### Fase 1 — núcleo
- [x] `paths.ts`, `config.ts`, `catalog.ts`, `state.ts`, `updateChecker.ts`
- [x] `orbitkit check [--json] [--force]`
- [x] Tests de catálogo, diff, estado, offline

### Fase 2 — notificaciones
- [x] `notifier.ts` con dedupe
- [x] `background.ts` + `checkWorker.ts`
- [x] Hook pasivo en `cli.ts` + banner desde caché
- [x] `notify-send` / `osascript` / PowerShell
- [x] Marker `.devdock/update-available.json`
- [x] Tests de dedupe y env vars

### Fase 3 — continuo
- [x] `orbitkit watch --interval --auto-update --notify`
- [x] `orbitkit autoupdate enable|disable` (3 SO)
- [x] Lock de instancia (`~/.orbitkit/check.lock`)
- [x] Backoff + jitter
- [x] Tests con timers falsos

### Fase 4 — aplicar
- [x] `applier.ts` (checksum, backup, rollback, política major)
- [x] `update --all` usa el nuevo motor
- [x] Registro `.devdock/installed.json`
- [x] Tests de rollback y checksum inválido

### Fase 5 — ecosistema (opcional)
- [x] `GET /api/catalog` en `apps/api` (mismo shape)
- [x] Badge `⬆ N` en el dock de Godot leyendo el marker
- [x] `docs/cli.md`, `docs/architecture.md`, `README.md`

---

## 15. Criterios de aceptación

1. `orbitkit check` funciona offline (usa caché) y online, sin lanzar excepciones.
2. Una skill publicada solo en `catalog.json` aparece como **nueva** sin publicar nueva versión del CLI.
3. Un comando cualquiera del CLI no tarda más de +50 ms por el chequeo pasivo (verificar con `time`).
4. El banner aparece **una sola vez** por versión; tras `orbitkit update`, desaparece.
5. `ORBITKIT_NO_UPDATE_CHECK=1` y `CI=true` desactivan todo.
6. `check --json` es parseable y no imprime spinner ni colores.
7. `applyUpdates` no aplica majors, no instala sin checksum y deja backup verificable.
8. `autoupdate enable` es idempotente en Linux, macOS y Windows (al menos el artefacto correcto).
9. `pnpm --filter @francisiv/orbitkit build` y `test` pasan sin warnings nuevos.
10. `getCurrentCliVersion()` == `package.json.version` == `.version()` del programa.

---

## 16. Notas para quien implementa

- Empezar por Fase 0 y 1. Es el 80 % del valor y no requiere daemon.
- No bloquear el arranque del CLI por red: el worker es detached y el banner sale de caché.
- Commander 13: `program.hook('postAction', …)` corre después de la acción; si el proceso llama `process.exit()` en algún comando, el hook no corre. Revisar `uninstall`/`upgrade` y usar `process.exitCode` en su lugar.
- El child worker debe ser un archivo compilado real (`dist/core/checkWorker.js`); `tsc` preserva la estructura, así que `new URL('./checkWorker.js', import.meta.url)` resuelve bien en `dist`.
- `bin/devdock.js` importa `../dist/cli.js`: cualquier entrada nueva debe compilarse ahí, no en `bin/`.
- Mantener `CURATED_SKILLS` como fallback evita romper `orbitkit init` en máquinas sin red.
- Si el catálogo trae un `schema` desconocido: ignorarlo, avisar y **no** actualizar nada.
- No tocar `apps/web` en este PR salvo la sección de docs si se agrega el comando.
- Actualizar la versión a `0.6.0` (minor) en `packages/cli/package.json` y en el `.version()` del CLI.

---

## 17. Decisiones abiertas (confirmar antes de mergear)

1. **¿Auto-instalar skills nuevas por defecto?** Recomendación: `false`. Notificar, no imponer.
2. **¿Auto-actualizar el CLI en background?** Recomendación: `false` (permisos npm + sesión activa). Solo notificar.
3. **¿`watch` como proceso residente o solo scheduler?** Recomendación: scheduler como opción principal; `watch` para debug.
4. **¿Catálogo en el repo (raw GitHub) o en `apps/api`?** Recomendación: repo ahora (0 infra), API después para telemetría/segmentación.
5. **¿Firma del catálogo?** Recomendación: dejar `signature` en el schema, implementar en un PR posterior.
