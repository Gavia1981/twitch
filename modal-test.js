(function parseTodaysSightings(userAlias) {

    var vm = this; 
    vm.sightings = [];
    vm.userAlias = userAlias;
    vm.extractionActivated = true;
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
            '<div class="modal-body">',
                '<img src="https://artportalen.se/Content/Images/ajax-loader-circle.gif"> Letar kryss...',
            '</div>',
        '</div>'
    ].join("\n")).appendTo(document.body).modal("show").find("button.close").click(function() {
        vm.extractionActivated = false;
        vm.sightingSubscription.dispose();
        vm.Templates.iFrame.remove();
    }).end();

    vm.pageForward = function() {
        if (!vm.extractionActivated) return false;
        if (window.viewModel.pageIndex() != window.viewModel.maxPageIndex() && window.viewModel.maxPageIndex() > 0) {
            window.viewModel.setPageIndex(window.viewModel.pageIndex() + 1, true);
        } else if (window.viewModel.dayNamesBackCount() > 0) {
            $("#btn-daypager .daypager-back").click();
        } else {
            vm.extractionActivated = false;
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
        return $.grep($("#todayssightings tr.sightingrow"), function( obj, index ) {
            return $.inArray($(obj).find("span[data-taxonid]").data("taxonid"), vm.missingSpeciesArray) === -1;
        });
    };

    vm.displaySightings = function() {
        if (!vm.extractionActivated) return false;
        vm.sightings = vm.extractSightings();
        if (window.viewModel.pageIndex() == 1) {
            var dateDisplay = window.viewModel.selectedDayName().PresentationDateDayMonthShort + " " + new Date(parseInt(window.viewModel.selectedDayName().Date.substr(6))).getUTCFullYear();
            vm.Templates.modal.find("#extractedsightings").append("<tr class='divider'><td colspan='3'><h4 style='margin: 1em 0 0;border-bottom: 1px solid #999;'>" + dateDisplay + "</h4></td></tr>");
        }
        vm.Templates.modal.find("#extractedsightings").append(vm.sightings);
        vm.Templates.modal.find(".modal-title b").text(vm.Templates.modal.find("#extractedsightings tr:not(.divider)").length);
        //vm.pageForward();
    };

    vm.init = function() {
        window.viewModel.setPageIndex(1, true);
        vm.Templates.iFrame.attr("src", vm.getListUrl()).load(function() {

            vm.Templates.modal.find(".modal-body").html("<table id='extractedsightings'></table>");

            vm.missingSpeciesArray = vm.Templates.iFrame.contents().find("span[data-taxonid]").map(function() {
                return $(this).data("taxonid");
            }).get();

            vm.displaySightings();

            // Subscribe to changes of sightings (eg. loading new ones)
            vm.sightingSubscription = window.viewModel.sightings.subscribe(function(newValue) {
                if (!vm.extractionActivated) return false;
                setTimeout(function() {
                    vm.displaySightings();
                }, 300);

            });
        });
    };
    vm.init();

})("johans");
