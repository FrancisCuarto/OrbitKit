@tool
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

	print("[VGskillframe] Godot Editor plugin v0.6.4 active.")

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
