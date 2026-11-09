class_name DevDockLocalRegistry
extends RefCounted

const REGISTRY_PATH: String = "res://.devdock/installed.json"

## Reads local installation records
static func get_installed_resources() -> Dictionary:
	if not FileAccess.file_exists(REGISTRY_PATH):
		return {}
		
	var file = FileAccess.open(REGISTRY_PATH, FileAccess.READ)
	if not file:
		return {}
		
	var content = file.get_as_text()
	var json = JSON.new()
	var parse_result = json.parse(content)
	if parse_result == OK and json.data is Dictionary:
		return json.data
	return {}

## Saves or updates an installation record
static func record_installation(resource_id: String, record: Dictionary) -> bool:
	var registry = get_installed_resources()
	registry[resource_id] = record
	
	var dir = "res://.devdock"
	if not DirAccess.dir_exists_absolute(dir):
		DirAccess.make_dir_recursive_absolute(dir)
		
	var file = FileAccess.open(REGISTRY_PATH, FileAccess.WRITE)
	if not file:
		push_error("[DevDock] Could not open registry file for writing: " + REGISTRY_PATH)
		return false
		
	file.store_string(JSON.stringify(registry, "\t"))
	return true

## Removes an installation record upon uninstallation
static func remove_installation(resource_id: String) -> bool:
	var registry = get_installed_resources()
	if not registry.has(resource_id):
		return true
		
	registry.erase(resource_id)
	var file = FileAccess.open(REGISTRY_PATH, FileAccess.WRITE)
	if not file:
		return false
		
	file.store_string(JSON.stringify(registry, "\t"))
	return true
