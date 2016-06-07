(function parseTodaysSightings(userAlias) {

    // This code is inserted via a bookmarklet to parse Todays Sighting in Species Gateway for twitchable species
    // Open https://artpoprtalen.se/mobile/sightings
    // Go to the province or municipality you wish to parse
    // Load the bookmarklet
    // The species list for the userAlias based on the current municipality or province loads into a hidden iFrame
    // An array of Taxonid from the species list are extracted from the hidden iFrame 
    // The species array are used to filter Todays Sighting for missing species
    function twitchViewModel () {

        var vm = this; 
        vm.userAlias = userAlias;
        vm.sightings = [];

        vm.extractionIsActive = true;
        vm.extractionActivated = function(state) {
            vm.extractionIsActive = state;
            vm.Templates.modal.find(".loader").toggle(vm.extractionIsActive);
            return state;
        };

        vm.missingSpeciesArray = [];

        // Subscribe to changes on the sightings observable on the hist page
        vm.sightingSubscription = null;


        // HTML Templates and Styles
        vm.Templates = {};

        // Add some style to inserted elements
        vm.Templates.styles = $([
            "<style type='text/css'>",
                "#hiddeniframe { position:absolute;left:-1000px;top:0px;}",
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
            "</style>"
        ].join("\n")).appendTo(document.body);

        // This iFrame is hidden and is used to load the species list
        vm.Templates.iFrame = $("<iframe id='hiddeniframe' width='200' height='200'/>").appendTo(document.body);

        // The button used to show or hide to modal window
        vm.Templates.button = $('<button type="button" class="btn btn-success" id="btnToggleTwitch"><i class="icon-eye-open"></i></button>').click(function(e) {
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
                    '<a href="#" class="btn btn-small pull-right btn-abort"><i class="icon-pause"></i></a>',
                '</div>',
            '</div>'
        ].join("\n")).appendTo(document.body).modal("show").find("button.close").click(function() {
            // Closing the modal will clean upp DOM and subscription to knockout observeable
            vm.extractionActivated(false);
            vm.sightingSubscription.dispose();
            vm.Templates.iFrame.remove();
            vm.Templates.styles.remove();
        }).end().find(".btn-abort").click(function(e) {
            // Paus or play extraction
            e.preventDefault();
            var $btn = $(this);
            var currentState = vm.extractionIsActive;
            $btn.find("i").toggleClass("icon-play icon-pause");
            vm.extractionActivated(!currentState);
            if (!currentState) vm.pageForward();
        }).end();

        // The table used inside the modal to show extracted sighting
        vm.Templates.table = $("<table id='extractedsightings'></table>").on( "click", "tr:not(.divider)", function() {
            $(this).addClass("rowAdded");
            console.log("Klickade på todayssightingid: " + $(this).data("todayssightingid"));
            vm.showSightingInfo($(this).data("todayssightingid"));
        }).appendTo(vm.Templates.modal.find(".modal-body"));

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
                vm.userAlias
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

        vm.init = function() {
            window.viewModel.setPageSize(50);

            $(document).keyup(function(e) {
                if (e.keyCode == 27) { 
                    vm.extractionActivated(false);
                }
            });

            //vm.Templates.iFrame.attr("src", vm.getListUrl());
            
            $.get(vm.getListUrl(), function( data ) {
                vm.Templates.modal.find(".loadingmessage").hide();

                vm.missingSpeciesArray = $(data).find("span[data-taxonid]").map(function() {
                    return $(this).data("taxonid");
                }).get();

                vm.displaySightings();
                
                // Subscribe to changes of sightings (eg. loading new ones)
                vm.sightingSubscription = window.viewModel.sightings.subscribe(function(newValue) {
                    setTimeout(function() {
                        vm.displaySightings();
                    }, 300);

                });
            });
        };
        vm.init();
    }

    window.twitchViewModel = new twitchViewModel();
    ko.applyBindings(window.viewModel, window.twitchViewModel.Templates.modal[0]);

})("johans");
