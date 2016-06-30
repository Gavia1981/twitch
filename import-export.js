(function() {

	var vm = this;
    vm.selectionMode = false;

	vm.debug = true;
	vm.log = function(message) {
		if (vm.debug) console.log(message);
	};

    vm.modalWidth = $(window).width() > 800 ? 800 : 450;

	vm.templates = {};
	vm.templates.styles = $([
            "<style type='text/css'>",
                ".sf-modal { display:none; position: fixed; top: 50%; left: 50%; width: " + vm.modalWidth + "px; margin-left: -" + (vm.modalWidth / 2) + "px; margin-top: -200px; background-color: #fff; border-radius:5px; z-index: 9999; box-shadow: 0 0 0 9999px rgba(0,0,0,0.5), 1px 1px 10px; }",
                ".sf-modal-body { padding: 10px; } ",
                ".sf-modal-header { padding: 10px 10px 0; line-height: 1; border-bottom: 1px solid #ddd; background-color: #f3f3f3; border-radius: 5px 5px 0 0; }",
                ".sf-modal-header a.tab { padding: 8px 15px; border: 1px solid #ddd; display: inline-block; margin-bottom: -1px; border-radius: 5px 5px 0 0; background-color: #ececec; box-shadow:1px 1px 0 #fbfbfb inset; text-decoration: none; font-weight: bold; text-transform: uppercase; color: #666; }",
                ".sf-modal-header a.tab.active { background-color: #fff; border-bottom: 1px solid #fff; box-shadow:0px -1px 2px rgba(0,0,0,0.1);}",
				".sf-modal-footer { padding: 9px 10px 10px; margin: 0px -10px -10px; background-color: #f5f5f5; border-top: 1px solid #ddd; border-radius: 0 0 6px 6px; box-shadow: inset 0 1px 0 #fff; }",
                ".sf-modal textarea { height: 200px; font-size: 10px; margin:0; }",
                "[class*='close-'] { color: #777; font: 14px/100% arial, sans-serif; position: absolute; text-decoration: none; text-shadow: 0 1px 0 #fff; top: 8px; right: 10px; } .close-thik:after { content: '✖'; }",
                ".localStorageItems { margin: 0 -6px 8px 0; overflow-y: auto; max-height: 250px; }",
                ".sf-tab-content { display:none; }",
                ".sf-tab-content.active { display:block; }",
                ".form-control:focus { border-color: #66afe9; outline: 0; }",
				".form-control { display: block; width: 100%; padding: .375rem .75rem; margin-bottom: 15px; font-size: 1rem; line-height: 1.5; color: #55595c; background-color: #fff; background-image: none; border: 1px solid #ccc; border-radius: .25rem; box-shaodw: 1px 1px 2px rgba(0,0,0,0.1) inset; box-sizing: border-box; }",
				".item { display:inline-block; float: left; position: relative; padding:1px 3px; border:1px solid rgba(0,0,0,0.15); border-radius: 3px; margin: 0 3px 3px 0; cursor:pointer; text-overflow: ellipsis; width: " + (vm.modalWidth === 800 ? 24.5 : 49) + "%; box-sizing: border-box; white-space: nowrap; }",
				".item:hover { border:1px solid rgba(0,0,0,0.25); } ", 
                ".item:hover .tt { display: inline-block; }",
                ".tt { display: none; bottom: 100%; left:0; background-color: #2196F3; color: #fff; text-align: center; padding: 2px 5px; border-radius: 6px; position: absolute; z-index: 1; font-size:10px; }",
                ".tt:after { content: ' '; position: absolute; top: 100%; left:10px; border-width: 5px; border-style: solid; border-color: #2196F3 transparent transparent transparent; }",
				".rowAdded.delete { background-color: #F3BC77; }",
                ".rowAdded { background-color: #C8ECC2; }",
                ".rowAdded .checkmark { margin: 2px 8px 1px; }",
                ".rowAdded .checkmark:after { border-color: #000; }",
                ".checkmark { display: inline-block; margin: 2px 2px 1px; }",
                ".checkmark:after { content: ''; display: block; width: 3px; height: 6px; border: solid transparent; border-width: 0 2px 2px 0; transform: rotate(45deg); }",
                ".ls-btn-group { margin:0 15px 7px 0; font-size:14px; color:#ccc; }",
                ".ls-btn-group a { font-weight:bold; }",
                ".ls-btn-group strong { color:#000; }",
                ".row-selected { background-color: #DCF19D !important; }",
                ".toggleButtons { position: fixed; bottom: 20px; left: 20px; }",
                ".toggleButtons a { background-color: #E2E2E2; padding: 5px 15px; border-radius: 3px; border: 1px solid rgba(0,0,0,0.3); font-weight: bold; box-shadow: 2px 2px 0px rgba(0,0,0,0.05); margin:0 2px 2px;}",
                ".ls-alert { background-color: #FFF9F1; border: 1px solid #ebccd1; padding: 8px 15px; font-size: 18px; margin: 0 0 10px 0; border-radius: 4px; }",
                ".notify { position: fixed; bottom: 40px; left: 20px; text-align: center; font-size:16px; width: 300px; border-radius:5px; z-index: 9999; padding:5px 15px; border:1px solid rgba(0,0,0,0.2); }",
                ".notify.success { background-color: #dff0d8; }",
                ".notify.error { background-color: #ebcccc; }",
            "</style>"
        ].join("\n")).appendTo(document.body);

    vm.templates.toggleButtons = $([
        "<div class='toggleButtons'>",
            "<a href='#' class='export'>Exportera</a>",
            "<a href='#' class='mark'>Markera</a>",
            "<a href='#' class='filter'>Filtrera</a>",
            "<a href='#' class='store'>Lagra</a>",
            "<a href='#' class='next'>Nästa</a>",
        "</div>"
    ].join('')).find("a.export").click(function(e) {
        e.preventDefault();
        if (vm.selectionMode) {
            vm.exportSelectedSightings();
            vm.templates.modal.show();
            vm.renderStorageItems();
        } else {
            vm.templates.modal.toggle();
        }
    }).end().find("a.store").hide().click(function(e) {
        e.preventDefault();
        vm.exportSelectedSightings();
    }).end().find("a.mark").hide().click(function(e) {
        e.preventDefault();
        vm.enableSightingSelection();
    }).end().find("a.filter").hide().click(function(e) {
        e.preventDefault();
        vm.filterSightings();
    }).end().find("a.next").hide().click(function(e) {
        e.preventDefault();
        $("#PublicSightingsGridWrapper .t-arrow-next").click();
    }).end().appendTo(document.body); 

	vm.templates.modal = $([
            '<div class="sf-modal">',
                '<div class="sf-modal-header">',
                    '<a href="exportera" class="tab active">Exportera</a>',
                    '<a href="importera" class="tab">Importera</a>',
                '</div>',
            	'<a href="#" class="close-thik"></a>',
            	'<div class="sf-modal-body">',
                    '<div class="sf-tab-content active exportera">',
                		'<div class="ls-btn-group">',
    	            		'<strong> Markera: </strong>',
    					    '<a href="all" class="ls-btn">Alla</a> | ',
    					    '<a href="none" class="ls-btn">Inga</a> | ',
    					    '<a href="sightings" class="ls-btn">Obsar</a> | ',
                            '<a href="delete" class="delete">Radera markerade</a>',
    	  				'</div>',
    	            	'<div class="localStorageItems"></div>',
                        '<div class="sf-modal-footer">',
                            '<textarea class="form-control exportArea" />',
                            '<a href="#" class="resetButton">Rensa formuläret</a>',
                        '</div>',
                    '</div>',
                    '<div class="sf-tab-content importera">',
                        '<textarea class="form-control importArea" />',
                        '<a href="#" class="importButton"><b>Spara</b></a> | <a href="#" class="resetButton">Rensa</a>',
                    '</div>',
	            '</div>',
            '</div>'
        ].join("\n")).appendTo(document.body)
    .find("a.tab").click(function(e) {
        e.preventDefault();
        vm.templates.modal.find("a.tab, .sf-tab-content").removeClass("active");
        vm.templates.modal.find(".sf-tab-content." + $(this).addClass("active").attr("href")).addClass("active").find("textarea").focus();
    }).end().find(".close-thik").click(function(e) {
        e.preventDefault();
        vm.templates.modal.hide();
    }).end().find(".ls-btn").click(function(e) {
    	e.preventDefault();
        vm.markSightings($(this).attr("href"));
    }).end().find(".importButton").click(function(e) {
        e.preventDefault();
        vm.importSightingsToLocalStorage();
    }).end().find(".resetButton").click(function(e) {
        e.preventDefault();
        $(this).siblings("textarea").val("");
    }).end().find(".delete").click(function(e) {
        e.preventDefault();
        vm.deleteSelectedItemsInLocalStorage();
    }).end().find(".localStorageItems").click(function(e) {
    	e.preventDefault();
        if ($(e.target).is(".item")) {
            $(e.target).toggleClass("rowAdded");
            vm.localStorageToJSON();
        }
    }).end();

    vm.notify = function(message, type) {
        $("<div class='notify'/>").text(message).addClass(type).appendTo(document.body).delay(2000).fadeOut(500, function() {
            $(this).remove();
        });
    };

    vm.markSightings = function(action) {
    	$.each(vm.templates.modal.find(".item" + (action === "sightings" ? ":contains('sightingid')" : "")), function() {
			$(this).toggleClass("rowAdded", action !== "none");
    	});
    	vm.localStorageToJSON();
    };

    vm.localStorageToJSON = function() {
    	var exportStorage = {};
    	$.each(vm.templates.modal.find(".item.rowAdded"), function() {
            var key = $.trim($(this).clone().children().remove().end().text());
			exportStorage[key] = localStorage.getItem(key);
    	});
		vm.templates.modal.find(".exportArea").val(JSON.stringify(exportStorage)).select();
    };

    vm.deleteSelectedItemsInLocalStorage = function() {
        if (!vm.templates.modal.find(".item.rowAdded").length) {
            return $("<div class='ls-alert'>Inga fynd har markerats!</strong></div>")
                .insertBefore(vm.templates.modal.find(".localStorageItems")).delay(1000).fadeOut(1000, function() {
                    $(this).remove();
                });
        }
        vm.templates.modal.find(".item.rowAdded").addClass("delete");
        vm.templates.deleteAlert = $("<div class='ls-alert'><strong>Bekräfta radering?</strong> <a href='#' class='yes'>Ja</a> | <a href='#' class='no'>Nej</a></div>");
        vm.templates.deleteAlert.find("a.yes").click(function(e) {
            e.preventDefault()
            var numberOfItems = vm.templates.modal.find(".item.delete").length;
            vm.templates.deleteAlert.fadeOut(500, function() {
                $(this).remove();
                delete vm.templates.deleteAlert;
            });
            vm.templates.modal.find(".item.delete").fadeOut(1000, function() {
                $(this).remove();
                localStorage.removeItem($.trim($(this).clone().children().remove().end().text()));
                vm.localStorageToJSON();
            });
            vm.notify(numberOfItems + " raderades!", "success");
        }).end().find("a.no").click(function(e) {
            e.preventDefault()
            vm.templates.deleteAlert.fadeOut(500, function() {
                $(this).remove();
                delete vm.templates.deleteAlert;
            });
            vm.templates.modal.find(".item.delete").removeClass("delete");
            vm.notify("Raderingen avbröts!", "success");
        }).end().insertBefore(vm.templates.modal.find(".localStorageItems"));
    };

    vm.importSightingsToLocalStorage = function() {
        var counter = 0;
        var importContent = JSON.parse(vm.templates.modal.find(".importArea").val());
        for (var name in importContent) { 
            counter++;
            localStorage.setItem(name, importContent[name])
        }
        if (counter === 0) {
            vm.notify("Importeringen avbröts, objekt saknas!", "error");
        } else {
            vm.notify("Importerade " + counter + " objekt!", "success");
            vm.renderStorageItems();
        }
    };

    vm.renderStorageItems = function() {
    	var str = "", tooltip= "";
    	for (var name in localStorage) { 
            if (name.indexOf("sighting") !== -1) {
                var sighting = JSON.parse(localStorage[name]);
                tooltip = '<span class="tt">' + sighting.TaxonName + ' ' + sighting.SiteName + '</span>';
            } else {
                tooltip = "";
            }
			str += '<div class="item"><span class="checkmark"></span>' + name + ' ' + tooltip + '</div>';
    	}
    	vm.templates.modal.find(".localStorageItems").html(str);
    };

    vm.enableSightingSelection = function() {
        var $rows = $("#PublicSightingsGridWrapper tbody tr:not(.hasCheckbox)").click(function() {
            var checked = $(this).find(":checkbox").is(":checked");
            $(this).find(":checkbox").prop("checked", !checked).end().toggleClass("row-selected", !checked);
        });
        var checkbox = function(sightingId) {
            return "<input type='checkbox' value='" + sightingId + "''>";
        }
        $.each($rows, function() {
            $(this).addClass("hasCheckbox").find("td:first").prepend(checkbox($(this).find("[data-sightingid]").data("sightingid")));
        });
    };

    vm.filterSightings = function() {
        if (localStorage.getItem("selectedSpeciesList") == null) {
            vm.notify("Filtreringen avbröts, listdata saknas!", "error");
            return false;
        }

        if (!$("#PublicSightingsGridWrapper tbody tr.hasCheckbox").length) {
            vm.enableSightingSelection();    
        }
        var selectedSpeciesList = JSON.parse(localStorage.getItem("selectedSpeciesList"));
        $.each($("#PublicSightingsGridWrapper tbody tr.hasCheckbox"), function() {
            $(this).toggle($.inArray($(this).find("[data-taxonid]:eq(0)").data("taxonid"), selectedSpeciesList.speciesList) === -1);
        });
    };

    vm.exportSelectedSightings = function() {
        var counter = 0;
        $.each($("#PublicSightingsGridWrapper tbody tr.row-selected"), function() {
            counter++;
            vm.storeSightingsJSON(vm.createSightingJSON($(this)));
        });
        vm.notify(counter + " fynd lagrades!", "success");
    };

    vm.getListUrl = function(regionName) {
        return [
            "//artportalen.se/List/Top/Species/F%C3%A5glar/Total", 
            vm.selectedRegionType,
            regionName, 
            "AnySite",
            vm.sortListBySpecies ? "OrderByTaxon/Asc" : "OrderByDate/Desc",
            localStorage.getItem("twitch-useralias")
        ].join('/') + "?t=" + new Date().getTime();
    };

    vm.getSpeciesList = function() {
        $.get(vm.getListUrl(regionName), function( data ) {
            vm.missingSpeciesArray = $(data).find("span[data-taxonid]").map(function() {
                return $(this).data("taxonid");
            }).get();
        });
    };

    vm.storeSightingsJSON = function(object) {
        localStorage.setItem("sightingid-" + object.SightingId, JSON.stringify(object));
    };

    vm.createSightingJSON = function(row) {
        return {
            TodaysSightingId : row.find("[data-sightingid]").data("sightingid"),
            SightingId : row.find("[data-sightingid]").data("sightingid"),
            TriggeredValidationLevel : 0,
            TaxonId : row.find("[data-taxonid]").data("taxonid"),
            TaxonSpeciesGroupId : 0,
            SightingPresentation : row.find(".sightingdetails").text(),
            SitePresentation : row.find("[data-siteid]").html(),
            SiteId : row.find("[data-siteid]").data("siteid"),
            SiteName : row.find("[data-siteid]").text(),
            SiteParentId : row.find("[data-siteid]").data("siteid"),
            SiteParentName : row.find("[data-siteid]").text(),
            Observers : row.find(".observerlist").html(),
            PublicCommentId : 0,
            TimePresentation : row.find(".time").text(),
            NoteOfInterest : '"' + row.find(".commenticon").is(".UI-Icon-16-SpecialInfo") + '"',
            Unspontaneous : false,
            UnsureDetermination : false,
            HasImages : !!row.find("a.medialink").length,
            RegionName : $.trim(row.find("[data-siteid]").text().substring(row.find("[data-siteid]").text().lastIndexOf(',') + 1)),
            RegionShortName : $.trim(row.find("[data-siteid]").text().substring(row.find("[data-siteid]").text().lastIndexOf(',') + 1)),
            RegionalSightingState : 1,
            ObservedDatePresentation : row.find("td:eq(2)").clone().children().remove().end().text(),
            PublishedDatePresentation : row.find("td:eq(2)").clone().children().remove().end().text(),
            TaxonScientificName : row.find(".secondarytaxonname").text(),
            TaxonName : row.find("[data-taxonid]:eq(1)").text(),
            Startdate : row.find("td:eq(2)").clone().children().remove().end().text(),
            PublicComment : row.find(".commenticon").attr("original-title")
        };
    };

    vm.init = function() {
        if ($("#viewSightingMode").length) {
            vm.selectionMode = true;
            vm.enableSightingSelection();
            vm.templates.toggleButtons.find("a.store, a.mark, a.filter, a.next").show();
        } else {
            vm.selectionMode = false;
            vm.templates.modal.show();
            vm.templates.modal.find("a.tab:not(.active)").click().end().find("a.tab:not(.active)").hide();
            vm.templates.toggleButtons.find("a.export").text("Importera");
        }        
    };

    vm.init();

})();
