(function kryssKort() {

    var vm = this; 

    vm.templates = {};

    // Add some style to inserted elements
    vm.templates.styles = $([
        "<style type='text/css'>",
            ".mxl h5 { border-bottom: 1px dashed #999; margin: 10px 0 5px; padding: 5px 0; text-align: left; font-size: 1.2rem; }",
            ".mxl h5 span { font-size:80%; font-weight:normal; float:right; }",
            ".mxl h4 { margin:0; }",
            ".mxl th { border-bottom:1px dashed #999; }",
            ".mxl .ar { text-align: right; }",
            ".mxl .al { text-align: left; }",
            ".mxl .loader { height: 4px; width: 100%; position: relative; overflow: hidden; background-color: #ddd; }",
            ".mxl .loader:before{ display: block; position: absolute; content: ''; left: -200px; width: 200px; height: 4px; background-color: #2980b9; animation: loading 2s linear infinite; }",
            "@keyframes loading { from {left: -200px; width: 30%;} 50% {width: 30%;} 70% {width: 70%;} 80% { left: 50%;} 95% {left: 120%;} to {left: 100%;} }",
        "</style>"
    ].join("\n")).appendTo(document.body);

    vm.templates.modal = $([
        '<div class="modal show in mxl" id="extractSightingsModal">',
            '<div class="modal-header">',
                '<span class="modal-title"><h4>Landskapskryss</h4></span>',
            '</div>',
            '<div class="loader"></div>',
            '<div class="modal-body"></div>',
            '<div class="modal-footer"></div>',
        '</div>'
    ].join("\n")).appendTo(document.body)
    .find(".btn-settings").click(function(e) {
        e.preventDefault();
        vm.showSettings();
    }).end();

    vm.lists = {
        ajaxCounter: 0,
        userAlias: ["johans", "superlifen","kaellebrink", "graan", "mataxb", "barlei"],
        listData: [],
        totals: [],
        landskap: [{"Name":"Skåne","ShortName":"Sk"}, {"Name":"Blekinge","ShortName":"Bl"}, {"Name":"Småland","ShortName":"Sm"}, {"Name":"Öland","ShortName":"Öl"}, {"Name":"Gotland","ShortName":"Go"}, {"Name":"Halland","ShortName":"Ha"}, {"Name":"Bohuslän","ShortName":"Bo"}, {"Name":"Dalsland","ShortName":"Ds"}, {"Name":"Västergötland","ShortName":"Vg"}, {"Name":"Närke","ShortName":"Nä"}, {"Name":"Östergötland","ShortName":"Ög"}, {"Name":"Södermanland","ShortName":"Sö"}, {"Name":"Uppland","ShortName":"Up"}, {"Name":"Västmanland","ShortName":"Vs"}, {"Name":"Värmland","ShortName":"Vr"}, {"Name":"Dalarna","ShortName":"Dr"}, {"Name":"Gästrikland","ShortName":"Gä"}, {"Name":"Hälsingland","ShortName":"Hs"}, {"Name":"Medelpad","ShortName":"Me"}, {"Name":"Ångermanland","ShortName":"Ån"}, {"Name":"Västerbotten","ShortName":"Vb"}, {"Name":"Norrbotten","ShortName":"Nb"}, {"Name":"Härjedalen","ShortName":"Hr"}, {"Name":"Jämtland","ShortName":"Jä"}, {"Name":"Åsele lappmark","ShortName":"Ås"}, {"Name":"Lycksele lappmark","ShortName":"Ly"}, {"Name":"Pite lappmark","ShortName":"Pi"}, {"Name":"Lule lappmark","ShortName":"Lu"}, {"Name":"Torne lappmark","ShortName":"To"}],
        getListUrl: function(settings) {
            return ['//artportalen.se/List/Top/Species/F%C3%A5glar/Total/Landskap', settings.regionName.Name, 'AnySite/OrderByDate/Desc', settings.userAlias].join('/') + "?t=" + new Date().getTime();
        },
        getTotals: function() {
            vm.lists.ajaxCounter++;
            Artportalen.ajaxPost(
                "https://artportalen.se/Lists/UserAreaTicksListData", {
                    Pager: {PageIndex: 1, PageSize: 30},
                    SearchUser: {Id: 0},
                    SpeciesGroup: {Id: "8"},
                    areaDatasetId: 16
                },
                function (data) {
                    vm.lists.ajaxCounter--;
                    vm.lists.totals = [...data.UserAreaTicksList];
                });
        },
        getListData: function(item) {
            vm.lists.ajaxCounter++;
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

                var year0 = result.filter(item => item.date.startsWith(new Date().getFullYear()));
                var year1 = result.filter(item => item.date.startsWith(new Date().getFullYear()-1)); 
                var year2 = result.filter(item => item.date.startsWith(new Date().getFullYear()-2)); 

                vm.lists.listData[item.userAlias].year0 = vm.lists.sortArr([...vm.lists.listData[item.userAlias].year0, ...year0]);
                vm.lists.listData[item.userAlias].year1 = vm.lists.sortArr([...vm.lists.listData[item.userAlias].year1, ...year1]);
                vm.lists.listData[item.userAlias].year2 = vm.lists.sortArr([...vm.lists.listData[item.userAlias].year2, ...year2]);
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
        findUser: function(userAlias) {
            return vm.lists.totals.find(obj => {
                return obj.UserAlias.toLowerCase() === userAlias;
            });
        },
        loadUserData: function() {
            for (i = 0; i < vm.lists.userAlias.length; i++) {
                vm.lists.setData(vm.lists.listData, vm.lists.userAlias[i], { year0: [], year1: [], year2: [] });
                for (j = 0; j < vm.lists.landskap.length; j++) {
                    let item = {
                        userAlias: vm.lists.userAlias[i], 
                        regionName: vm.lists.landskap[j]
                    }
                    vm.lists.getListData(item);
                }
            }
            vm.lists.getTotals();
        },
        renderData: function() {
            var alias = "", userData =[], result = "", userName = "", sum = "", currYear = new Date().getFullYear();
            sum += "<table style='width:100%;'>";
            sum += "<thead><tr><th class='al'>Namn</th><th class='ar'>Total</th><th class='ar'>+" + currYear + "</th><th class='ar'>+" + (currYear-1) + "</th><th class='ar'>+" + (currYear-2) + "</th></tr></thead>";
            sum += "<tbody>";
            for (i = 0; i < vm.lists.userAlias.length; i++) {
                alias = vm.lists.userAlias[i];
                userData = vm.lists.findUser(alias); 
                userName = userData.FirstName + ' ' + userData.LastName;
                result += "<section>";
                result += "<h5>" + userName + "<span class='float-right'>" + userData.YearCount + " (+" + vm.lists.listData[alias].year0.length + ")</span></h5>";
                sum += "<tr><td><strong>" + userName + "</strong></td><td class='ar'>" + userData.YearCount + "</td><td class='ar'>" + vm.lists.listData[alias].year0.length + "</td><td class='ar'>" + vm.lists.listData[alias].year1.length + "</td><td class='ar'>" + vm.lists.listData[alias].year2.length + "</td></tr>";
                result += "<table style='width:100%;'>";
                for (j = 0; j < vm.lists.listData[alias].year0.length; j++) {
                    let date = vm.lists.listData[alias].year0[j].date;
                    result += "<tr>";
                    result += "<td style='white-space:nowrap; color: hsl(116, " + (100 / (vm.lists.dateDiff(new Date(), date) * 0.75)) + "%, 35%);font-weight:bold;padding-right:1em;'>" + date + "</td>";
                    result += "<td style='width:100%;'>" + vm.lists.listData[alias].year0[j].speciesName + "</td>";
                    result += "<td style='white-space:nowrap;'>" + vm.lists.listData[alias].year0[j].province + "</td>";
                    result += "</tr>";
                }
                result += "</table>";
                result += "</section>";
            }
            sum += "</tbody>";
            sum += "</table>";
            sum += "<br>";
            
            vm.templates.modal.find(".loader").hide();
            vm.templates.modal.find(".modal-body").append(sum);
            vm.templates.modal.find(".modal-body").append(result);
        },
        untilLoaded: function() {
            console.log("untilLoaded");
            if (vm.lists.ajaxCounter !== 0) {
                setTimeout(vm.lists.untilLoaded, 1500);
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
