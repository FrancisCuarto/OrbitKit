@tool
extends EditorPlugin

const DevDockPanel = preload("res://addons/devdock/ui/main_panel.tscn")

var _dock_instance: Control

func _enter_tree() -> void:
	# Initialize DevDock panel
	if DevDockPanel:
		_dock_instance = DevDockPanel.instantiate()
		add_control_to_dock(EditorPlugin.DOCK_SLOT_RIGHT_UL, _dock_instance)
		print("[DevDock] Plugin successfully loaded into Godot Editor.")

func _exit_tree() -> void:
	if _dock_instance:
		remove_control_from_docks(_dock_instance)
		_dock_instance.free()
		print("[DevDock] Plugin unloaded.")

func _get_plugin_name() -> String:
	return "DevDock"
