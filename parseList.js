
(function parseList() {
    var self = this;

    self.result = {};

    self.parseListData = function() {
        var species = [];
        $("#specieslistwrapper tbody tr").each(function() {
            species.push({
                taxonId: $(this).find("[data-taxonid]").data("taxonid"),
                date: $(this).find(".date").attr("title")
            });
        });
        self.result.speciesList = species;
    };

    self.createMetaDataFromUrl = function() {
        // List/Top/Species/{SpeciesGroup}/{year}/{areaType}/{areaName}/{SiteId}/OrderByDate/desc/{userAlias}
        var pathArray = window.location.pathname.split('/');
        self.result.year = pathArray[5];
        if (pathArray[8] === 'AnySite') {
            self.result.type = pathArray[6];
            self.result.areaId = null;
        } else {
            self.result.type = 'Site';
            self.result.areaId = pathArray[8];
        }
        self.result.userAlias = $("[data-useralias].has_tooltip:first").data('useralias');
        self.result.areaName = $("#selectedUserFilter strong").text();
    };

    self.init = function() {
        self.parseListData();
        self.createMetaDataFromUrl();
        console.log(self.result);
    };

    self.init();

}());
