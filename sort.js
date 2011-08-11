(function($) {

	// Usecases:
	// $(…).sort("title");
	// $(…).sort("title rating");
	// $(…).sort("title", "rating");
	//
	// $(…).sort(["title"]);
	// $(…).sort(["title rating"]);
	// $(…).sort(["title", "rating"]);
	//
	// $(…).sort({ by: "title" });
	// $(…).sort({ by: "title rating" });
	// $(…).sort({ by: "title rating", order: "desc" });
	//
	// $(…).sort({ by: "title rating", order: "desc", extracts: {…} })
	//
	// $(…).sort({ by: "title", order: "desc" }, { by: "rating", order: "asc" });
	//

	$.fn.sort = function() {
		// TODO: arguments type detections

		/* Settings */
		var 
			s = // Short alias
			settings = {
				as_prefix: "as-",
				sortable_classname: "js-sortable",
				
				extracts: {
					default: function() {
						return $.trim(this.text());
					},

					rating: function() {
						return this.children(".full").length + this.children(".half").length * 0.5;
					}
				},

				// Default get items method,
				// returns an array
				get_items: function() {
					return this.children().toArray();
				},

				sorting_data: [],

				by: "default"
			},
			/* /Settings */

		extract = function(as) {
			if (typeof settings.extracts[as] != "undefined") {
				return settings.extracts[as].apply(this);
			}
			else {
				return settings.extracts["default"].apply(this);
			}
		},

		extract_from_string = function(string, part) {
			var regexp_result = RegExp("\\b" + part + "(.+)\\b", "g").exec(string);

			if (regexp_result)
				return regexp_result[0].split(" ")[0].replace(part, "")
			else
				return "";
		},

		sort = function(array, by) {
			var by_is_array = (typeof by == "object" && typeof by.length != "undefined");

			if (by_is_array) {
				var current_by_index = 0,
					current_by_field = by[current_by_index].key;
			}
			else {
				var current_by_field = by;
			}

			array.sort(function(a, b) {
				var result,
					order = by[current_by_index].order;

				var compare = function() {
					var a = arguments[0],
						b = arguments[1],

						order_multiplier = 1;

					current_by_field = by[current_by_index].key;

					if (typeof arguments[2] != "undefined") {
						order_multiplier = (arguments[2] == "d" || arguments[2] == "desc" || arguments[2] == "descent") ? -1 : 1;
					}

					if (typeof a.keys[current_by_field] == "undefined") {
						current_by_index = 0;
						return 1;
					}

					if (typeof b.keys[current_by_field] == "undefined") {
						current_by_index = 0;
						 return -1;
					}

					if (a.keys[current_by_field] == b.keys[current_by_field]) {
						if (by_is_array && current_by_index < (by.length - 1)) {
							current_by_index = current_by_index + 1;
							current_by_field = by[current_by_index].key;

							result = compare.apply(this, [a, b, order]);
						}
						else {
							result = 0;
						}
					}
					else {
						if (a.keys[current_by_field] > b.keys[current_by_field]) {
							result = 1;
						}
						else {
							result = -1;
						}
					}

					current_by_index = 0;

					return result * order_multiplier;
				}

				return compare(a, b, order);
			});
		};

		var lists = this;

		lists.each(function() {
			var list = $(this),

			by = s.by;

			if (options) {
				// Is for:
				// $(...).sort("title");
				if (typeof options == "string") {
					by = [{ key: options, order: "asc" }];
				}
				else {
					if (typeof options == "object") {
						
						if (options.length) {
							by = [];

							for (var i = 0; i < options.length; i++) {
								// Is for:
								// $(...).sort(["title", "rating"])
								if (typeof options[i] == "string") {
									by.push({ key: options[i], order: "asc" });
								}
								// Is for:
								// $(...).sort([
								// 							{ key: "title", order: "asc" }, 
								// 							{ key: "rating", order: "desc" }
								// 						])
								else {
									by.push({ key: options[i].key, order: (options[i].order != "") ? options[i].order : "asc" });
								}
							}
						}
						// Is for:
						// $(...).sort({ by: ["title", "rating"] });
						// $(...).sort({ by: ["title", "rating"], order: "asc" });
						else {
							$.extend(settings, options);

							var order = (typeof options.order != "undefined") ? options.order : "asc";

							by = [];

							for (var i = 0; i < options.by.length; i++) {
								by.push({ key: options.by[i], order: order });
							}
						}
					}
					
				}
			}

			log(by)

			if (!list.data("sortingData")) {
				var items = s.get_items.apply(list),
					sorting_data = settings.sorting_data;

				for (var i = 0; i < items.length; i++) {
					var item = $(items[i]),
						sortable_fields = item.find("." + s.sortable_classname);

					sorting_data.push({
						keys: {},
						node: items[i]
					});

					sortable_fields.each(function() {
						var field = $(this),
							sortable_as = extract_from_string(this.className, s.as_prefix);

						sorting_data[sorting_data.length - 1].keys[sortable_as] = extract.apply(field, [sortable_as]);
					});
				}

				list.data("sortingData", sorting_data);
			}

			var sorting_data = list.data("sortingData");

			sort(sorting_data, by);

			for (var i = 0; i < sorting_data.length; i++) {
				list.append(sorting_data[i].node);
			}
		});
	}

})(jQuery);
