@tool
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
		"plugin": "OrbitKit",
		"plugin_version": "0.5.0",
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
		f.store_string(JSON.stringify(state, "\t"))
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
