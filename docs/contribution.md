# Contributing to DevDock

We welcome community contributions to DevDock!

## How to Submit a New Resource

1. **Create a standard manifest (`manifest.json`)**:
   Ensure it satisfies the DevDock schema specification, including:
   - Valid kebab-case `id`
   - Valid SemVer `version` (e.g. `1.0.0`)
   - Permitted `destination` (e.g. `res://addons/your_addon/`)
   - Accurate SHA-256 integrity checksum

2. **Test your manifest locally**:
   ```bash
   pnpm --filter=@devdock/manifest-schema test
   ```

3. **Submit a Pull Request**:
   - Open a PR on the DevDock repository with your manifest file.
   - All community submissions undergo automated format checks and security review before inclusion into the catalog.
