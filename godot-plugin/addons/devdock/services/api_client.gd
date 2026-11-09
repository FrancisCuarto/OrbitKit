class_name DevDockApiClient
extends RefCounted

var base_url: String = "http://localhost:4000"

func _init(p_base_url: String = "http://localhost:4000") -> void:
	base_url = p_base_url

func fetch_resources(http_node: HTTPRequest, search: String = "", type: String = "") -> Error:
	var query_parts: Array[String] = []
	if not search.is_empty():
		query_parts.append("search=" + search.uri_encode())
	if not type.is_empty():
		query_parts.append("type=" + type.uri_encode())
		
	var query_str = ""
	if not query_parts.is_empty():
		query_str = "?" + "&".join(query_parts)
		
	var url = base_url + "/api/resources" + query_str
	var headers: PackedStringArray = ["Accept: application/json"]
	return http_node.request(url, headers, HTTPClient.METHOD_GET)

func fetch_resource_detail(http_node: HTTPRequest, resource_id: String) -> Error:
	var url = base_url + "/api/resources/" + resource_id.uri_encode()
	var headers: PackedStringArray = ["Accept: application/json"]
	return http_node.request(url, headers, HTTPClient.METHOD_GET)

func check_compatibility(http_node: HTTPRequest, resource_id: String, engine_version: String) -> Error:
	var url = base_url + "/api/resources/" + resource_id.uri_encode() + "/compatibility?godot=" + engine_version.uri_encode()
	var headers: PackedStringArray = ["Accept: application/json"]
	return http_node.request(url, headers, HTTPClient.METHOD_GET)
