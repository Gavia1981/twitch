
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
        self.result.year = pathArray[5] !== "Total" && pathArray[5] !== "AllYears" ? pathArray[5] : null;
        if (pathArray[8] === 'AnySite') {
            self.result.type = pathArray[6] === "Hela landet" ? "Custom" : pathArray[6];
        } else {
            self.result.type = 'Lokal';
            self.result.siteId = pathArray[8];
        }
        self.result.userAlias = $("[data-useralias].has_tooltip:first").data('useralias');
        self.result.areaName = $("#selectedUserFilter strong").text() + (pathArray[6] === "Kommun" ? ' k:n' : '');
        self.result.apUrl = window.location.href;
    };

    self.copyToClipboard = function() {
        var jsonData = JSON.stringify(self.result, null, 2);
        $([
            "<textarea id='plm'>", jsonData,"</textarea>",
            "<style type='text/css'>",
                "#plm { position: fixed; top: 0; bottom:0; left: 0; right:0; z-index: 10000; background-color:#fff; width: 100%; border: none; }",
                "body { overflow: hidden; }",
            "</style>"
        ].join("\n")).appendTo(document.body);
        
        $("#plm").click(function() {
            $(this).focus().select();
            document.execCommand('copy');
            console.log(self.result);
        }).click();
    }

    self.init = function() {
        self.createMetaDataFromUrl();
        self.parseListData();
        self.copyToClipboard();
    };

    self.init();

}());
