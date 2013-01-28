$(document).ready(function () {
	var testedTable = $(".sortable-table"),
		testedTableCells = testedTable.find("th"),
		sortLinks = testedTable.find(".sortable-table__sort-link");

	sortLinks.bind("click", function (e) {
		e.preventDefault();

		var link = $(this),
			cell = link.parent(),
			cellSortId = cell.attr("class").match(/sortable-table__cell_name_(.+?)\b/)[1],
			inversed = !cell.attr("class").match(/sortable-table__cell_sorted_desc\b/);

		testedTableCells
			.removeClass("sortable-table__cell_sorted_asc")
			.removeClass("sortable-table__cell_sorted_desc");

		if (inversed) {
			cell.addClass("sortable-table__cell_sorted_desc");
		}
		else {
			cell.addClass("sortable-table__cell_sorted_asc");
		}

		testedTable.sort({
			how: { by: cellSortId, inversed: inversed },

			extracts: {
				task: function () {
					// Simply text
					return $.trim($(this).children().eq(0).text());
				},

				due: function () {
					var rawDateString = $.trim($(this).children().eq(1).text()),
						// Parsing job is always hard
						dateString = rawDateString.replace(/(\d+?)\.(\d+?).(\d+?)\b\s?((\d+?):(\d+?)?)?\b/g, function($0, $1, $2, $3, $4, $5, $6) {
							return (Number($3) || "0") + " " + // Year
								(Number($2) || "0") + " " + // Month
								(Number($1) || "0") + " " + // Day
								(Number($5) || "0") + " " + // Hours
								(Number($6) || "0"); // Minutes
						});

					if (dateString.length < 10) {
						dateString = "3000 1 1 0 0"; // 3000-th year, I think, that is enough
					}

					var dateArray = dateString.split(" ");

					return new Date(dateArray[0], dateArray[1] - 1, dateArray[2], dateArray[3], dateArray[4]);
				},

				priority: function () {
					// Converting to Number
					return Number($.trim($(this).children().eq(2).text()));
				},

				executor: function () {
					// Sort by last name, than first
					return $.trim($(this).children().eq(3).text()).split(" ").reverse().join(" ");
				}
			}
		});
	});

});
