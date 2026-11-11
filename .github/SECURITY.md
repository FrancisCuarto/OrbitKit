# Security Policy 🔒

VGSkillFrame is a **security-first** installer: every package is verified with
SHA-256/512 checksums, archives are protected against Zip-Slip and path
traversal, and installation destinations are restricted to `res://addons/`,
`.agents/skills/` and `.claude/skills/`.

Read the full [Security & Privacy Policy](../docs/security.md) for details on
data minimization, backend hardening (Argon2id, Helmet, rate limiting) and
local file protection.

## Reporting a Vulnerability

Please report security vulnerabilities **privately** — do not open a public
issue or discussion:

1. **Preferred:** open a private report via
   [Security → Report a vulnerability](https://github.com/FrancisCuarto/OrbitKit/security/advisories/new),
   or
2. **Email the maintainer:** `francisco.lopez209776@alumnos.info.unlp.edu.ar`

Include the steps to reproduce, the affected versions, and the potential
impact. You will receive a response within 72 hours, and credited in the
release notes once the fix ships.
