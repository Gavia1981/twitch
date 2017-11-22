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
                "#copybutton { display:none; position: absolute; top: 50%; left: 50%; background-color: #ffffff; width: 200px; line-height: 100px; margin-left: -100px; margin-top: -50px; text-align: center; font-size: 30px; border-radius: 5px; }",
            "</style>"
        ].join("\n")).appendTo(document.body);

	vm.templates.sightingsWrapper = $([
			'<script src="https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/1.5.13/clipboard.min.js"></script>',
            '<div class="view-sightings">',
            	'<a href="#" class="close-thik"></a>',
            	'<div class="sightingsWrapper">',
            		'<table class="sightings" id="sightingsTable"></table>',
            	'</div>',
            	'<a href="#" data-clipboard-target="#sightingsTable" id="copybutton">Kopiera</a>',
            '</div>'
        ].join("\n")).appendTo(document.body)
	.find(".close-thik").click(function(e) {
        e.preventDefault();
        vm.templates.sightingsWrapper.hide();
    }).end().find("#copybutton").click(function(e) {
    	e.preventDefault();

    }).end();

	vm.stripSpeciesName = function(speciesName ) {
		switch(speciesName.toLowerCase()) {
		    case "klippduva (feral pigeon)":
				speciesName = "Tamduva"; break;
		    case "common redpoll":
				speciesName = "Gråsiska"; break;
	        case "lesser redpoll":
				speciesName = "Brunsiska"; break;
		    case "tajgasädgås/tundrasädgås":
				speciesName = "Sädgås"; break;
		}
		return speciesName.replace(/\(hybrid\)|\(viridis\/karelini\)|\/grön fasan|\(canus\)|\(hirundo\)|\(collybita\)|\(merganser\/orientalis\)|\(anser\)|\(alba\/dukhunensis\)|\[major Group\]|\[gentilis Group\]|\[arvensis Group\]|\/vitbröstad skarv|\(carbo\)|\/australisk fiskgjuse|\(haliaetus\)|\/mexikansk and|\/jakutisk nötväcka/gi,"");
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
		var matchHours = /(\d{1,2})\s[hour\(s\)]/g.exec(duration);
		if (matchHours != null) {
		    startDate = addHours(startDate, matchHours[1]); vm.log("vm.setEndDate added (" + matchHours[1] + ") hours. " + startDate);
		}
		var matchMinutes = /(\d{1,2})\s[minute\(s\)]/g.exec(duration);
		if (matchMinutes != null) {
		    startDate = addMinutes(startDate, matchMinutes[1]); vm.log("vm.setEndDate added (" + matchMinutes[1] + ") minutes. " + startDate);
		}
		vm.log("vm.setEndDate after processing startDate = " + startDate);
		return startDate;
	};
	
	vm.mapSiteName = function(siteName) {
		var sites = {
			"Fågelsundet" : ["Fågelsundet", "Björns skärgård"],
			"Rödhäll outlook" : ["Rödhäll", "Björns skärgård"],
			"Hållen" : ["Hållen", "Hållnäs"],
			"Övre Föret": ["Övre Föret", "Årike Fyris"],
			"Boholmen, Ledskärsområdet": ["Boholmen", "Ledskärsområdet"]
		}
		for (var i = 0; i < sites.length; i++) {
			if (sites[i].substr(0, siteName.length) == siteName) {
				return sites[i];
			}
		}
		return [siteName, "&nbsp;"]
	};

	vm.getSite = function() {
		var rawSiteName = $("h5.obs-loc").clone().children().remove().end().text().replace(/\s\s+/g, ' ');
		var findCoordinate = /(\d+\,\d+)(\,|x)(\d+\,\d+)/gi.exec(rawSiteName);
		var coordinates = findCoordinate == null ? ["&nbsp;", "&nbsp;"] : [findCoordinate[1].replace(/,/g, "."), findCoordinate[3].replace(/,/g, ".")];
		var accuracy = findCoordinate == null ? "&nbsp;" : 250;
		rawSiteName = rawSiteName.replace(/^\s*SE-\S+\slän-/gi, '');
		rawSiteName = rawSiteName.replace(/\s-\s\d\d/gi, '');
		var siteNames = vm.mapSiteName(rawSiteName);
		return {
			siteName : siteNames[0],
			parentSiteName : siteNames[1],
			lon : coordinates[0],
			lat : coordinates[1],
			accuracy : accuracy
		};
	};

	vm.getDateTime = function() {
		var sightingDate = new Date($("h5.rep-obs-date").clone().children().remove().end().text());
		var startDate = sightingDate.toISOString().slice(0,10);
		var endDate = vm.setEndDate(sightingDate);
		var startTime = sightingDate.toTimeString().split(' ')[0];
		var endTime = endDate.toTimeString().split(' ')[0];
		return {
			startDate : startDate,
			startTime : startTime.substring(0, 5),
			endDate : endDate.toISOString().slice(0,10),
			endTime : endTime.substring(0, 5)
		};
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
		var site = vm.getSite();
		var dateTime = vm.getDateTime();

		$("#spp-list tr.spp-entry").each(function() {
			var $row = $(this);
			sightingRows.push([
				"<tr>",
					"<td>" + vm.stripSpeciesName($row.find(".se-name").text()) + "</td>", 
					"<td>" + $row.find(".se-count").text() + "</td>", 
					"<td>&nbsp;</td>", 
					"<td>&nbsp;</td>", 
					"<td>&nbsp;</td>", 
					"<td>" + site.siteName + "</td>", /*.split(",")[0]*/
					"<td>" + site.parentSiteName + "</td>", 
					"<td>" + site.lat + "</td>", 	
					"<td>" + site.lon + "</td>", 
					"<td>" + site.accuracy + "</td>", 
					"<td>" + dateTime.startDate + "</td>", 
					"<td>" + dateTime.startTime + "</td>", 
					"<td>" + dateTime.endDate + "</td>", 
					"<td>" + dateTime.endTime + "</td>", 
					"<td>" + $row.find(".obs-comments").text() + "</td>", 
				"</tr>"
				].join(''));
		});
		vm.templates.sightingsWrapper.find(".sightings").html(sightingRows.join(''));
		vm.selectText("sightingsTable");
	};

	vm.copyButton = function() {
		var clipboard = new Clipboard('#copybutton');
		$("#copybutton").click();
	};

	vm.init = function() {
		vm.getSightings();
		setTimeout(function() {
			vm.copyButton();
		}, 1000);
	};

	vm.init();

})();
