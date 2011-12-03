(function($) {

	// Object which provides extracting data from table
	var Extractor = function() {};

	Extractor.prototype = {
		extract: function(from, as) {
			if (typeof this.extracts[as] != "undefined") {
				return this.extracts[as].apply(from);
			}
			else {
				return this.extracts.default.call(from, as);
			}
		},
			
		// Methods which extracts sortable data from row
		extracts: {
			default: function(as) {
				return this[as];
			}
		},
		
		addExtract: function(name, extractFunction) {
			this.extracts[name] = extractFunction;
		},
	};


	// Object which provides sorting
	var Sorter = function(table) {
		if (typeof table != "undefined") {
			this.rows = this.getRows(table);
		}

		this.extractor = new Extractor;
	};

	Sorter.prototype = {
		// Should return an array
		getRows: function(array) {
			return array;
		},

		compare: function(a, b) {
			if (a == b) {
				return 0;
			}
			else {
				if (typeof a == "undefined") {
					return 1;
				}

				if (typeof b == "undefined") {
					return -1;
				}

				if (a > b) {
					return 1;
				}
				else {
					return -1;
				}
			}
		},

		// How is an array of objects,
		// example: [{ by: "title" }, { by: "trackNumber", inversed: true }]
		sort: function(how) {
			var $this = this;

			$this.rows.sort(function(a, b) {
				var compareResult = 0;

				for (var i = 0; i < how.length && compareResult == 0; i++) {
					var inversed = !!how[i].inversed,

						extractedA = $this.extractor.extract(a, how[i].by),
						extractedB = $this.extractor.extract(b, how[i].by);

					if (inversed) {
						compareResult = $this.compare(extractedB, extractedA);
					}
					else {
						compareResult = $this.compare(extractedA, extractedB);
					}
				}
				
				return compareResult;
			});

			return $this.rows;
		}
	}


	// Option is object:
	// { 
	// how: [{ by: "title" }, { by: "trackNumber", inversed: true }], 
	// getRows: function() {…}, // optional
	// extracts: { // optional
	// 	 	 title: function() {…},
	// 	 	 trackNumber: function() {…}
	// 	 }
	// }
	$.fn.sort = function(options) {

		var utils = {
				processOptions: function(options) {
					var processedOptions = {};

					if ("how" in options) {
						processedOptions.how = (!Array.isArray(options.how) && [options.how]) || options.how;
					}

					if ("getRows" in options) {
						processedOptions.getRows = options.getRows;
					}
					else {
						processedOptions.getRows = function() {
							var table = ($(this).children("tbody").length && $(this).children("tbody")) || $(this),
								rows = [];

							table.children("tr").each(function() {
								var row = $(this);

								if (!row.children("th").length) {
									rows.push(this);
								}
							});
							
							return rows;
						};
					}

					if ("extracts" in options) {
						processedOptions.extracts = options.extracts;
					}
					else {
						processedOptions.extracts = {};
					}

					processedOptions.extracts.default = function(extractAs) {
						var row = $(this);

						return $.trim(row.children().filter("." + extractAs).text());
					};

					return processedOptions;
				},

				updateTable: function(table, rows) {
					$(rows).each(function() {
						var row = $(this);

						row.detach();
						table.append(row);
					});
				}
			};

		// Arguments processing
		if (typeof options == "undefined") {
			throw "Initialization error: Sorter must init with arguments.";
		}
		else {
			var options = utils.processOptions(options);
		}
			
		var tables = this,

			settings = {
				dataKey: "sortData", // Key for accesing jQuery.data();
			};

		tables.each(function() {
			var table = $(this);

			if (!table.data(settings.dataKey)) {
				table.data(settings.dataKey, new Sorter());
			}

			var sorter = table.data(settings.dataKey);

			sorter.rows = options.getRows.apply(table);

			for (var extractKey in options.extracts) {
				sorter.extractor.addExtract(extractKey, options.extracts[extractKey]);
			}

			// Sorting
			var sortedRows = sorter.sort(options.how);
			utils.updateTable(table, sortedRows);
		});

		return tables;
	}
})(jQuery);
