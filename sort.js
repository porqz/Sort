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
		this.rows = this.getRows(table);
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
	// getRows: function(table) {…}, // optional
	// extracts: { // optional
	// 	 	 title: function() {…},
	// 	 	 trackNumber: function() {…}
	// 	 }
	// }
	$.fn.sort = function(options) {
		// Arguments processing
		if (typeof options == "undefined") {
			throw "Initialization error: Sorter must init with arguments.";
		}
		else {
			if ("how" in options) {
				var how = (!Array.isArray(options.how) && [options.how]) || options.how;
			}
			else {
				throw "Initialization error: Sorter must know how it should sort.";
			}

			var getRows = options.getRows || function(table) {
					var table = (table.children("tbody").length && table.children("tbody")) || table,
						rows = [];

					table.children("tr").each(function() {
						var row = $(this);

						if (!row.children("th").length) {
							rows.push(row);
						}
					});
					
					return rows;
				};

			var extracts = options.extracts || {};

			extracts.default = function(extractAs) {
				var row = this;

				return $.trim(row.children().filter("." + extractAs).text());
			};
		}


		var tables = this,

			settings = {
				dataKey: "sortData", // Key for accesing jQuery.data();
			};

		tables.each(function() {
			var table = $(this);

			if (!table.data(settings.dataKey)) {
				table.data(settings.dataKey, new Sorter(table));
			}

			var sorter = table.data(settings.dataKey);

			for (var extract in extracts) {
				sorter.extractor.addExtract(extract, extracts[extract]);
			}

			
		});
	}
})(jQuery);
