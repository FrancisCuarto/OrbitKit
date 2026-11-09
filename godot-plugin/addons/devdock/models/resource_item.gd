class_name DevDockResourceItem
extends RefCounted

var id: String = ""
var name: String = ""
var type: String = "godot_addon"
var description: String = ""
var author: String = ""
var license: String = "MIT"
var latest_version: String = "1.0.0"
var tags: Array[String] = []
var downloads_count: int = 0
var manifest_data: Dictionary = {}

static func from_dict(data: Dictionary) -> DevDockResourceItem:
	var item = DevDockResourceItem.new()
	item.id = data.get("id", "")
	item.name = data.get("name", "")
	item.type = data.get("type", "godot_addon")
	item.description = data.get("description", "")
	item.author = data.get("author", "")
	item.license = data.get("license", "MIT")
	item.latest_version = data.get("latest_version", "1.0.0")
	item.downloads_count = data.get("downloads_count", 0)
	
	if data.has("tags"):
		for t in data["tags"]:
			item.tags.append(str(t))
			
	if data.has("manifest"):
		item.manifest_data = data["manifest"]
		
	return item
