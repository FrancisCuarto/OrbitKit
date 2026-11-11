import fs from 'node:fs/promises';
import path from 'node:path';
import { CURATED_SKILLS } from './skillsManager.js';
import { OFFICIAL_GODOT_MCP_SERVERS } from './mcpManager.js';

export const VGSKILLFRAME_PLUGIN_ID = 'vgskillframe';
export const VGSKILLFRAME_PLUGIN_VERSION = '0.7.0';
export const VGSKILLFRAME_PLUGIN_CFG_RES = 'res://addons/vgskillframe/plugin.cfg';

export const ORBITKIT_PLUGIN_ID = VGSKILLFRAME_PLUGIN_ID;
export const ORBITKIT_PLUGIN_VERSION = VGSKILLFRAME_PLUGIN_VERSION;
export const ORBITKIT_PLUGIN_CFG_RES = VGSKILLFRAME_PLUGIN_CFG_RES;

export interface PluginInstallResult {
  success: boolean;
  version: string;
  enabledInProject: boolean;
  pluginPath: string;
  message: string;
}

export interface PluginStatus {
  installed: boolean;
  enabled: boolean;
  version: string | null;
}

const PLUGIN_CFG_CONTENT = `[plugin]

name="VGskillframe"
description="VGskillframe (Videogame Skill Frame) — AI Skills, MCP Servers, Live Scene Viewer & Blackbox Flight Telemetry for Godot 4"
author="VGskillframe"
version="${VGSKILLFRAME_PLUGIN_VERSION}"
script="plugin.gd"
`;

const PLUGIN_GD_CONTENT = `@tool
extends EditorPlugin

const VGskillframePanelScript = preload("res://addons/vgskillframe/ui/vgskillframe_panel.gd")
const VGskillframeBridgeScript = preload("res://addons/vgskillframe/services/editor_bridge.gd")

var _dock_instance: Control
var _bridge: Node

func _enter_tree() -> void:
	_bridge = VGskillframeBridgeScript.new()
	_bridge.name = "VGskillframeEditorBridge"
	add_child(_bridge)

	_dock_instance = VGskillframePanelScript.new()
	_dock_instance.name = "VGskillframe"
	if _dock_instance.has_method("set_editor_plugin"):
		_dock_instance.call("set_editor_plugin", self, _bridge)

	add_control_to_dock(EditorPlugin.DOCK_SLOT_RIGHT_UL, _dock_instance)

	scene_changed.connect(_on_scene_changed)
	scene_saved.connect(_on_scene_saved)

	if _bridge and _bridge.has_method("export_editor_state"):
		_bridge.call_deferred("export_editor_state", get_editor_interface())

	print("[VGskillframe] Godot Editor plugin v${VGSKILLFRAME_PLUGIN_VERSION} active.")

func _exit_tree() -> void:
	if scene_changed.is_connected(_on_scene_changed):
		scene_changed.disconnect(_on_scene_changed)
	if scene_saved.is_connected(_on_scene_saved):
		scene_saved.disconnect(_on_scene_saved)

	if _dock_instance:
		remove_control_from_docks(_dock_instance)
		_dock_instance.queue_free()
		_dock_instance = null

	if _bridge:
		_bridge.queue_free()
		_bridge = null

	print("[VGskillframe] Plugin unloaded.")

func _on_scene_changed(_scene_root: Node) -> void:
	if _bridge and _bridge.has_method("export_editor_state"):
		_bridge.export_editor_state(get_editor_interface())
	if _dock_instance and _dock_instance.has_method("refresh_viewer"):
		_dock_instance.refresh_viewer()

func _on_scene_saved(_filepath: String) -> void:
	if _bridge and _bridge.has_method("export_editor_state"):
		_bridge.export_editor_state(get_editor_interface())
	if _dock_instance and _dock_instance.has_method("refresh_viewer"):
		_dock_instance.refresh_viewer()

func _get_plugin_name() -> String:
	return "VGskillframe"
`;

const EDITOR_BRIDGE_GD_CONTENT = `@tool
extends Node

const STATE_FILE_PATH = "res://.devdock/editor_state.json"

func export_editor_state(editor_interface: Object) -> Dictionary:
	if not editor_interface:
		return {}

	var dir_path = "res://.devdock"
	if not DirAccess.dir_exists_absolute(dir_path):
		DirAccess.make_dir_recursive_absolute(dir_path)

	var root: Node = editor_interface.get_edited_scene_root()
	var scene_info: Dictionary = {
		"has_active_scene": root != null,
		"scene_file_path": root.scene_file_path if root else "",
		"root_name": root.name if root else "",
		"root_class": root.get_class() if root else "",
		"node_count": 0,
		"nodes": []
	}

	if root:
		var nodes_list: Array = []
		_collect_nodes(root, root, nodes_list, 0)
		scene_info["node_count"] = nodes_list.size()
		scene_info["nodes"] = nodes_list

	var ver_info = Engine.get_version_info()
	var state: Dictionary = {
		"plugin": "VGskillframe",
		"plugin_version": "${VGSKILLFRAME_PLUGIN_VERSION}",
		"updated_at": Time.get_datetime_string_from_system(true),
		"project_name": ProjectSettings.get_setting("application/config/name", "Godot Project"),
		"godot_version": "%s.%s.%s" % [
			str(ver_info.get("major", 4)),
			str(ver_info.get("minor", 0)),
			str(ver_info.get("patch", 0))
		],
		"active_scene": scene_info
	}

	var f = FileAccess.open(STATE_FILE_PATH, FileAccess.WRITE)
	if f:
		f.store_string(JSON.stringify(state, "\\t"))
		f.close()

	return state

func _collect_nodes(node: Node, root: Node, out_list: Array, depth: int) -> void:
	if out_list.size() >= 250 or depth > 12:
		return

	var script_path = ""
	var scr = node.get_script()
	if scr and scr is Resource:
		script_path = scr.resource_path

	var rel_path = "." if node == root else str(root.get_path_to(node))
	out_list.append({
		"name": str(node.name),
		"type": node.get_class(),
		"path": rel_path,
		"script": script_path,
		"depth": depth
	})

	for child in node.get_children():
		_collect_nodes(child, root, out_list, depth + 1)
`;

const FLIGHT_RECORDER_GD_CONTENT = `@tool
extends Node

const TELEMETRY_DIR = "res://.devdock/telemetry"
const LAST_FLIGHT_PATH = "res://.devdock/telemetry/last_flight.json"
const LOG_PATH = "res://.devdock/telemetry/flight_log.jsonl"

var _max_recent_events: int = 30
var _recent_events: Array = []
var _session_id: String = ""
var _started_at: String = ""

func _ready() -> void:
	_session_id = "flight_%d" % int(Time.get_unix_time_from_system() * 1000)
	_started_at = Time.get_datetime_string_from_system(true)

func log_event(event_type: String, action: String = "", details: Dictionary = {}) -> void:
	var event = {
		"timestamp": Time.get_datetime_string_from_system(true),
		"type": event_type,
		"action": action,
		"details": details
	}
	_recent_events.append(event)
	if _recent_events.size() > _max_recent_events:
		_recent_events.pop_front()

func _unhandled_input(event: InputEvent) -> void:
	if not Engine.is_editor_hint():
		if event is InputEventKey and event.is_pressed() and not event.is_echo():
			var key_name = OS.get_keycode_string(event.key_label if event.key_label != 0 else event.physical_keycode)
			log_event("input", key_name, {"type": "key", "pressed": true})
		elif event is InputEventMouseButton and event.is_pressed():
			log_event("input", "mouse_%d" % event.button_index, {"type": "mouse", "pos": [event.position.x, event.position.y]})
		elif event is InputEventJoypadButton and event.is_pressed():
			log_event("input", "joy_%d" % event.button_index, {"type": "joypad"})

func capture_scene_snapshot(root_node: Node = null) -> Dictionary:
	var root: Node = root_node
	if not root:
		var tree = get_tree()
		if tree and tree.root:
			root = tree.current_scene if tree.current_scene else tree.root

	if not root:
		return {}

	var nodes_list: Array = []
	_collect_nodes(root, root, nodes_list, 0)

	var scene_path = ""
	if "scene_file_path" in root:
		scene_path = str(root.scene_file_path)

	return {
		"rootName": str(root.name),
		"rootClass": root.get_class(),
		"sceneFilePath": scene_path,
		"nodeCount": nodes_list.size(),
		"nodes": nodes_list,
		"orphanNodesCount": Performance.get_monitor(Performance.OBJECT_ORPHAN_NODE_COUNT)
	}

func _collect_nodes(node: Node, root: Node, out_list: Array, depth: int) -> void:
	if out_list.size() >= 250 or depth > 12:
		return

	var script_path = ""
	var scr = node.get_script()
	if scr and scr is Resource:
		script_path = scr.resource_path

	var rel_path = "." if node == root else str(root.get_path_to(node))
	out_list.append({
		"name": str(node.name),
		"type": node.get_class(),
		"path": rel_path,
		"script": script_path,
		"depth": depth
	})

	for child in node.get_children():
		_collect_nodes(child, root, out_list, depth + 1)

func dump_telemetry(reason: String = "manual", extra_incident: Dictionary = {}) -> Dictionary:
	if not DirAccess.dir_exists_absolute(TELEMETRY_DIR):
		DirAccess.make_dir_recursive_absolute(TELEMETRY_DIR)

	var incidents: Array = []
	if not extra_incident.is_empty():
		incidents.append(extra_incident)

	var snap = capture_scene_snapshot()
	var ver_info = Engine.get_version_info()

	var record = {
		"sessionId": _session_id,
		"startedAt": _started_at,
		"endedAt": Time.get_datetime_string_from_system(true),
		"status": "crashed" if reason == "crash" or not extra_incident.is_empty() else "ok",
		"projectName": ProjectSettings.get_setting("application/config/name", "Godot Project"),
		"godotVersion": "%s.%s.%s" % [str(ver_info.get("major", 4)), str(ver_info.get("minor", 0)), str(ver_info.get("patch", 0))],
		"incidents": incidents,
		"lastSnapshot": snap,
		"recentEvents": _recent_events
	}

	var f = FileAccess.open(LAST_FLIGHT_PATH, FileAccess.WRITE)
	if f:
		f.store_string(JSON.stringify(record, "\\t"))
		f.close()

	return record
`;

const VGSKILLFRAME_PANEL_GD_CONTENT = `@tool
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
var _blackbox_summary: RichTextLabel
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
	title.text = "● VGskillframe"
	title.add_theme_font_size_override("font_size", 16)
	title.add_theme_color_override("font_color", Color(0.28, 0.55, 0.75))
	header.add_child(title)

	var ver_lbl = Label.new()
	ver_lbl.text = " v${VGSKILLFRAME_PLUGIN_VERSION}"
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

	# Tab 5: Blackbox Flight Recorder
	var blackbox_tab = VBoxContainer.new()
	blackbox_tab.name = "Blackbox"
	var bb_top = HBoxContainer.new()
	var bb_lbl = Label.new()
	bb_lbl.text = "Flight Telemetry & Crash Diagnostic"
	bb_lbl.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	bb_top.add_child(bb_lbl)

	var bb_snap_btn = Button.new()
	bb_snap_btn.text = "Snapshot"
	bb_snap_btn.pressed.connect(func():
		var rec_path = "res://addons/orbitkit/services/flight_recorder.gd"
		if ResourceLoader.exists(rec_path):
			var rec_script = load(rec_path)
			var rec = rec_script.new()
			add_child(rec)
			rec.dump_telemetry("snapshot")
			rec.queue_free()
			refresh_blackbox()
			_set_footer("✓ Telemetry snapshot saved to res://.devdock/telemetry/last_flight.json")
	)
	bb_top.add_child(bb_snap_btn)

	var bb_copy_btn = Button.new()
	bb_copy_btn.text = "Copy AI Prompt"
	bb_copy_btn.pressed.connect(func():
		var prompt = _generate_blackbox_ai_prompt()
		DisplayServer.clipboard_set(prompt)
		_set_footer("✓ AI Debug Prompt copied to clipboard!")
	)
	bb_top.add_child(bb_copy_btn)
	blackbox_tab.add_child(bb_top)

	_blackbox_summary = RichTextLabel.new()
	_blackbox_summary.bbcode_enabled = true
	_blackbox_summary.size_flags_vertical = Control.SIZE_EXPAND_FILL
	_blackbox_summary.selection_enabled = true
	blackbox_tab.add_child(_blackbox_summary)
	_tabs.add_child(blackbox_tab)

	# Footer
	_footer_label = Label.new()
	_footer_label.text = "VGskillframe synced with project."
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
	refresh_blackbox()
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
		var md_content = "---\\nname: %s\\nid: %s\\nversion: %s\\ndescription: %s\\n---\\n\\n%s\\n" % [
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
			f_meta.store_string(JSON.stringify(meta, "\\t"))
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
		f.store_string(JSON.stringify(cfg, "\\t"))
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
		_viewer_summary.text = "No scene currently open in the editor.\\nOpen any .tscn scene to stream node hierarchy to .devdock/editor_state.json."
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

	_viewer_summary.text = "\\n".join(lines)

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
			"name": "VGskillframe Editor Plugin",
			"ok": true,
			"msg": "Active (res://addons/vgskillframe/plugin.cfg)"
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
		},
		{
			"name": "Blackbox Telemetry",
			"ok": true,
			"msg": "Flight recorder ready (res://addons/orbitkit/services/flight_recorder.gd)"
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

func refresh_blackbox() -> void:
	if not _blackbox_summary:
		return

	var file_path = "res://.devdock/telemetry/last_flight.json"
	if not FileAccess.file_exists(file_path):
		_blackbox_summary.text = "[color=#94a3b8]No telemetry recording found.[/color]\\nRun your game or click [b]Snapshot[/b] to capture runtime telemetry and scene state."
		return

	var f = FileAccess.open(file_path, FileAccess.READ)
	if not f:
		_blackbox_summary.text = "[color=#ef4444]Could not open telemetry file.[/color]"
		return

	var json = JSON.new()
	if json.parse(f.get_as_text()) != OK or not (json.data is Dictionary):
		f.close()
		_blackbox_summary.text = "[color=#ef4444]Failed to parse last_flight.json[/color]"
		return
	f.close()

	var data: Dictionary = json.data
	var status = str(data.get("status", "ok"))
	var incidents: Array = data.get("incidents", [])
	var status_color = "#22c55e" if status == "ok" and incidents.is_empty() else "#ef4444"

	var lines: PackedStringArray = []
	lines.append("[b]Status:[/b] [color=%s]%s[/color] | [b]Session:[/b] %s" % [status_color, status.to_upper(), str(data.get("sessionId", ""))])
	lines.append("[b]Time:[/b] %s → %s" % [str(data.get("startedAt", "")), str(data.get("endedAt", "active"))])
	lines.append("[b]Incidents Recorded:[/b] %d" % incidents.size())
	lines.append("")

	if incidents.size() > 0:
		lines.append("[b][color=#f87171]Incident Details:[/color][/b]")
		for inc in incidents:
			if inc is Dictionary:
				lines.append("• [b]%s[/b]: %s" % [str(inc.get("errorType", "ERROR")), str(inc.get("errorMessage", ""))])
				if inc.has("sourceFile"):
					lines.append("  [color=#38bdf8]%s:%s[/color]" % [str(inc.get("sourceFile", "")), str(inc.get("sourceLine", ""))])
	else:
		var snap = data.get("lastSnapshot", {})
		if snap is Dictionary and snap.has("nodeCount"):
			lines.append("[color=#94a3b8]Snapshot recorded cleanly with %d nodes in scene.[/color]" % int(snap.get("nodeCount", 0)))

	_blackbox_summary.text = "\\n".join(lines)

func _generate_blackbox_ai_prompt() -> String:
	var file_path = "res://.devdock/telemetry/last_flight.json"
	if not FileAccess.file_exists(file_path):
		return "# OrbitKit Diagnostic Report\\nNo telemetry record found."

	var f = FileAccess.open(file_path, FileAccess.READ)
	if not f:
		return ""
	var raw = f.get_as_text()
	f.close()

	var json = JSON.new()
	if json.parse(raw) != OK or not (json.data is Dictionary):
		return ""

	var d: Dictionary = json.data
	var incidents: Array = d.get("incidents", [])
	var first_inc: Dictionary = incidents[0] if incidents.size() > 0 else {}

	var prompt_lines: PackedStringArray = []
	prompt_lines.append("# 🚨 OrbitKit Blackbox Diagnostic: Godot Runtime Crash Report")
	prompt_lines.append("")
	prompt_lines.append("- **Session ID**: \`" + str(d.get("sessionId", "")) + "\`")
	prompt_lines.append("- **Status**: \`" + str(d.get("status", "unknown")) + "\`")
	prompt_lines.append("- **Godot Version**: \`" + str(d.get("godotVersion", "")) + "\`")
	if not first_inc.is_empty():
		prompt_lines.append("- **Error**: **" + str(first_inc.get("errorMessage", "")) + "**")
		if first_inc.has("sourceFile"):
			prompt_lines.append("- **Location**: \`" + str(first_inc.get("sourceFile", "")) + ":" + str(first_inc.get("sourceLine", "")) + "\`")
	prompt_lines.append("")
	prompt_lines.append("### 🤖 Instructions for AI Coding Agent")
	prompt_lines.append("Please analyze this Godot crash report, examine node references for nullability or uninstantiated state, and provide the exact GDScript fix.")

	return "\\n".join(prompt_lines)
`;

/**
 * Enables a Godot plugin inside a project.godot file under [editor_plugins]
 */
export async function enablePluginInProjectGodot(
  projectGodotPath: string,
  pluginResPath: string = ORBITKIT_PLUGIN_CFG_RES
): Promise<boolean> {
  const raw = await fs.readFile(projectGodotPath, 'utf8');

  // Check if [editor_plugins] section exists
  const sectionRegex = /^\[editor_plugins\]\s*$/m;
  const sectionMatch = sectionRegex.exec(raw);

  if (!sectionMatch) {
    const suffix = raw.endsWith('\n') ? '' : '\n';
    const updated = `${raw}${suffix}\n[editor_plugins]\n\nenabled=PackedStringArray("${pluginResPath}")\n`;
    await fs.writeFile(projectGodotPath, updated, 'utf8');
    return true;
  }

  // Locate the boundaries of [editor_plugins] section
  const sectionStart = sectionMatch.index + sectionMatch[0].length;
  const restAfterHeader = raw.slice(sectionStart);
  const nextSectionMatch = /^\[[^\]]+\]/m.exec(restAfterHeader);
  const sectionEnd = nextSectionMatch ? sectionStart + nextSectionMatch.index : raw.length;

  const sectionBody = raw.slice(sectionStart, sectionEnd);
  const enabledRegex = /^enabled\s*=\s*PackedStringArray\(([^)]*)\)/m;
  const enabledMatch = enabledRegex.exec(sectionBody);

  if (enabledMatch) {
    const existingItems = enabledMatch[1]
      .split(',')
      .map((s) => s.trim().replace(/^"|"$/g, ''))
      .filter(Boolean);

    if (!existingItems.includes(pluginResPath)) {
      existingItems.push(pluginResPath);
    }

    const formattedArray = existingItems.map((item) => `"${item}"`).join(', ');
    const newEnabledLine = `enabled=PackedStringArray(${formattedArray})`;
    const updatedSectionBody = sectionBody.replace(enabledRegex, newEnabledLine);
    const updated = raw.slice(0, sectionStart) + updatedSectionBody + raw.slice(sectionEnd);
    await fs.writeFile(projectGodotPath, updated, 'utf8');
    return true;
  } else {
    const updatedSectionBody = `\nenabled=PackedStringArray("${pluginResPath}")` + sectionBody;
    const updated = raw.slice(0, sectionStart) + updatedSectionBody + raw.slice(sectionEnd);
    await fs.writeFile(projectGodotPath, updated, 'utf8');
    return true;
  }
}

/**
 * Disables/removes a Godot plugin from project.godot [editor_plugins]
 */
export async function disablePluginInProjectGodot(
  projectGodotPath: string,
  pluginResPath: string = ORBITKIT_PLUGIN_CFG_RES
): Promise<boolean> {
  try {
    const raw = await fs.readFile(projectGodotPath, 'utf8');
    const enabledRegex = /^enabled\s*=\s*PackedStringArray\(([^)]*)\)/m;
    const match = enabledRegex.exec(raw);
    if (!match) return false;

    const existingItems = match[1]
      .split(',')
      .map((s) => s.trim().replace(/^"|"$/g, ''))
      .filter((item) => Boolean(item) && item !== pluginResPath);

    let updated: string;
    if (existingItems.length > 0) {
      const formatted = existingItems.map((i) => `"${i}"`).join(', ');
      updated = raw.replace(enabledRegex, `enabled=PackedStringArray(${formatted})`);
    } else {
      updated = raw.replace(/^enabled\s*=\s*PackedStringArray\([^)]*\)\r?\n?/m, '');
    }

    await fs.writeFile(projectGodotPath, updated, 'utf8');
    return true;
  } catch {
    return false;
  }
}

const ORBITKIT_PANEL_GD_CONTENT = VGSKILLFRAME_PANEL_GD_CONTENT;

/**
 * Checks whether the VGskillframe (or legacy OrbitKit) Godot Editor plugin is installed and enabled in a project
 */
export async function getGodotPluginStatus(projectDir: string): Promise<PluginStatus> {
  const vgPluginCfgPath = path.join(projectDir, 'addons', VGSKILLFRAME_PLUGIN_ID, 'plugin.cfg');
  const legacyPluginCfgPath = path.join(projectDir, 'addons', 'orbitkit', 'plugin.cfg');
  const projectGodotPath = path.join(projectDir, 'project.godot');

  let installed = false;
  let version: string | null = null;
  let enabled = false;

  for (const cfgPath of [vgPluginCfgPath, legacyPluginCfgPath]) {
    try {
      const cfgRaw = await fs.readFile(cfgPath, 'utf8');
      installed = true;
      const verMatch = cfgRaw.match(/version="([^"]+)"/);
      if (verMatch) version = verMatch[1];
      break;
    } catch {
      // Continue check
    }
  }

  try {
    const projRaw = await fs.readFile(projectGodotPath, 'utf8');
    enabled =
      projRaw.includes(VGSKILLFRAME_PLUGIN_CFG_RES) ||
      projRaw.includes('res://addons/orbitkit/plugin.cfg');
  } catch {
    enabled = false;
  }

  return { installed, enabled, version };
}

/**
 * Installs the VGskillframe Godot 4 plugin into <projectDir>/addons/vgskillframe,
 * syncs the local catalog in .devdock/catalog.json, and enables the plugin in project.godot.
 */
export async function installGodotPlugin(projectDir: string): Promise<PluginInstallResult> {
  const resolvedDir = path.resolve(projectDir);
  const projectGodotPath = path.join(resolvedDir, 'project.godot');
  const pluginBaseDir = path.join(resolvedDir, 'addons', VGSKILLFRAME_PLUGIN_ID);

  try {
    await fs.access(projectGodotPath);
  } catch {
    return {
      success: false,
      version: VGSKILLFRAME_PLUGIN_VERSION,
      enabledInProject: false,
      pluginPath: pluginBaseDir,
      message: `No project.godot found in ${resolvedDir}`
    };
  }

  const uiDir = path.join(pluginBaseDir, 'ui');
  const servicesDir = path.join(pluginBaseDir, 'services');
  const devdockDir = path.join(resolvedDir, '.devdock');

  await fs.mkdir(uiDir, { recursive: true });
  await fs.mkdir(servicesDir, { recursive: true });
  await fs.mkdir(devdockDir, { recursive: true });

  // Write plugin files
  await fs.writeFile(path.join(pluginBaseDir, 'plugin.cfg'), PLUGIN_CFG_CONTENT, 'utf8');
  await fs.writeFile(path.join(pluginBaseDir, 'plugin.gd'), PLUGIN_GD_CONTENT, 'utf8');
  await fs.writeFile(path.join(servicesDir, 'editor_bridge.gd'), EDITOR_BRIDGE_GD_CONTENT, 'utf8');
  await fs.writeFile(path.join(servicesDir, 'flight_recorder.gd'), FLIGHT_RECORDER_GD_CONTENT, 'utf8');
  await fs.writeFile(path.join(uiDir, 'vgskillframe_panel.gd'), VGSKILLFRAME_PANEL_GD_CONTENT, 'utf8');
  await fs.writeFile(path.join(uiDir, 'orbitkit_panel.gd'), ORBITKIT_PANEL_GD_CONTENT, 'utf8');

  // Write curated catalog to .devdock/catalog.json so the Godot Editor plugin works offline
  const catalogData = {
    version: VGSKILLFRAME_PLUGIN_VERSION,
    updatedAt: new Date().toISOString(),
    skills: CURATED_SKILLS,
    mcpServers: OFFICIAL_GODOT_MCP_SERVERS
  };
  await fs.writeFile(
    path.join(devdockDir, 'catalog.json'),
    JSON.stringify(catalogData, null, 2),
    'utf8'
  );

  // Enable automatically in project.godot
  const enabledInProject = await enablePluginInProjectGodot(
    projectGodotPath,
    VGSKILLFRAME_PLUGIN_CFG_RES
  );

  return {
    success: true,
    version: VGSKILLFRAME_PLUGIN_VERSION,
    enabledInProject,
    pluginPath: pluginBaseDir,
    message: `VGskillframe Godot plugin (v${VGSKILLFRAME_PLUGIN_VERSION}) installed in addons/vgskillframe and enabled in project.godot`
  };
}

/**
 * Uninstalls the VGskillframe (and legacy OrbitKit) Godot plugin from a project and disables it in project.godot
 */
export async function uninstallGodotPlugin(
  projectDir: string
): Promise<{ success: boolean; message: string }> {
  const resolvedDir = path.resolve(projectDir);
  const vgPluginBaseDir = path.join(resolvedDir, 'addons', VGSKILLFRAME_PLUGIN_ID);
  const legacyPluginBaseDir = path.join(resolvedDir, 'addons', 'orbitkit');
  const projectGodotPath = path.join(resolvedDir, 'project.godot');

  await disablePluginInProjectGodot(projectGodotPath, VGSKILLFRAME_PLUGIN_CFG_RES);
  await disablePluginInProjectGodot(projectGodotPath, 'res://addons/orbitkit/plugin.cfg');

  try {
    await fs.rm(vgPluginBaseDir, { recursive: true, force: true });
  } catch {
    // Ignore if already removed
  }
  try {
    await fs.rm(legacyPluginBaseDir, { recursive: true, force: true });
  } catch {
    // Ignore if already removed
  }

  return {
    success: true,
    message: `Removed addons/vgskillframe and disabled plugin in project.godot`
  };
}
