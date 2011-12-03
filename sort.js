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


	$.fn.sort = function(options) {
		var tables = this,

			settings = {
				dataKey: "sortData", // Key for accesing jQuery.data();
			};

		tables.each(function() {
			var table = $(this);

			if (table.data(settings.dataKey)) {
				var sorter = table.data(settings.dataKey);
			}
			else {
				var sorter = new Sorter(table);
				table.data(settings.dataKey, sorter);
			}
		});
	}
})(jQuery);
