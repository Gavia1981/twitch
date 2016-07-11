(function() {

	var vm = this;

	vm.debug = false;
	vm.log = function(message) {
		if (vm.debug) console.log(message);
	};

	vm.templates = {};
	vm.templates.styles = $([
            "<style type='text/css'>",
                ".view-sightings { position: fixed; z-index:9999; left:200px; top: 200px; right:200px; background-color:#fff; padding:20px; border-radius:5px; box-shadow: 2px 2px 8px rgba(0,0,0,0.5); }",
                ".sightingsWrapper { overflow:auto; max-height:400px; } ",
                "table.sightings { border: 1px solid #ccc; border-collapse: collapse; width:100%; }",
                "table.sightings td { border: 1px solid #ccc; border-collapse: separate; padding:0 10px 0 3px; }",
                "[class*='close-'] { color: #777; font: 14px/100% arial, sans-serif; position: absolute; right: 5px; text-decoration: none; text-shadow: 0 1px 0 #fff; top: 5px; }",
                ".close-thik:after { content: '✖'; /* UTF-8 symbol */ }",
            "</style>"
        ].join("\n")).appendTo(document.body);

	vm.templates.sightingsWrapper = $([
            '<div class="view-sightings">',
            	'<a href="#" class="close-thik"></a>',
            	'<div class="sightingsWrapper">',
            		'<table class="sightings" id="sightingsTable"></table>',
            	'</div>',
            '</div>'
        ].join("\n")).appendTo(document.body)
	.find(".close-thik").click(function(e) {
        e.preventDefault();
        vm.templates.sightingsWrapper.hide();
    }).end();

	vm.stripSpeciesName = function(speciesName ) {
		return speciesName.replace(/\(hybrid\)|\(viridis\/karelini\)|\/grön fasan|\(canus\)|\(hirundo\)|\(collybita\)|\(merganser\/orientalis\)|\(anser\)|\(alba\/dukhunensis\)|\[major Group\]|\/vitbröstad skarv|\(carbo\)|\/australisk fiskgjuse|\(haliaetus\)|\/jakutisk nötväcka/gi,"");
	};

	function addHours(d, h) {
		var MILLISECS_PER_HOUR = 60 /* min/hour */ * 60 /* sec/min */ * 1000 /* ms/s */;
	  	return new Date(+d + h*MILLISECS_PER_HOUR);
	}

	function addMinutes(date, minutes) {
	    return new Date(date.getTime() + minutes*60000);
	}

	vm.setEndDate = function(startDate) {
		vm.log("vm.setEndDate startDate = " + startDate);
		if (!$("dt:contains('Duration:')").length) return startDate;
		var duration = $("dt:contains('Duration:')").siblings("dd").text();
		if (duration.indexOf("hour(s)") !== -1) {
			var extractTime = duration.split(' hour(s), ');
			startDate = addHours(startDate, extractTime[0]); vm.log("vm.setEndDate added (" + extractTime[0] + ") hours. " + startDate);
			if (duration.indexOf("minute(s)") !== -1) {
				startDate = addMinutes(startDate, extractTime[1].split(" minute(s)")[0]); vm.log("vm.setEndDate added (" + duration.split(" minute(s)")[0] + ") minutes. " + startDate);
			}
		} else {
			startDate = addMinutes(startDate, duration.split(" minute(s)")[0]); vm.log("vm.setEndDate added (" + duration.split(" minute(s)")[0] + ") minutes. " + startDate);
		}
		vm.log("vm.setEndDate after processing startDate = " + startDate);
		return startDate;
	};

    vm.selectText = function(element) {
        var doc = document, text = doc.getElementById(element), range, selection;    
        if (doc.body.createTextRange) {
            range = document.body.createTextRange();
            range.moveToElementText(text);
            range.select();
        } else if (window.getSelection) {
            selection = window.getSelection();        
            range = document.createRange();
            range.selectNodeContents(text);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }

	vm.getSightings = function() {
		var sightingRows = [];
		var siteName = $("h5.obs-loc").clone().children().remove().end().text().replace(/\s\s+/g, ' ');
		var findCoordinate = /(\d+\,\d+)x(\d+\,\d+)/gi.exec(siteName);
		var coordinates = findCoordinate == null ? "&nbsp;" : findCoordinate[0].replace(/,/, ".");
		var sightingDate = new Date($("h5.rep-obs-date").clone().children().remove().end().text());
		var startDate = sightingDate.toISOString().slice(0,10);
		var endDate = vm.setEndDate(sightingDate);
		var startTime = sightingDate.toTimeString().split(' ')[0];
		var endTime = endDate.toTimeString().split(' ')[0];
		$("#spp-list tr.spp-entry").each(function() {
			var $row = $(this);
			sightingRows.push([
				"<tr>",
					"<td>" + vm.stripSpeciesName($row.find(".se-name").text()) + "</td>", 
					"<td>" + $row.find(".se-count").text() + "</td>", 
					"<td>&nbsp;</td>", 
					"<td>&nbsp;</td>", 
					"<td>&nbsp;</td>", 
					"<td>" + siteName.split(",")[0] + "</td>", 
					"<td>" + coordinates + "</td>", 
					"<td>&nbsp;</td>", 
					"<td>&nbsp;</td>", 
					"<td>&nbsp;</td>", 
					"<td>" + startDate + "</td>", 
					"<td>" + startTime.substring(0, 5) + "</td>", 
					"<td>" + startDate + "</td>", 
					"<td>" + endTime.substring(0, 5) + "</td>", 
					"<td>" + $row.find(".obs-comments").text() + "</td>", 
				"</tr>"
				].join(''));
		});
		vm.templates.sightingsWrapper.find(".sightings").html(sightingRows.join(''));
		vm.selectText("sightingsTable");
	};

	vm.init = function() {
		vm.getSightings();
	};

	vm.init();

})();
