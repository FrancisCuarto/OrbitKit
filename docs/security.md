# DevDock Security & Privacy Policy

DevDock is built strictly according to **Privacy by Design** and **Security by Design** principles.

## 1. Data Minimization
- The public catalog does not require user registration.
- No personal data is gathered or stored (no identity documents, physical addresses, telephone numbers, banking details, personal API keys, AI model tokens, or project contents).
- Telemetry is **disabled by default**.

## 2. Local File Protection
- **No Path Traversal**: Package destinations and entry names containing `..` or backslashes are rejected automatically by both API schemas and the Godot plugin.
- **Zip Slip Prevention**: Archives cannot extract files outside the destination root directory.
- **Restricted Destinations**: Installations are restricted to designated namespaces (`res://addons/`, `res://scripts/`, `.agents/skills/`, `.claude/skills/`).
- **Cryptographic Verification**: Every package is verified against SHA-256 or SHA-512 checksums before extraction.

## 3. Backend & API Hardening
- **Authentication**: Admin credentials are protected with **Argon2id** (64MB memory cost, 3 iterations).
- **Session Security**: HttpOnly, Secure, SameSite strict cookies and JWTs.
- **HTTP Protection**: Helmet security headers, restrictive CORS policies, and multi-tier rate limiting.
- **Input Sanitation**: Strict schema parsing via Zod rejects malicious payloads and NoSQL injections.
