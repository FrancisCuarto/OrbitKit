class_name DevDockHealthChecker
extends RefCounted

## Performs diagnostic check on an installed resource
static func check_health(manifest: Dictionary) -> Dictionary:
	var result = {
		"files_installed": false,
		"config_valid": false,
		"compatibility_verified": false,
		"passed": false,
		"details": []
	}
	
	var destination = manifest.get("installation", {}).get("destination", "")
	if destination.is_empty():
		result["details"].append("Destination path missing in manifest.")
		return result
		
	# 1. Check directory existence
	if not DirAccess.dir_exists_absolute(destination):
		result["details"].append("Destination directory does not exist: " + destination)
		return result
		
	result["files_installed"] = true
	
	# 2. Check required files from health_check spec
	var health_spec = manifest.get("health_check", {})
	var required_files = health_spec.get("required_files", [])
	var missing_files: Array[String] = []
	
	for req_file in required_files:
		var full_file_path = destination.path_join(req_file)
		if not FileAccess.file_exists(full_file_path):
			missing_files.append(req_file)
			
	if not missing_files.is_empty():
		result["details"].append("Missing required files: " + ", ".join(missing_files))
		return result
		
	# 3. For Godot addons, check plugin.cfg
	var res_type = manifest.get("type", "")
	if res_type == "godot_addon":
		var plugin_cfg_path = destination.path_join("plugin.cfg")
		if FileAccess.file_exists(plugin_cfg_path):
			var config = ConfigFile.new()
			var err = config.load(plugin_cfg_path)
			if err == OK and config.has_section("plugin"):
				result["config_valid"] = true
			else:
				result["details"].append("Invalid or corrupted plugin.cfg configuration.")
		else:
			result["details"].append("Missing plugin.cfg in addon directory.")
	else:
		result["config_valid"] = true
		
	# 4. Engine compatibility check
	var godot_compat = manifest.get("compatibility", {}).get("godot", [])
	var current_engine_version = Engine.get_version_info()
	var engine_major_minor = "%d.%d" % [current_engine_version.get("major", 4), current_engine_version.get("minor", 0)]
	
	if godot_compat.is_empty():
		result["compatibility_verified"] = true
	else:
		for ver in godot_compat:
			if engine_major_minor.begins_with(ver) or ver == "*" or ver == "all":
				result["compatibility_verified"] = true
				break
				
	if not result["compatibility_verified"]:
		result["details"].append("Addon may not be compatible with Godot " + engine_major_minor)
		
	result["passed"] = result["files_installed"] and result["config_valid"]
	return result
