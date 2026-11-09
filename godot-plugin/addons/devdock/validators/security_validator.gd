class_name DevDockSecurityValidator
extends RefCounted

const ALLOWED_PREFIXES: Array[String] = [
	"res://addons/",
	"res://scripts/",
	"res://Scripts/",
	"res://shaders/",
	".agents/skills/",
	".claude/skills/",
	".devdock/"
]

## Validates whether a target destination path conforms to security constraints
static func is_safe_destination(destination: String) -> bool:
	if destination.is_empty():
		return false
		
	# Path traversal detection
	if ".." in destination or "\\" in destination:
		push_error("[DevDock Security] Detected illegal traversal in path: " + destination)
		return false
		
	# Must match an approved prefix
	var matched: bool = false
	for prefix in ALLOWED_PREFIXES:
		if destination.begins_with(prefix):
			matched = true
			break
			
	if not matched:
		push_error("[DevDock Security] Destination not in approved directory list: " + destination)
		return false
		
	return true

## Validates an archive entry name to prevent Zip Slip attacks
static func is_safe_archive_entry(entry_name: String, base_destination: String) -> bool:
	if entry_name.is_empty():
		return false
		
	if ".." in entry_name or entry_name.begins_with("/") or entry_name.begins_with("\\"):
		push_error("[DevDock Security] ZipSlip attempt detected in archive entry: " + entry_name)
		return false
		
	var full_target = base_destination.path_join(entry_name).simplify_path()
	var simplified_base = base_destination.simplify_path()
	
	if not full_target.begins_with(simplified_base):
		push_error("[DevDock Security] Extracted file escapes destination root: " + full_target)
		return false
		
	return true
