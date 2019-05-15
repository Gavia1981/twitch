(function kryssKort() {

    var vm = this; 

    vm.templates = {};

    // Add some style to inserted elements
    vm.templates.styles = $([
        "<style type='text/css'>",
            ".loader { height: 4px; width: 100%; position: relative; overflow: hidden; background-color: #ddd; }",
            ".loader:before{ display: block; position: absolute; content: ''; left: -200px; width: 200px; height: 4px; background-color: #2980b9; animation: loading 2s linear infinite; }",
            "@keyframes loading { from {left: -200px; width: 30%;} 50% {width: 30%;} 70% {width: 70%;} 80% { left: 50%;} 95% {left: 120%;} to {left: 100%;} }",
        "</style>"
    ].join("\n")).appendTo(document.body);

    vm.templates.modal = $([
        '<div class="modal show in" id="extractSightingsModal">',
            '<div class="modal-header">',
                '<span class="modal-title"><b>0</b> fynd hittades</span>',
            '</div>',
            '<div class="loader"></div>',
            '<div class="modal-body">',
            '</div>',
            '<div class="modal-footer">',
                '<form>',
                    '<div class="form-group">',
                        '<input type="text" class="form-control" id="searchAreaName" placeholder="Sök region, kommun eller lokal">',
                    '</div>',
                '</form>',
            '</div>',
        '</div>'
    ].join("\n")).appendTo(document.body)
    .find(".btn-settings").click(function(e) {
        e.preventDefault();
        vm.showSettings();
    }).end();

    vm.lists = {
        ajaxCounter: 0,
        userAlias: ["johans", "superlifen","kaellebrink"],
        listData: [],
        landskap: [{"Name":"Skåne","ShortName":"Sk"}, {"Name":"Blekinge","ShortName":"Bl"}, {"Name":"Småland","ShortName":"Sm"}, {"Name":"Öland","ShortName":"Öl"}, {"Name":"Gotland","ShortName":"Go"}, {"Name":"Halland","ShortName":"Ha"}, {"Name":"Bohuslän","ShortName":"Bo"}, {"Name":"Dalsland","ShortName":"Ds"}, {"Name":"Västergötland","ShortName":"Vg"}, {"Name":"Närke","ShortName":"Nä"}, {"Name":"Östergötland","ShortName":"Ög"}, {"Name":"Södermanland","ShortName":"Sö"}, {"Name":"Uppland","ShortName":"Up"}, {"Name":"Västmanland","ShortName":"Vs"}, {"Name":"Värmland","ShortName":"Vr"}, {"Name":"Dalarna","ShortName":"Dr"}, {"Name":"Gästrikland","ShortName":"Gä"}, {"Name":"Hälsingland","ShortName":"Hs"}, {"Name":"Medelpad","ShortName":"Me"}, {"Name":"Ångermanland","ShortName":"Ån"}, {"Name":"Västerbotten","ShortName":"Vb"}, {"Name":"Norrbotten","ShortName":"Nb"}, {"Name":"Härjedalen","ShortName":"Hr"}, {"Name":"Jämtland","ShortName":"Jä"}, {"Name":"Åsele lappmark","ShortName":"Ås"}, {"Name":"Lycksele lappmark","ShortName":"Ly"}, {"Name":"Pite lappmark","ShortName":"Pi"}, {"Name":"Lule lappmark","ShortName":"Lu"}, {"Name":"Torne lappmark","ShortName":"To"}],
        getListUrl: function(settings) {
            return ['//artportalen.se/List/Top/Species/F%C3%A5glar/Total/Landskap', settings.regionName.Name, 'AnySite/OrderByDate/Desc', settings.userAlias].join('/') + "?t=" + new Date().getTime();
        },
        getListData: function(item) {
            vm.lists.ajaxCounter++;
            console.log("vm.lists.ajaxCounter", vm.lists.ajaxCounter);
            var year = '';
            $.get(vm.lists.getListUrl(item, year), function( data ) {
                vm.lists.ajaxCounter--;
                var result = $(data).find("span[data-taxonid]").map(function(index) {
                    return {
                        province: item.regionName.ShortName,
                        taxonid: $(this).data("taxonid"),
                        speciesName: $(this).find("strong").text(),
                        speciesNameScientific: $(this).find("em.scientific").text(),
                        date: $(this).closest("tr").find("td.date").attr("title"),
                        sortorder: index
                    };
                }).get();

                var yearNow = result.filter(item => item.date.startsWith(new Date().getFullYear()));
                var yearPrev = result.filter(item => item.date.startsWith(new Date().getFullYear()-1)); 

                vm.lists.listData[item.userAlias].yearNow = vm.lists.sortArr([...vm.lists.listData[item.userAlias].yearNow, ...yearNow]);
                vm.lists.listData[item.userAlias].yearPrev = vm.lists.sortArr([...vm.lists.listData[item.userAlias].yearPrev, ...yearPrev]);
            });
        },
        dateDiff: function(startDate, endDate) {
            const timeDiff  = (new Date(startDate)) - (new Date(endDate));
            return timeDiff / (1000 * 60 * 60 * 24);
        },
        sortArr: function(list) {
            return list.sort((a, b) => (a.date < b.date) ? 1 : -1)
        },
        setData: function(arr, key, data) {
            arr[key] = arr[key] || data;
        },
        loadUserData: function() {
            for (i = 0; i < vm.lists.userAlias.length; i++) {
                vm.lists.setData(vm.lists.listData, vm.lists.userAlias[i], { yearNow : [], yearPrev: [] });
                for (j = 0; j < vm.lists.landskap.length; j++) {
                    let item = {
                        userAlias: vm.lists.userAlias[i], 
                        regionName: vm.lists.landskap[j]
                    }
                    vm.lists.getListData(item);
                }
            }
            
        },
        renderData: function() {
            var alias = "";
            var result = "<table>";
            for (i = 0; i < vm.lists.userAlias.length; i++) {
                alias = vm.lists.userAlias[i];
                result += "<tr><th><h3 style='text-align:left;text-transform:uppercase;'>" + alias + " <small class='float-right'>(" + vm.lists.listData[alias].yearNow.length + ")</small></h3></th></tr>";
                for (j = 0; j < vm.lists.listData[alias].yearNow.length; j++) {
                    let date = vm.lists.listData[alias].yearNow[j].date;
                    result += "<tr>";
                    result += "<td style='color: hsl(116, " + (100 / (vm.lists.dateDiff(new Date(), date) * 0.75)) + "%, 35%);font-weight:bold;'>" + date + "</td>";
                    result += "<td>" + vm.lists.listData[alias].yearNow[j].speciesName + "</td>";
                    result += "<td>" + vm.lists.listData[alias].yearNow[j].province + "</td>";
                    result += "</tr>";
                }
            }
            result += "</table>";
            console.log(result);
            vm.templates.modal.find(".loader").hide();
            vm.templates.modal.find(".modal-body").append(result);
        },
        untilLoaded: function() {
            console.log("untilLoaded");
            if (vm.lists.ajaxCounter !== 0) {
                setTimeout(vm.lists.untilLoaded, 500);
                return false;
            }
            vm.lists.renderData();
            return true;
        },
        init : function() {
            vm.lists.loadUserData();
            setTimeout(vm.lists.untilLoaded, 500);
            console.log("listData is ",vm.lists.listData);
        }
    }

    vm.lists.init();
})();
