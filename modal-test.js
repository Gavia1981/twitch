(function parseTodaysSightings(userAlias) {

    function twitchViewModel () {

        var vm = this; 
        vm.userAlias = userAlias;
        vm.sightings = [];
        vm.renderedSightings = [];

        vm.extractionIsActive = true;
        vm.extractionActivated = function(state) {
            vm.extractionIsActive = state;
            vm.Templates.modal.find(".loader").toggle(vm.extractionIsActive);
            return state;
        };

        vm.missingSpeciesArray = [];
        vm.sightingSubscription = null;

        vm.Templates = {};
        vm.Templates.iFrame = $("<iframe />").appendTo(document.body).hide();
        vm.Templates.modal = $([
            '<div class="modal hide in" id="extractSightingsModal">',
                '<div class="modal-header">',
                    '<button type="button" class="close" data-dismiss="modal"><span>&times;</span></button>',
                    '<span class="modal-title"><b>0</b> fynd hittades</span>',
                '</div>',
                '<div class="loader"></div>',
                '<div class="modal-body">',
                    '<div class="loadingmessage"><img src="https://artportalen.se/Content/Images/ajax-loader-circle.gif"> Letar kryss...</div>',
                '</div>',
                '<div class="modal-footer">',
                    '<a href="#" class="btn btn-small pull-right btn-abort"><i class="icon-pause"></i></a>',
                '</div>',
            '</div>'
        ].join("\n")).appendTo(document.body).modal("show").find("button.close").click(function() {
            vm.extractionActivated(false);
            vm.sightingSubscription.dispose();
            vm.Templates.iFrame.remove();
            vm.Templates.styles.remove();
        }).end().find(".btn-abort").click(function(e) {
            e.preventDefault();
            var $btn = $(this);
            var currentState = vm.extractionIsActive;
            $btn.find("i").toggleClass("icon-play icon-pause");
            vm.extractionActivated(!currentState);
            if (!currentState) vm.pageForward();
        }).end();

        vm.Templates.table = $("<table id='extractedsightings'></table>").on( "click", "tr:not(.divider)", function() {
            $(this).addClass("rowAdded");
        }).appendTo(vm.Templates.modal.find(".modal-body"));

        vm.Templates.styles = $([
            "<style type='text/css'>",
                ".loader { height: 4px; width: 100%; position: relative; overflow: hidden; background-color: #ddd; }",
                ".loader:before{ display: block; position: absolute; content: ''; left: -200px; width: 200px; height: 4px; background-color: #2980b9; animation: loading 2s linear infinite; }",
                "@keyframes loading { from {left: -200px; width: 30%;} 50% {width: 30%;} 70% {width: 70%;} 80% { left: 50%;} 95% {left: 120%;} to {left: 100%;} }",
                "#extractedsightings h4 { margin: 1em 0 0;border-bottom: 1px solid #999; }",
                "#extractedsightings tr:not(.divider) { cursor:pointer; }",
                "#extractSightingsModal .modal-footer { padding: 7px; }",
                ".rowAdded { background-color: #FFEB3B; }",
                ".rowAdded .checkmark:after { border-color: #000; }",
                ".checkmark { display: inline-block; margin: 2px 8px 1px; }",
                ".checkmark:after { content: ''; display: block; width: 3px; height: 6px; border: solid transparent; border-width: 0 2px 2px 0; transform: rotate(45deg); }",
            "</style>"
        ].join("\n")).appendTo(document.body);

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

        vm.getListUrl = function() {
            return [
                "https://artportalen.se/List/Top/Species/F%C3%A5glar/Total", 
                window.viewModel.selectedAreaIsMunicipality() ? "Kommun" : "Landskap", 
                window.viewModel.selectedAreaName(), 
                "AnySite/OrderByTaxon/Asc", 
                vm.userAlias
            ].join('/') + "?t=" + new Date().getTime();
        };

        vm.extractSightings = function() {
            return $.grep(window.viewModel.sightings(), function(obj, index) {
                return $.inArray(obj.TaxonId, vm.missingSpeciesArray) === -1;
            });
        };

        vm.displaySightings = function() {
            if (!vm.extractionIsActive) return false;

            vm.sightings = vm.extractSightings();

            $.each(vm.sightings, function(index, sighting) {
                vm.renderedSightings.push([
                    "<tr>",
                        "<td>",
                        "<span class='checkmark'></span>",
                        "<b class='status-level status-level-" + (sighting.RegionalSightingState || 1) + "'>", window.viewModel.renderTaxonName(sighting), "</b> ",
                        sighting.SitePresentation + ', ' + sighting.RegionShortName,
                        sighting.ObservedDatePresentation,
                        "</td>",
                    "</tr>"
                ].join(""));
            });

            if (window.viewModel.pageIndex() == 1) {
                var dateDisplay = window.viewModel.selectedDayName().PresentationDateDayMonthShort + " " + new Date(parseInt(window.viewModel.selectedDayName().Date.substr(6))).getUTCFullYear();
                vm.Templates.modal.find("#extractedsightings").append("<tr class='divider'><td><h4>" + dateDisplay + "</h4></td></tr>");
            }

            vm.Templates.modal.find("#extractedsightings").append(function() {
                var html = vm.renderedSightings.join("");
                vm.renderedSightings = [];
                return html;
            });

            vm.Templates.modal.find(".modal-title b").text(vm.Templates.modal.find("#extractedsightings tr:not(.divider)").length);
            vm.pageForward();
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
        }

        vm.init = function() {
            window.viewModel.setPageSize(50);

            $(document).keyup(function(e) {
                if (e.keyCode == 27) { 
                    vm.extractionActivated(false);
                }
            });

            vm.Templates.iFrame.attr("src", vm.getListUrl()).load(function() {

                vm.Templates.modal.find(".loadingmessage").hide();

                vm.missingSpeciesArray = vm.Templates.iFrame.contents().find("span[data-taxonid]").map(function() {
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
