(function parseTodaysSightings() {

    // This code is inserted via a bookmarklet to parse Todays Sighting in Species Gateway for twitchable species
    // Open https://artpoprtalen.se/mobile/sightings
    // Go to the province or municipality you wish to parse
    // Load the bookmarklet
    // The species list for the userAlias based on the current municipality or province are loaded 
    // An array of Taxonid from the species list are extracted from the loaded species list
    // The species array are used to filter Todays Sighting for missing species
    function twitchViewModel () {

        var vm = this; 

        vm.sightings = [];
        vm.missingSpeciesArray = [];

        // Loading sightings active?
        vm.extractionIsActive = false;
        vm.extractionActivated = function(state) {
            vm.extractionIsActive = state;
            vm.Templates.modal.find(".btn-abort i").toggleClass("icon-play", !vm.extractionIsActive).toggleClass("icon-pause", vm.extractionIsActive);
            vm.Templates.modal.find(".loader").toggle(vm.extractionIsActive);
            return state;
        };

        // Subscribe to changes of sightings (eg. loading new ones)
        vm.sightingSubscription = null;
        vm.toggleSightingSubscription = function(toggle) {
            if (toggle) {
                vm.sightingSubscription = window.viewModel.sightings.subscribe(function(newValue) {
                    setTimeout(function() {
                        vm.displaySightings();
                    }, 300);
                });
            } else {
                vm.sightingSubscription.dispose();
            }
        }

        // HTML Templates and Styles
        vm.Templates = {};

        // Add some style to inserted elements
        vm.Templates.styles = $([
            "<style type='text/css'>",
                "#btnToggleTwitch { position: fixed; bottom:20px; left:20px; z-index:9999; }",
                ".loader { height: 4px; width: 100%; position: relative; overflow: hidden; background-color: #ddd; }",
                ".loader:before{ display: block; position: absolute; content: ''; left: -200px; width: 200px; height: 4px; background-color: #2980b9; animation: loading 2s linear infinite; }",
                "@keyframes loading { from {left: -200px; width: 30%;} 50% {width: 30%;} 70% {width: 70%;} 80% { left: 50%;} 95% {left: 120%;} to {left: 100%;} }",
                "#extractedsightings h4 { margin: 1em 0 0;border-bottom: 1px solid #999; }",
                "#extractedsightings tr:not(.divider) { cursor:pointer; border-bottom:1px solid #eee; }",
                "#extractSightingsModal .modal-footer { padding: 7px; }",
                ".rowAdded { background-color: #FFEB3B; }",
                ".rowAdded .checkmark { margin: 2px 8px 1px; }",
                ".rowAdded .checkmark:after { border-color: #000; }",
                ".checkmark { display: inline-block; margin: 2px 2px 1px; }",
                ".checkmark:after { content: ''; display: block; width: 3px; height: 6px; border: solid transparent; border-width: 0 2px 2px 0; transform: rotate(45deg); }",
                ".exportSightings { z-index: 9999; position: fixed; top: 0; right: 0; left: 0; bottom: 0; width: 100%; background-color: #fff; padding:5px; }",
                ".exportSightings .btn { position:fixed; top:10px; right:25px; }",
                ".btn-small [class^='icon-'], .btn-small [class*=' icon-'] { margin-left: 5px; border-left: 1px solid #DCDCDC; padding: 7px 0px 5px 8px; }",
            "</style>"
        ].join("\n")).appendTo(document.body);

        // The button used to show or hide to modal window
        vm.Templates.button = $('<button type="button" class="btn btn-large btn-success" id="btnToggleTwitch"><i class="icon-eye-open"></i></button>').click(function(e) {
            e.preventDefault();
            $("#sightingInfoModal").modal('hide');
            vm.Templates.modal.modal("show");
        }).appendTo(document.body);

        // The modal window for sightings
        vm.Templates.modal = $([
            '<div class="modal hide in" id="extractSightingsModal">',
                '<div class="modal-header">',
                    '<button type="button" class="close" data-dismiss="modal"><span>&times;</span></button>',
                    '<span class="modal-title"><b>0</b> fynd hittades</span>',
                '</div>',
                '<div class="loader"></div>',
                '<div class="modal-body">',
                    '<div class="loadingmessage"><img src="//artportalen.se/Content/Images/ajax-loader-circle.gif"> Letar kryss...</div>',
                '</div>',
                '<div class="modal-footer">',
                    '<a href="#" class="btn btn-small pull-left btn-settings">Inställningar <i class="icon-cog"></i></a>',
                    '<a href="#" class="btn btn-small btn-export">Exportera <i class="icon-cloud-download"></i></a>',
                    '<a href="#" class="btn btn-small pull-right btn-abort">Scanna <i class="icon-pause"></i></a>',
                '</div>',
            '</div>'
        ].join("\n")).appendTo(document.body).modal("show").find("button.close").click(function() {
            // Closing the modal will clean upp DOM and subscription to knockout observeable
            // vm.toggleSightingSubscription(false);
            vm.extractionActivated(false);
        }).end().find(".btn-abort").click(function(e) {
            e.preventDefault();
            var $btn = $(this);
            var currentState = vm.extractionIsActive;
            vm.extractionActivated(!currentState);
            if (!currentState) vm.pageForward();
        }).end().find(".btn-export").click(function(e) {
            e.preventDefault();
            vm.extractionActivated(false);
            vm.toggleSightingSubscription(false);
            vm.Templates.modal.modal("hide");
            $("#bookmarks").click();
            setTimeout(function() {
                vm.exportSightings();
            }, 500);
        }).end().find(".btn-settings").click(function(e) {
            e.preventDefault();
            vm.showSettings();
        }).end();

        // The table used inside the modal to show extracted sighting
        vm.Templates.table = $("<table id='extractedsightings'></table>").on( "click", "tr:not(.divider)", function() {
            $(this).addClass("rowAdded");
            vm.showSightingInfo($(this).data("todayssightingid"));
        }).appendTo(vm.Templates.modal.find(".modal-body"));

        vm.Templates.exportView = $([
            '<div class="modal hide in" id="exportSightings">',
                '<div class="modal-header">',
                    '<b>Exportera</b>',
                    '<button type="button" class="close" data-dismiss="modal"><span>&times;</span></button>',
                '</div>',
                '<div class="modal-body">',
                    '<div id="exportArea"></div>',
                '</div>',
            '</div>'
        ].join("\n")).appendTo(document.body);

        vm.Templates.settingsForm = $([
            '<form>',
                '<div class="form-group">',
                    '<input type="text" class="form-control" id="input_useralias" placeholder="Användaralias">',
                '</div>',
                '<button type="submit" class="btn btn-primary">Spara</button>',
            '</form>'
        ].join("\n")).find(".btn-primary").click(function(e) {
            // Paus or play extraction
            e.preventDefault();
            localStorage.setItem("twitch-useralias", vm.Templates.settingsForm.find("#input_useralias").val());
            vm.Templates.settingsForm.hide();
            vm.Templates.modal.find(".modal-footer").show();
            vm.Templates.modal.find(".modal-title").html("<b>" + vm.Templates.modal.find("#extractedsightings tr:not(.divider)").length + "</b> fynd hittades");
            vm.firstLoad();
        }).end();

        vm.showSettings = function() {
            vm.Templates.modal.find(".modal-title").html("<b>Inställningar</b>");
            vm.Templates.modal.find(".modal-footer").hide();
            vm.Templates.modal.find(".modal-body").html(vm.Templates.settingsForm);
            vm.Templates.settingsForm.find("#input_useralias").val(localStorage.getItem("twitch-useralias") || "");
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

        vm.exportSightings = function() {
            var exportSightingsArray = [];
            var regionName = "";
            $.each(window.viewModel.sightings(), function(index, sighting) {
                if (regionName !== sighting.RegionName) {
                    exportSightingsArray.push("<br><b>------- " + sighting.RegionName + " -------</b>");
                    regionName = sighting.RegionName;
                }
                exportSightingsArray.push([
                    "<b>" + window.viewModel.renderTaxonName(sighting) + "</b>",
                    " - <a href='https://artportalen.se/Sighting/'" + sighting.SightingId + ">" + $(sighting.SitePresentation + ', ' + sighting.RegionShortName).text() + "</a>"
                ].join(" "));
                exportSightingsArray.push([
                    sighting.SightingPresentation,
                    sighting.ObservedDatePresentation + ' - ' + sighting.TimePresentation,
                    "(" + $(sighting.Observers).text() + ")",
                    sighting.PublicComment ? "<i>[" + sighting.PublicComment + "]</i>" : ""
                ].join(" "));
            });
            vm.Templates.exportView.modal("show").find("#exportArea").html(exportSightingsArray.join("<br>"));
            setTimeout(function() {
                vm.selectText("exportArea");
            }, 500);
        };

        // Pageing withing the host viewmodel. If at last page, go one day back until the end is reached
        vm.pageForward = function() {
            if (!vm.extractionIsActive) return false;
            if (window.viewModel.pageIndex() != window.viewModel.maxPageIndex() && window.viewModel.maxPageIndex() > 0) {
                window.viewModel.setPageIndex(window.viewModel.pageIndex() + 1, true);
            } else if (window.viewModel.dayNamesBackCount() > 0) {
                $("#btn-daypager .daypager-back").click();
            } else {
                vm.extractionActivated(false);
            }
        };
        
        // The species list for the current area and userAlias used to extract taxonids from
        vm.getListUrl = function() {
            return [
                "//artportalen.se/List/Top/Species/F%C3%A5glar/Total", 
                window.viewModel.selectedAreaIsMunicipality() ? "Kommun" : "Landskap", 
                window.viewModel.selectedAreaName(), 
                "AnySite/OrderByTaxon/Asc", 
                localStorage.getItem("twitch-useralias")
            ].join('/') + "?t=" + new Date().getTime();
        };

        // Filter the array of sightings based on the array of species from the species list
        vm.extractSightings = function() {
            return $.grep(window.viewModel.sightings(), function(obj, index) {
                return $.inArray(obj.TaxonId, vm.missingSpeciesArray) === -1;
            });
        };

        vm.displaySightings = function() {
            if (!vm.extractionIsActive) return false;

            var newSightings = vm.extractSightings();
            var renderedSightings = [];

            $.each(newSightings, function(index, sighting) {
                renderedSightings.push([
                    "<tr data-todayssightingid='" + sighting.TodaysSightingId + "'>",
                        "<td>",
                        "<span class='checkmark'></span>",
                        "<b class='status-level status-level-" + (sighting.RegionalSightingState || 1) + "'>", window.viewModel.renderTaxonName(sighting), "</b> ",
                        sighting.SitePresentation + ', ' + sighting.RegionShortName,
                        sighting.ObservedDatePresentation,
                        "</td>",
                    "</tr>"
                ].join(""));
            });

            vm.sightings = vm.sightings.concat(newSightings);

            if (window.viewModel.pageIndex() == 1) {
                var dateDisplay = window.viewModel.selectedDayName().PresentationDateDayMonthShort + " " + new Date(parseInt(window.viewModel.selectedDayName().Date.substr(6))).getUTCFullYear();
                vm.Templates.modal.find("#extractedsightings").append("<tr class='divider'><td><h4>" + dateDisplay + "</h4></td></tr>");
            }

            vm.Templates.modal.find("#extractedsightings").append(renderedSightings.join(""));
            vm.Templates.modal.find(".modal-title b").text(vm.Templates.modal.find("#extractedsightings tr:not(.divider)").length);
            vm.pageForward();
        };

        vm.showSightingInfo = function(todaysSightingId) {
            window.viewModel.displaySightingInfo(true);
            var selectedSighting = null;
            $.each(vm.sightings, function(index, value) {
                if (vm.sightings[index].TodaysSightingId == todaysSightingId) {
                    selectedSighting = vm.sightings[index];
                    window.viewModel.displaySightingIndex(0); // Calculate index to display sighting X of X message
                }
            });

            window.viewModel.selectedSightingInfo(selectedSighting);
            $("#sightingInfoModal").find("a.btn-bookmark").removeClass("btn-success disabled").find("i").removeClass("icon-ok").addClass("icon-star");
            $("#sightingInfoModal").find("a.btn-removebookmark").hide().end().find("a.btn-bookmark").show();
                    
            function dateToYMD(date) {
                var d = date.getDate(); var m = date.getMonth() + 1; var y = date.getFullYear();
                return '' + y +'-'+ (m<=9?'0'+m:m) +'-'+ (d<=9?'0'+d:d);
            }
        
            window.viewModel.selectedSightingInfo().Startdate = dateToYMD(new Date(+window.viewModel.selectedDayName().Date.replace(/\/Date\((\d+)\)\//, '$1'))); // Convert the JSON-formatted date to a JavaScript date object
            if (typeof window.viewModel.selectedSightingInfo().PublicComment === 'undefined') {
                window.viewModel.selectedSightingInfo().PublicComment = ko.observable(null);
                if (window.viewModel.selectedSightingInfo().PublicCommentId != null) {
                    Artportalen.ajaxPost(
                        Artportalen_ApplicationPath + "/TodaysSightingsGetPublicComment",
                        {
                            TodaysSightingId: window.viewModel.selectedSightingInfo().TodaysSightingId,
                            PublicCommentId: window.viewModel.selectedSightingInfo().PublicCommentId
                        },
                        function(data, code, xht) {
                            window.viewModel.selectedSightingInfo().PublicComment(data.PublicComment);
                        }
                    );
                }
            } else if (typeof window.viewModel.selectedSightingInfo().PublicComment !== 'function') {
                // When the sighting are stored and then removed, the publicComment is converted to a property. Make it a knockout observable again.
                var publicCommentForConversion = window.viewModel.selectedSightingInfo().PublicComment;
                window.viewModel.selectedSightingInfo().PublicComment = ko.observable(publicCommentForConversion);
            }
       
            if (window.viewModel.selectedSightingInfo().HasImages) {
                Artportalen.ajaxPost(
                    Artportalen_ApplicationPath + "/Media/GetThumbnailsBySightingId",
                    {
                        sightingId: window.viewModel.selectedSightingInfo().SightingId,
                    },
                    function(data, code, xht) {
                        window.viewModel.selectedSightingInfo().Images = ko.observableArray(data);
                        window.viewModel.selectedSightingInfo.valueHasMutated();
                });
            }

            vm.Templates.modal.modal("hide");
            $("#sightingInfoModal").modal('show');
        };

        vm.storeSighting = function(sighting) {
            if (self.localStorageEnabled() && localStorage.getItem('sightingid-' + sighting.TodaysSightingId) != null) return false;
            var selectedSighting = sighting;
            selectedSighting.PublicComment = selectedSighting.PublicComment(); // Convert Public Comment from observable to normal property before saving it as stringifyed JSON in local storage
            if (selectedSighting != null) {
                // Save a stringifyed JSON-object that represent the selected sighting
                try {
                    localStorage.setItem('sightingid-' + sightingid, JSON.stringify(selectedSighting));
                } catch (e) {
                    exception = e;
                }
            }
        };

        vm.firstLoad = function() {
            vm.extractionActivated(true);
            $.get(vm.getListUrl(), function( data ) {
                vm.Templates.modal.find(".loadingmessage").hide();

                vm.missingSpeciesArray = $(data).find("span[data-taxonid]").map(function() {
                    return $(this).data("taxonid");
                }).get();

                vm.displaySightings();
                vm.toggleSightingSubscription(true);
            });
        };

        vm.init = function() {
            if (!window.viewModel.localStorageEnabled()) {
                alert("Error! No local storage enabled...");
                return false;
            }

            window.viewModel.setPageSize(50);

            $(document).keyup(function(e) {
                if (e.keyCode == 27) { 
                    vm.extractionActivated(false);
                }
            });

            if (localStorage.getItem('twitch-useralias') === null) {
                vm.extractionActivated(false);
                vm.showSettings();
            } else {
                vm.firstLoad();
            }
        };
        vm.init();
    }

    window.twitchViewModel = new twitchViewModel();
    ko.applyBindings(window.viewModel, window.twitchViewModel.Templates.modal[0]);

})();
