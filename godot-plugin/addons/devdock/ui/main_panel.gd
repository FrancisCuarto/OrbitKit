@tool
extends Control

@onready var search_input: LineEdit = %SearchInput
@onready var filter_option: OptionButton = %FilterOption
@onready var resource_list: VBoxContainer = %ResourceList
@onready var installed_list: VBoxContainer = %InstalledList
@onready var api_status_label: Label = %ApiStatusLabel
@onready var http_request: HTTPRequest = %HTTPRequest

var api_client: DevDockApiClient
var local_registry: DevDockLocalRegistry

func _ready() -> void:
	api_client = DevDockApiClient.new()
	local_registry = DevDockLocalRegistry.new()
	
	if filter_option:
		filter_option.clear()
		filter_option.add_item("All Types", 0)
		filter_option.add_item("Godot Addons", 1)
		filter_option.add_item("AI Skills", 2)
		filter_option.add_item("Scripts & Systems", 3)
		filter_option.add_item("Shaders", 4)
		
	if http_request:
		http_request.request_completed.connect(_on_http_request_completed)
		
	_refresh_explore_catalog()
	_refresh_installed_view()

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
	if err != OK:
		if api_status_label:
			api_status_label.text = "API Offline or Unreachable"

func _refresh_installed_view() -> void:
	if not installed_list:
		return
		
	for child in installed_list.get_children():
		child.queue_free()
		
	var installed = DevDockLocalRegistry.get_installed_resources()
	if installed.is_empty():
		var empty_lbl = Label.new()
		empty_lbl.text = "No packages currently installed."
		installed_list.add_child(empty_lbl)
		return
		
	for res_id in installed.keys():
		var rec = installed[res_id]
		var row = HBoxContainer.new()
		
		var title_lbl = Label.new()
		title_lbl.text = "%s (v%s) [%s]" % [res_id, rec.get("installed_version", "?"), rec.get("status", "Installed")]
		title_lbl.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		row.add_child(title_lbl)
		
		var diag_btn = Button.new()
		diag_btn.text = "Diagnose"
		diag_btn.pressed.connect(func(): _run_diagnostics_on(res_id, rec))
		row.add_child(diag_btn)
		
		installed_list.add_child(row)

func _run_diagnostics_on(res_id: String, rec: Dictionary) -> void:
	var manifest = rec.get("manifest", {})
	if manifest.is_empty():
		manifest = {"installation": {"destination": rec.get("destination_path", "")}, "type": "godot_addon"}
	var health = DevDockHealthChecker.check_health(manifest)
	print("[DevDock Diagnostics] Result for ", res_id, ": ", health)

func _on_http_request_completed(_result: int, response_code: int, _headers: PackedStringArray, body: PackedByteArray) -> void:
	if response_code != 200:
		if api_status_label:
			api_status_label.text = "API Error: HTTP " + str(response_code)
		return
		
	if api_status_label:
		api_status_label.text = "API Connected"
		
	var json = JSON.new()
	var err = json.parse(body.get_string_from_utf8())
	if err != OK or not json.data is Dictionary:
		return
		
	var response_data = json.data
	var items = response_data.get("data", [])
	
	if resource_list:
		for child in resource_list.get_children():
			child.queue_free()
			
		for item_data in items:
			var card = PanelContainer.new()
			var vbox = VBoxContainer.new()
			card.add_child(vbox)
			
			var header = HBoxContainer.new()
			var name_lbl = Label.new()
			name_lbl.text = item_data.get("name", "Unknown") + " v" + item_data.get("latest_version", "1.0.0")
			name_lbl.size_flags_horizontal = Control.SIZE_EXPAND_FILL
			header.add_child(name_lbl)
			
			var install_btn = Button.new()
			install_btn.text = "Install"
			header.add_child(install_btn)
			vbox.add_child(header)
			
			var desc_lbl = Label.new()
			desc_lbl.text = item_data.get("description", "")
			desc_lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
			vbox.add_child(desc_lbl)
			
			resource_list.add_child(card)
