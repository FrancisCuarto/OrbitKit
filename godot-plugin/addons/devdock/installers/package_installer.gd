class_name DevDockPackageInstaller
extends RefCounted

const DevDockSecurityValidator = preload("res://addons/devdock/validators/security_validator.gd")
const DevDockLocalRegistry = preload("res://addons/devdock/services/local_registry.gd")
const DevDockHealthChecker = preload("res://addons/devdock/validators/health_checker.gd")

signal install_progress(resource_id: String, percentage: float, status_text: String)
signal install_completed(resource_id: String, success: bool, message: String)
signal uninstall_completed(resource_id: String, success: bool, message: String)

## Installs a resource payload from a downloaded byte buffer or archive
func install_package(manifest: Dictionary, raw_data: PackedByteArray) -> bool:
	var resource_id: String = manifest.get("id", "")
	if resource_id.is_empty():
		emit_signal("install_completed", resource_id, false, "Manifest missing 'id' field.")
		return false
		
	emit_signal("install_progress", resource_id, 0.1, "Verifying cryptographic checksum...")
	
	# 1. SHA-256 Checksum Verification
	var integrity = manifest.get("integrity", {})
	var expected_checksum = integrity.get("checksum", "").to_lower().strip_edges()
	var algorithm = integrity.get("algorithm", "sha256").to_lower()
	
	if not expected_checksum.is_empty():
		var calculated_checksum = _compute_sha256(raw_data)
		if calculated_checksum != expected_checksum:
			var err_msg = "Integrity check failed! Expected %s, got %s." % [expected_checksum, calculated_checksum]
			push_error("[DevDock Installer] " + err_msg)
			emit_signal("install_completed", resource_id, false, err_msg)
			return false
			
	emit_signal("install_progress", resource_id, 0.3, "Validating destination security...")
	
	# 2. Destination Security Validation
	var installation_spec = manifest.get("installation", {})
	var destination: String = installation_spec.get("destination", "")
	
	if not DevDockSecurityValidator.is_safe_destination(destination):
		var err_msg = "Destination violates security boundaries: " + destination
		push_error("[DevDock Installer] " + err_msg)
		emit_signal("install_completed", resource_id, false, err_msg)
		return false
		
	# Ensure destination directory exists
	if not DirAccess.dir_exists_absolute(destination):
		var make_err = DirAccess.make_dir_recursive_absolute(destination)
		if make_err != OK:
			emit_signal("install_completed", resource_id, false, "Failed to create directory: " + destination)
			return false
			
	emit_signal("install_progress", resource_id, 0.5, "Extracting package contents...")
	
	# 3. Extraction or Single File Placement
	var installed_files: Array[String] = []
	var method = installation_spec.get("method", "archive")
	
	if method == "archive":
		var extract_ok = _extract_zip(raw_data, destination, installed_files)
		if not extract_ok:
			emit_signal("install_completed", resource_id, false, "Extraction aborted due to security or format error.")
			return false
	else:
		# Single file or skill script installation
		var target_file = destination.path_join("entry.gd")
		var f = FileAccess.open(target_file, FileAccess.WRITE)
		if not f:
			emit_signal("install_completed", resource_id, false, "Failed writing file: " + target_file)
			return false
		f.store_buffer(raw_data)
		f.close()
		installed_files.append(target_file)
		
	emit_signal("install_progress", resource_id, 0.8, "Recording installation and running diagnostics...")
	
	# 4. Record in local registry
	var record = {
		"resource_id": resource_id,
		"installed_version": manifest.get("version", "1.0.0"),
		"status": "Installed",
		"destination_path": destination,
		"installed_files": installed_files,
		"manifest": manifest,
		"installed_at": Time.get_datetime_string_from_system(true)
	}
	DevDockLocalRegistry.record_installation(resource_id, record)
	
	# 5. Diagnostic Health Check
	var health = DevDockHealthChecker.check_health(manifest)
	if not health.get("passed", false):
		push_warning("[DevDock] Health check warning: " + ", ".join(health.get("details", [])))
		
	emit_signal("install_progress", resource_id, 1.0, "Installation complete!")
	emit_signal("install_completed", resource_id, true, "Installed successfully into: " + destination)
	
	# Refresh Godot editor filesystem if applicable
	if Engine.is_editor_hint():
		EditorInterface.get_resource_filesystem().scan()
		
	return true

## Uninstalls a package by safely removing its tracked files
func uninstall_package(resource_id: String) -> bool:
	var registry = DevDockLocalRegistry.get_installed_resources()
	if not registry.has(resource_id):
		emit_signal("uninstall_completed", resource_id, false, "Resource not recorded in local registry.")
		return false
		
	var record: Dictionary = registry[resource_id]
	var installed_files: Array = record.get("installed_files", [])
	var destination_path: String = record.get("destination_path", "")
	
	# 1. Remove recorded files only (never touch arbitrary user files)
	for file_path in installed_files:
		if FileAccess.file_exists(file_path):
			DirAccess.remove_absolute(file_path)
			
	# 2. If destination folder is empty, clean it up
	if not destination_path.is_empty() and DirAccess.dir_exists_absolute(destination_path):
		var dir = DirAccess.open(destination_path)
		if dir and dir.get_files().is_empty() and dir.get_directories().is_empty():
			DirAccess.remove_absolute(destination_path)
			
	# 3. Remove from registry
	DevDockLocalRegistry.remove_installation(resource_id)
	
	emit_signal("uninstall_completed", resource_id, true, "Uninstalled " + resource_id + " successfully.")
	
	if Engine.is_editor_hint():
		EditorInterface.get_resource_filesystem().scan()
		
	return true

## Extracts a ZIP archive buffer safely with ZipSlip protection
func _extract_zip(zip_buffer: PackedByteArray, destination_root: String, out_files: Array[String]) -> bool:
	var temp_zip_path = "res://.devdock/temp_install.zip"
	
	# Write temp zip to disk for ZIPReader
	var f = FileAccess.open(temp_zip_path, FileAccess.WRITE)
	if not f:
		push_error("[DevDock Installer] Could not create temp zip file.")
		return false
	f.store_buffer(zip_buffer)
	f.close()
	
	var reader = ZIPReader.new()
	var open_err = reader.open(temp_zip_path)
	if open_err != OK:
		push_error("[DevDock Installer] Failed opening ZIP payload (Error %d)." % open_err)
		DirAccess.remove_absolute(temp_zip_path)
		return false
		
	var entries: PackedStringArray = reader.get_files()
	for entry in entries:
		# Directory entries in zip usually end with '/'
		if entry.ends_with("/"):
			var target_dir = destination_root.path_join(entry)
			if DevDockSecurityValidator.is_safe_archive_entry(entry, destination_root):
				DirAccess.make_dir_recursive_absolute(target_dir)
			continue
			
		# Security ZipSlip verification
		if not DevDockSecurityValidator.is_safe_archive_entry(entry, destination_root):
			push_error("[DevDock Installer] ZipSlip attempt detected on entry: " + entry)
			reader.close()
			DirAccess.remove_absolute(temp_zip_path)
			return false
			
		var target_file_path = destination_root.path_join(entry)
		var file_dir = target_file_path.get_base_dir()
		if not DirAccess.dir_exists_absolute(file_dir):
			DirAccess.make_dir_recursive_absolute(file_dir)
			
		var data = reader.read_file(entry)
		var out_file = FileAccess.open(target_file_path, FileAccess.WRITE)
		if out_file:
			out_file.store_buffer(data)
			out_file.close()
			out_files.append(target_file_path)
			
	reader.close()
	DirAccess.remove_absolute(temp_zip_path)
	return true

## Computes SHA-256 hex string of a byte array using Godot HashingContext
func _compute_sha256(data: PackedByteArray) -> String:
	var ctx = HashingContext.new()
	ctx.start(HashingContext.HASH_SHA256)
	ctx.update(data)
	var digest = ctx.finish()
	return digest.hex_encode().to_lower()
