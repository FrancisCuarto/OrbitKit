---
name: Context7 (ctx7) Live Documentation Fetcher
id: ctx7-docs-fetcher
version: 1.0.0
description: Instructs AI coding assistants to fetch fresh, version-specific library docs and syntax examples via Context7.
---

# Context7 (ctx7) Documentation Protocol
When writing code involving third-party libraries, SDKs, or unfamiliar APIs:

## Instructions:
1. If Context7 MCP tools (`query-docs` or `resolve-library-id`) are available, query them before writing code for external libraries.
2. If using the ctx7 CLI, run `npx ctx7 query <library> <topic>` to retrieve accurate, version-locked API examples.
3. Never invent function parameters when official documentation is verifiable through Context7.
