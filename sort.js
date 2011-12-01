// Object which provides extracting data from table
var Extractor = function(rows) {
	this.tableRows = rows;
};

Extractor.prototype = {
	extractAs: function(as) {
		if (typeof this.extracts[as] != "undefined") {
			return this.extracts[]
		}
		else {
			return settings.extracts["default"].apply(this);
		}
	},

	extracts: {
		default: function() {
			return $.trim(this.text());
		}
	},

	addExtract: function(name, extractFunction) {
		this.extracts[name] = extractFunction;
	},
};


var Sorter = function(tableNode) {
	this.rows = this.getRows(tableNode);
	this.extractor = new Extractor(this.rows);
};

Sorter.prototype = {
	// Should return an array
	getRows: function(tableNode) {
		var rows = $(tableNode).toArray();

		return rows;
	},

	compare: function(a, b) {
		if (typeof a == "undefined") {
			return 1;
		}

		if (typeof b == "undefined") {
			return -1;
		}

		if (a == b) {
			return 0;
		}
		else {
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

					extractedA = $this.extractor.extractAs.apply(a, how[i].by),
					extractedB = $this.extractor.extractAs.apply(b, how[i].by);

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
