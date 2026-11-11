# VGSkillFrame REST API Reference

Base URL: `http://localhost:4000/api`

## Endpoints

### 1. Resources

#### `GET /api/resources`
Query parameters:
- `search` (optional): Filter by name, description, or tags
- `type` (optional): Filter by `godot_addon`, `ai_skill`, `script_system`, `shader_material`, `graphic_asset`, `tool`
- `tag` (optional): Filter by specific tag
- `page` (optional, default: 1)
- `limit` (optional, default: 20, max: 50)

#### `GET /api/resources/:id`
Returns full resource metadata, manifest details, and available version list.

#### `GET /api/resources/:id/versions`
Returns an array of all published manifests for a resource.

#### `GET /api/resources/:id/compatibility?godot=4.4`
Checks if the resource is compatible with the specified Godot engine version.

### 2. Categories

#### `GET /api/categories`
Returns all catalog categories with resource counts.

### 3. Authentication (Admin)

#### `POST /api/auth/register`
Body: `{ email, password }`

#### `POST /api/auth/login`
Body: `{ email, password }`

#### `POST /api/auth/logout`

### 4. Admin Management (Protected)

#### `POST /api/admin/resources`
Publish or update a resource manifest (requires Bearer token or auth cookie).
