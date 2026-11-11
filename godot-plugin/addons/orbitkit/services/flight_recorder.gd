@tool
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
		f.store_string(JSON.stringify(record, "\t"))
		f.close()

	return record
