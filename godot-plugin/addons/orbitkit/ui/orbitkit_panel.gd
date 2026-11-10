@tool
extends Control

const CATALOG_PATH = "res://.devdock/catalog.json"
const MCP_CONFIG_PATH = "res://.mcp.json"

var _plugin: EditorPlugin
var _bridge: Node

var _status_label: Label
var _tabs: TabContainer
var _skills_list: VBoxContainer
var _mcp_list: VBoxContainer
var _viewer_summary: RichTextLabel
var _doctor_list: VBoxContainer
var _footer_label: Label

func set_editor_plugin(plugin: EditorPlugin, bridge: Node) -> void:
	_plugin = plugin
	_bridge = bridge

func _ready() -> void:
	custom_minimum_size = Vector2(280, 320)
	_build_ui()
	refresh_all()

func _build_ui() -> void:
	for child in get_children():
		child.queue_free()

	var main_vbox = VBoxContainer.new()
	main_vbox.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	main_vbox.add_theme_constant_override("separation", 6)
	add_child(main_vbox)

	# Header
	var header = HBoxContainer.new()
	var title = Label.new()
	title.text = "● OrbitKit"
	title.add_theme_font_size_override("font_size", 16)
	title.add_theme_color_override("font_color", Color(0.28, 0.55, 0.75))
	header.add_child(title)

	var ver_lbl = Label.new()
	ver_lbl.text = " v0.5.0"
	ver_lbl.add_theme_color_override("font_color", Color(0.55, 0.62, 0.7))
	header.add_child(ver_lbl)

	var spacer = Control.new()
	spacer.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	header.add_child(spacer)

	_status_label = Label.new()
	_status_label.text = "Ready"
	_status_label.add_theme_color_override("font_color", Color(0.2, 0.8, 0.5))
	header.add_child(_status_label)

	var sync_btn = Button.new()
	sync_btn.text = "Sync"
	sync_btn.pressed.connect(refresh_all)
	header.add_child(sync_btn)

	main_vbox.add_child(header)

	# Tabs
	_tabs = TabContainer.new()
	_tabs.size_flags_vertical = Control.SIZE_EXPAND_FILL
	main_vbox.add_child(_tabs)

	# Tab 1: AI Skills
	var skills_tab = VBoxContainer.new()
	skills_tab.name = "AI Skills"
	var skills_hint = Label.new()
	skills_hint.text = "Curated Godot 4 & Blender AI Skills (.agents/skills & .claude/skills)"
	skills_hint.add_theme_color_override("font_color", Color(0.6, 0.65, 0.72))
	skills_hint.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	skills_tab.add_child(skills_hint)

	var skills_scroll = ScrollContainer.new()
	skills_scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	_skills_list = VBoxContainer.new()
	_skills_list.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	skills_scroll.add_child(_skills_list)
	skills_tab.add_child(skills_scroll)
	_tabs.add_child(skills_tab)

	# Tab 2: MCP Servers
	var mcp_tab = VBoxContainer.new()
	mcp_tab.name = "MCP"
	var mcp_hint = Label.new()
	mcp_hint.text = "Model Context Protocol servers configured in res://.mcp.json"
	mcp_hint.add_theme_color_override("font_color", Color(0.6, 0.65, 0.72))
	mcp_hint.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	mcp_tab.add_child(mcp_hint)

	var mcp_scroll = ScrollContainer.new()
	mcp_scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	_mcp_list = VBoxContainer.new()
	_mcp_list.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	mcp_scroll.add_child(_mcp_list)
	mcp_tab.add_child(mcp_scroll)
	_tabs.add_child(mcp_tab)

	# Tab 3: Scene Viewer
	var viewer_tab = VBoxContainer.new()
	viewer_tab.name = "Viewer"
	var viewer_top = HBoxContainer.new()
	var viewer_lbl = Label.new()
	viewer_lbl.text = "Live Scene Hierarchy (.devdock/editor_state.json)"
	viewer_lbl.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	viewer_top.add_child(viewer_lbl)

	var snap_btn = Button.new()
	snap_btn.text = "Export Snapshot"
	snap_btn.pressed.connect(func():
		refresh_viewer()
		_set_footer("✓ Scene snapshot exported to res://.devdock/editor_state.json")
	)
	viewer_top.add_child(snap_btn)
	viewer_tab.add_child(viewer_top)

	_viewer_summary = RichTextLabel.new()
	_viewer_summary.bbcode_enabled = true
	_viewer_summary.size_flags_vertical = Control.SIZE_EXPAND_FILL
	_viewer_summary.selection_enabled = true
	viewer_tab.add_child(_viewer_summary)
	_tabs.add_child(viewer_tab)

	# Tab 4: Doctor
	var doctor_tab = VBoxContainer.new()
	doctor_tab.name = "Doctor"
	var doc_scroll = ScrollContainer.new()
	doc_scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	_doctor_list = VBoxContainer.new()
	_doctor_list.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	doc_scroll.add_child(_doctor_list)
	doctor_tab.add_child(doc_scroll)
	_tabs.add_child(doctor_tab)

	# Footer
	_footer_label = Label.new()
	_footer_label.text = "OrbitKit synced with project."
	_footer_label.add_theme_color_override("font_color", Color(0.55, 0.62, 0.7))
	main_vbox.add_child(_footer_label)

func _set_footer(msg: String) -> void:
	if _footer_label:
		_footer_label.text = msg

func refresh_all() -> void:
	refresh_skills()
	refresh_mcp()
	refresh_viewer()
	refresh_doctor()
	_set_footer("Synced at " + Time.get_time_string_from_system())

func _load_catalog() -> Dictionary:
	if FileAccess.file_exists(CATALOG_PATH):
		var f = FileAccess.open(CATALOG_PATH, FileAccess.READ)
		if f:
			var json = JSON.new()
			if json.parse(f.get_as_text()) == OK and json.data is Dictionary:
				f.close()
				return json.data
			f.close()
	return {"skills": [], "mcpServers": []}

func _get_installed_skills() -> Dictionary:
	var installed: Dictionary = {}
	var base_dir = "res://.agents/skills"
	if not DirAccess.dir_exists_absolute(base_dir):
		return installed

	var dir = DirAccess.open(base_dir)
	if not dir:
		return installed

	dir.list_dir_begin()
	var entry = dir.get_next()
	while entry != "":
		if dir.current_is_dir() and not entry.begins_with("."):
			var meta_path = base_dir + "/" + entry + "/skill.json"
			var ver = "installed"
			if FileAccess.file_exists(meta_path):
				var f = FileAccess.open(meta_path, FileAccess.READ)
				if f:
					var j = JSON.new()
					if j.parse(f.get_as_text()) == OK and j.data is Dictionary:
						ver = j.data.get("version", "1.0.0")
					f.close()
			installed[entry] = ver
		entry = dir.get_next()
	dir.list_dir_end()
	return installed

func refresh_skills() -> void:
	if not _skills_list:
		return
	for c in _skills_list.get_children():
		c.queue_free()

	var catalog = _load_catalog()
	var skills: Array = catalog.get("skills", [])
	var installed = _get_installed_skills()

	if skills.is_empty():
		var empty_lbl = Label.new()
		empty_lbl.text = "Installed skills: " + (", ".join(installed.keys()) if not installed.is_empty() else "none")
		_skills_list.add_child(empty_lbl)
		return

	for s in skills:
		var skill_id = str(s.get("id", ""))
		var skill_name = str(s.get("name", skill_id))
		var skill_ver = str(s.get("version", "1.0.0"))
		var skill_desc = str(s.get("description", ""))
		var is_inst = installed.has(skill_id)

		var panel = PanelContainer.new()
		var vbox = VBoxContainer.new()
		panel.add_child(vbox)

		var row = HBoxContainer.new()
		var title = Label.new()
		title.text = "%s (v%s)" % [skill_id, skill_ver]
		title.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		row.add_child(title)

		var badge = Label.new()
		if is_inst:
			badge.text = "[Installed] "
			badge.add_theme_color_override("font_color", Color(0.2, 0.85, 0.5))
		else:
			badge.text = "[Available] "
			badge.add_theme_color_override("font_color", Color(0.55, 0.62, 0.7))
		row.add_child(badge)

		var btn = Button.new()
		btn.text = "Reinstall" if is_inst else "Install"
		btn.pressed.connect(func(): _install_skill_from_catalog(s))
		row.add_child(btn)

		vbox.add_child(row)

		var desc = Label.new()
		desc.text = skill_desc
		desc.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		desc.add_theme_color_override("font_color", Color(0.65, 0.7, 0.78))
		vbox.add_child(desc)

		_skills_list.add_child(panel)

func _install_skill_from_catalog(skill: Dictionary) -> void:
	var skill_id = str(skill.get("id", ""))
	if skill_id.is_empty():
		return
	var targets = [
		"res://.agents/skills/" + skill_id,
		"res://.claude/skills/" + skill_id
	]
	for t in targets:
		if not DirAccess.dir_exists_absolute(t):
			DirAccess.make_dir_recursive_absolute(t)
		var md_content = "---\nname: %s\nid: %s\nversion: %s\ndescription: %s\n---\n\n%s\n" % [
			str(skill.get("name", skill_id)),
			skill_id,
			str(skill.get("version", "1.0.0")),
			str(skill.get("description", "")),
			str(skill.get("systemPrompt", ""))
		]
		var f_md = FileAccess.open(t + "/SKILL.md", FileAccess.WRITE)
		if f_md:
			f_md.store_string(md_content)
			f_md.close()

		var meta = {
			"id": skill_id,
			"name": str(skill.get("name", skill_id)),
			"version": str(skill.get("version", "1.0.0")),
			"updated_at": Time.get_datetime_string_from_system(true)
		}
		var f_meta = FileAccess.open(t + "/skill.json", FileAccess.WRITE)
		if f_meta:
			f_meta.store_string(JSON.stringify(meta, "\t"))
			f_meta.close()

	_set_footer("✓ Installed skill: " + skill_id)
	refresh_skills()
	refresh_doctor()

func _read_mcp_config() -> Dictionary:
	if FileAccess.file_exists(MCP_CONFIG_PATH):
		var f = FileAccess.open(MCP_CONFIG_PATH, FileAccess.READ)
		if f:
			var j = JSON.new()
			if j.parse(f.get_as_text()) == OK and j.data is Dictionary:
				f.close()
				return j.data
			f.close()
	return {"mcpServers": {}}

func refresh_mcp() -> void:
	if not _mcp_list:
		return
	for c in _mcp_list.get_children():
		c.queue_free()

	var catalog = _load_catalog()
	var servers: Array = catalog.get("mcpServers", [])
	var mcp_cfg = _read_mcp_config()
	var active_servers: Dictionary = mcp_cfg.get("mcpServers", {})

	for srv in servers:
		var srv_id = str(srv.get("id", ""))
		var srv_name = str(srv.get("name", srv_id))
		var srv_desc = str(srv.get("description", ""))
		var is_active = active_servers.has(srv_id)

		var panel = PanelContainer.new()
		var vbox = VBoxContainer.new()
		panel.add_child(vbox)

		var row = HBoxContainer.new()
		var title = Label.new()
		title.text = "%s — %s" % [srv_id, srv_name]
		title.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		row.add_child(title)

		var badge = Label.new()
		if is_active:
			badge.text = "[Active] "
			badge.add_theme_color_override("font_color", Color(0.2, 0.85, 0.5))
		else:
			badge.text = "[Inactive] "
			badge.add_theme_color_override("font_color", Color(0.55, 0.62, 0.7))
		row.add_child(badge)

		var btn = Button.new()
		btn.text = "Disable" if is_active else "Enable"
		btn.pressed.connect(func(): _toggle_mcp_server(srv, not is_active))
		row.add_child(btn)

		vbox.add_child(row)

		var desc = Label.new()
		desc.text = srv_desc
		desc.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		desc.add_theme_color_override("font_color", Color(0.65, 0.7, 0.78))
		vbox.add_child(desc)

		_mcp_list.add_child(panel)

func _toggle_mcp_server(srv: Dictionary, enable: bool) -> void:
	var srv_id = str(srv.get("id", ""))
	if srv_id.is_empty():
		return
	var cfg = _read_mcp_config()
	if not cfg.has("mcpServers") or not (cfg["mcpServers"] is Dictionary):
		cfg["mcpServers"] = {}

	if enable:
		var entry: Dictionary = {
			"command": str(srv.get("command", "npx")),
			"args": srv.get("args", [])
		}
		if srv.has("env") and srv["env"] is Dictionary:
			entry["env"] = srv["env"]
		cfg["mcpServers"][srv_id] = entry
	else:
		cfg["mcpServers"].erase(srv_id)

	var f = FileAccess.open(MCP_CONFIG_PATH, FileAccess.WRITE)
	if f:
		f.store_string(JSON.stringify(cfg, "\t"))
		f.close()

	_set_footer(("✓ Enabled MCP: " if enable else "Removed MCP: ") + srv_id)
	refresh_mcp()
	refresh_doctor()

func refresh_viewer() -> void:
	if not _viewer_summary:
		return

	var state: Dictionary = {}
	if _plugin and _bridge and _bridge.has_method("export_editor_state"):
		state = _bridge.export_editor_state(_plugin.get_editor_interface())

	var active_scene: Dictionary = state.get("active_scene", {})
	if not active_scene.get("has_active_scene", false):
		_viewer_summary.text = "No scene currently open in the editor.\nOpen any .tscn scene to stream node hierarchy to .devdock/editor_state.json."
		return

	var lines: PackedStringArray = []
	lines.append("[b]Scene:[/b] " + str(active_scene.get("scene_file_path", "(unsaved)")))
	lines.append("[b]Root:[/b] %s (%s) — [b]%d node(s)[/b]" % [
		str(active_scene.get("root_name", "")),
		str(active_scene.get("root_class", "")),
		int(active_scene.get("node_count", 0))
	])
	lines.append("")

	var nodes: Array = active_scene.get("nodes", [])
	for n in nodes:
		var indent = "  ".repeat(int(n.get("depth", 0)))
		var scr = str(n.get("script", ""))
		var scr_tag = (" [color=#38bdf8](" + scr.get_file() + ")[/color]") if scr != "" else ""
		lines.append("%s• [b]%s[/b] : [color=#94a3b8]%s[/color]%s" % [
			indent,
			str(n.get("name", "")),
			str(n.get("type", "")),
			scr_tag
		])

	_viewer_summary.text = "\n".join(lines)

func refresh_doctor() -> void:
	if not _doctor_list:
		return
	for c in _doctor_list.get_children():
		c.queue_free()

	var ver = Engine.get_version_info()
	var installed_skills = _get_installed_skills()
	var mcp_cfg = _read_mcp_config()
	var mcp_count = mcp_cfg.get("mcpServers", {}).size()

	var items = [
		{
			"name": "Godot Engine",
			"ok": true,
			"msg": "Godot %s.%s.%s" % [str(ver.get("major", 4)), str(ver.get("minor", 0)), str(ver.get("patch", 0))]
		},
		{
			"name": "OrbitKit Editor Plugin",
			"ok": true,
			"msg": "Active (res://addons/orbitkit/plugin.cfg)"
		},
		{
			"name": "AI Skills Installed",
			"ok": installed_skills.size() > 0,
			"msg": "%d skill(s) in .agents/skills & .claude/skills" % installed_skills.size()
		},
		{
			"name": "MCP Configuration",
			"ok": mcp_count > 0,
			"msg": "%d server(s) configured in .mcp.json" % mcp_count
		},
		{
			"name": "Live Scene Bridge",
			"ok": FileAccess.file_exists("res://.devdock/editor_state.json"),
			"msg": "Exporting live node tree to .devdock/editor_state.json"
		}
	]

	for item in items:
		var row = HBoxContainer.new()
		var icon = Label.new()
		icon.text = "✓ " if item["ok"] else "⚠ "
		icon.add_theme_color_override("font_color", Color(0.2, 0.85, 0.5) if item["ok"] else Color(0.95, 0.7, 0.2))
		row.add_child(icon)

		var lbl = Label.new()
		lbl.text = "%s: %s" % [item["name"], item["msg"]]
		lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		lbl.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		row.add_child(lbl)

		_doctor_list.add_child(row)
