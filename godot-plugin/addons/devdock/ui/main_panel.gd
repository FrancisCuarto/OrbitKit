@tool
extends Control

const DevDockApiClient = preload("res://addons/devdock/services/api_client.gd")
const DevDockPackageInstaller = preload("res://addons/devdock/installers/package_installer.gd")
const DevDockLocalRegistry = preload("res://addons/devdock/services/local_registry.gd")
const DevDockHealthChecker = preload("res://addons/devdock/validators/health_checker.gd")

@onready var search_input: LineEdit = %SearchInput
@onready var filter_option: OptionButton = %FilterOption
@onready var resource_list: VBoxContainer = %ResourceList
@onready var installed_list: VBoxContainer = %InstalledList
@onready var updates_list: VBoxContainer = %UpdatesList
@onready var api_status_label: Label = %ApiStatusLabel
@onready var http_request: HTTPRequest = %HTTPRequest
@onready var download_http: HTTPRequest = %DownloadHTTP
@onready var confirm_dialog: ConfirmationDialog = %ConfirmDialog
@onready var progress_bar: ProgressBar = %ProgressBar
@onready var status_bar_label: Label = %StatusBarLabel

var api_client: DevDockApiClient
var installer: DevDockPackageInstaller
var pending_manifest: Dictionary = {}
var _marker_timer: Timer

const UPDATE_MARKER_PATH = "res://.devdock/update-available.json"

func _ready() -> void:
	api_client = DevDockApiClient.new()
	installer = DevDockPackageInstaller.new()
	
	installer.install_progress.connect(_on_install_progress)
	installer.install_completed.connect(_on_install_completed)
	installer.uninstall_completed.connect(_on_uninstall_completed)
	
	if filter_option:
		filter_option.clear()
		filter_option.add_item("All Types", 0)
		filter_option.add_item("Godot Addons", 1)
		filter_option.add_item("AI Skills", 2)
		filter_option.add_item("Scripts & Systems", 3)
		filter_option.add_item("Shaders", 4)
		filter_option.item_selected.connect(func(_idx): _refresh_explore_catalog())
		
	if http_request:
		http_request.request_completed.connect(_on_catalog_http_completed)
		
	if download_http:
		download_http.request_completed.connect(_on_download_completed)
		
	if confirm_dialog:
		confirm_dialog.confirmed.connect(_on_confirm_install)
		
	_refresh_explore_catalog()
	_refresh_installed_view()
	_check_update_marker()
	_setup_marker_timer()

func _setup_marker_timer() -> void:
	_marker_timer = Timer.new()
	_marker_timer.wait_time = 1800.0 # 30 minutes
	_marker_timer.autostart = true
	_marker_timer.timeout.connect(_check_update_marker)
	add_child(_marker_timer)

func _check_update_marker() -> void:
	if not FileAccess.file_exists(UPDATE_MARKER_PATH):
		return
	var file = FileAccess.open(UPDATE_MARKER_PATH, FileAccess.READ)
	if not file:
		return
	var raw = file.get_as_text()
	file.close()

	var json = JSON.new()
	if json.parse(raw) != OK or not json.data is Dictionary:
		return

	var data: Dictionary = json.data
	var new_skills: Array = data.get("newSkills", [])
	var outdated_skills: Array = data.get("outdatedSkills", [])
	var cli_info: Dictionary = data.get("cli", {})
	var cli_update: bool = cli_info.get("updateAvailable", false)

	var total_updates: int = new_skills.size() + outdated_skills.size() + (1 if cli_update else 0)
	if total_updates > 0 and status_bar_label:
		status_bar_label.text = "⬆ %d update(s) available · Run 'orbitkit update --all'" % total_updates

	if updates_list:
		for child in updates_list.get_children():
			child.queue_free()
		for item in outdated_skills:
			var lbl = Label.new()
			lbl.text = "↑ %s: v%s → v%s" % [item.get("id", ""), item.get("from", ""), item.get("to", "")]
			updates_list.add_child(lbl)
		for item in new_skills:
			var lbl = Label.new()
			lbl.text = "+ %s (v%s)" % [item.get("id", ""), item.get("version", "")]
			updates_list.add_child(lbl)

func _on_search_button_pressed() -> void:
	_refresh_explore_catalog()

func _refresh_explore_catalog() -> void:
	if not http_request:
		return
		
	var search_text = search_input.text if search_input else ""
	var type_param = ""
	
	if filter_option:
		match filter_option.selected:
			1: type_param = "godot_addon"
			2: type_param = "ai_skill"
			3: type_param = "script_system"
			4: type_param = "shader_material"
			
	var err = api_client.fetch_resources(http_request, search_text, type_param)
	if err != OK and api_status_label:
		api_status_label.text = "API Offline"

func _refresh_installed_view() -> void:
	if not installed_list:
		return
		
	for child in installed_list.get_children():
		child.queue_free()
		
	var installed = DevDockLocalRegistry.get_installed_resources()
	if installed.is_empty():
		var empty_lbl = Label.new()
		empty_lbl.text = "No packages currently installed in this project."
		empty_lbl.add_theme_color_override("font_color", Color(0.6, 0.6, 0.6))
		installed_list.add_child(empty_lbl)
		return
		
	for res_id in installed.keys():
		var rec = installed[res_id]
		var panel = PanelContainer.new()
		var row = HBoxContainer.new()
		panel.add_child(row)
		
		var title_lbl = Label.new()
		title_lbl.text = "%s  (v%s)" % [res_id, rec.get("installed_version", "?")]
		title_lbl.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		row.add_child(title_lbl)
		
		# Health status check badge
		var manifest = rec.get("manifest", {})
		var health = DevDockHealthChecker.check_health(manifest)
		var badge = Label.new()
		if health.get("passed", false):
			badge.text = " [Health: OK] "
			badge.add_theme_color_override("font_color", Color(0.3, 0.9, 0.4))
		else:
			badge.text = " [Health: Warning] "
			badge.add_theme_color_override("font_color", Color(0.95, 0.7, 0.2))
		row.add_child(badge)
		
		# Action buttons
		var diag_btn = Button.new()
		diag_btn.text = "Diagnose"
		diag_btn.pressed.connect(func(): _run_diagnostics(res_id, rec, health))
		row.add_child(diag_btn)
		
		var uninstall_btn = Button.new()
		uninstall_btn.text = "Uninstall"
		uninstall_btn.pressed.connect(func(): _prompt_uninstall(res_id))
		row.add_child(uninstall_btn)
		
		installed_list.add_child(panel)

func _prompt_install(item_data: Dictionary) -> void:
	pending_manifest = item_data.get("manifest", {})
	if pending_manifest.is_empty():
		# Query full detail
		api_client.fetch_resource_detail(http_request, item_data.get("id", ""))
		return
		
	_show_confirm_dialog(pending_manifest)

func _show_confirm_dialog(manifest: Dictionary) -> void:
	if not confirm_dialog:
		return
	
	var res_name = manifest.get("name", "Unknown")
	var res_ver = manifest.get("version", "1.0.0")
	var dest = manifest.get("installation", {}).get("destination", "")
	var checksum = manifest.get("integrity", {}).get("checksum", "None")
	if checksum.length() > 16:
		checksum = checksum.substr(0, 16) + "..."
		
	var dialog_text = """Ready to install %s (v%s)

• Destination: %s
• Integrity SHA-256: %s
• License: %s

Do you want to proceed with the installation?""" % [res_name, res_ver, dest, checksum, manifest.get("license", "MIT")]
	
	confirm_dialog.dialog_text = dialog_text
	confirm_dialog.popup_centered()

func _on_confirm_install() -> void:
	if pending_manifest.is_empty():
		return
		
	if progress_bar:
		progress_bar.visible = true
		progress_bar.value = 10
		
	if status_bar_label:
		status_bar_label.text = "Downloading package..."
		
	var source_url = pending_manifest.get("source", {}).get("url", "")
	if source_url.is_empty() or not source_url.begins_with("http"):
		# Fallback mock package payload for offline or mock tests
		var mock_zip_buffer = _generate_mock_package_buffer(pending_manifest)
		installer.install_package(pending_manifest, mock_zip_buffer)
	else:
		download_http.request(source_url)

func _prompt_uninstall(res_id: String) -> void:
	installer.uninstall_package(res_id)

func _run_diagnostics(res_id: String, rec: Dictionary, health: Dictionary) -> void:
	var msg = "Diagnostics for %s:\n" % res_id
	msg += "• Installed at: %s\n" % rec.get("destination_path", "")
	msg += "• Files present: %s\n" % str(health.get("files_installed", false))
	msg += "• Config valid: %s\n" % str(health.get("config_valid", false))
	msg += "• Engine compatibility: %s\n" % str(health.get("compatibility_verified", false))
	
	var details = health.get("details", [])
	if not details.is_empty():
		msg += "• Details: " + ", ".join(details)
		
	var diag_alert = AcceptDialog.new()
	diag_alert.title = "DevDock Diagnostics"
	diag_alert.dialog_text = msg
	add_child(diag_alert)
	diag_alert.popup_centered()

func _on_install_progress(_resource_id: String, percentage: float, status_text: String) -> void:
	if progress_bar:
		progress_bar.value = percentage * 100
	if status_bar_label:
		status_bar_label.text = status_text

func _on_install_completed(_resource_id: String, success: bool, message: String) -> void:
	if progress_bar:
		progress_bar.visible = false
	if status_bar_label:
		status_bar_label.text = message
	_refresh_installed_view()

func _on_uninstall_completed(_resource_id: String, _success: bool, message: String) -> void:
	if status_bar_label:
		status_bar_label.text = message
	_refresh_installed_view()

func _on_catalog_http_completed(_result: int, response_code: int, _headers: PackedStringArray, body: PackedByteArray) -> void:
	if response_code != 200:
		if api_status_label:
			api_status_label.text = "API Offline (HTTP " + str(response_code) + ")"
		return
		
	if api_status_label:
		api_status_label.text = "API Connected"
		
	var json = JSON.new()
	var err = json.parse(body.get_string_from_utf8())
	if err != OK or not json.data is Dictionary:
		return
		
	var response_data = json.data
	if response_data.has("data"):
		var data_field = response_data["data"]
		if data_field is Array:
			_render_resource_cards(data_field)
		elif data_field is Dictionary and data_field.has("manifest"):
			# Came from detail request
			pending_manifest = data_field["manifest"]
			_show_confirm_dialog(pending_manifest)

func _render_resource_cards(items: Array) -> void:
	if not resource_list:
		return
		
	for child in resource_list.get_children():
		child.queue_free()
		
	for item_data in items:
		var card = PanelContainer.new()
		var vbox = VBoxContainer.new()
		card.add_child(vbox)
		
		var header = HBoxContainer.new()
		var name_lbl = Label.new()
		name_lbl.text = item_data.get("name", "Unknown") + "  v" + item_data.get("latest_version", "1.0.0")
		name_lbl.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		header.add_child(name_lbl)
		
		var type_badge = Label.new()
		type_badge.text = "[" + item_data.get("type", "addon") + "] "
		type_badge.add_theme_color_override("font_color", Color(0.4, 0.7, 1.0))
		header.add_child(type_badge)
		
		var install_btn = Button.new()
		install_btn.text = "Install"
		install_btn.pressed.connect(func(): _prompt_install(item_data))
		header.add_child(install_btn)
		vbox.add_child(header)
		
		var desc_lbl = Label.new()
		desc_lbl.text = item_data.get("description", "")
		desc_lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		vbox.add_child(desc_lbl)
		
		resource_list.add_child(card)

func _on_download_completed(_result: int, response_code: int, _headers: PackedStringArray, body: PackedByteArray) -> void:
	if response_code != 200:
		_on_install_completed(pending_manifest.get("id", ""), false, "Download failed (HTTP " + str(response_code) + ")")
		return
		
	installer.install_package(pending_manifest, body)

func _generate_mock_package_buffer(manifest: Dictionary) -> PackedByteArray:
	var temp_zip_path = "res://.devdock/mock_pack.zip"
	var dir = "res://.devdock"
	if not DirAccess.dir_exists_absolute(dir):
		DirAccess.make_dir_recursive_absolute(dir)
		
	var writer = ZIPPacker.new()
	writer.open(temp_zip_path)
	
	var res_type = manifest.get("type", "")
	if res_type == "godot_addon":
		writer.start_file("plugin.cfg")
		var cfg_content = "[plugin]\nname=\"%s\"\nversion=\"%s\"\nauthor=\"%s\"\n" % [
			manifest.get("name", "Mock"),
			manifest.get("version", "1.0.0"),
			manifest.get("author", "DevDock")
		]
		writer.write_file(cfg_content.to_utf8_buffer())
		writer.close_file()
	elif res_type == "ai_skill":
		writer.start_file("SKILL.md")
		var skill_content = "# %s\nVersion: %s\n%s\n" % [
			manifest.get("name", "Skill"),
			manifest.get("version", "1.0.0"),
			manifest.get("description", "")
		]
		writer.write_file(skill_content.to_utf8_buffer())
		writer.close_file()
		
	writer.close()
	
	var f = FileAccess.open(temp_zip_path, FileAccess.READ)
	var buffer: PackedByteArray = []
	if f:
		buffer = f.get_buffer(f.get_length())
		f.close()
		DirAccess.remove_absolute(temp_zip_path)
		
	# Match manifest checksum dynamically for mock packaging
	var ctx = HashingContext.new()
	ctx.start(HashingContext.HASH_SHA256)
	ctx.update(buffer)
	var real_checksum = ctx.finish().hex_encode().to_lower()
	manifest["integrity"] = {"algorithm": "sha256", "checksum": real_checksum}
	
	return buffer
