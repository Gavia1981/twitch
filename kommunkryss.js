(function regionTicks() {

        /**
         * fastLiveFilter jQuery plugin 1.0.3
         * 
         * Copyright (c) 2011, Anthony Bush
         * License: <http://www.opensource.org/licenses/bsd-license.php>
         * Project Website: http://anthonybush.com/projects/jquery_fast_live_filter/
         **/

        jQuery.fn.fastLiveFilter = function(list, options) {
          // Options: input, list, timeout, callback
          options = options || {};
          list = jQuery(list);
          var input = this;
          var lastFilter = '';
          var timeout = options.timeout || 0;
          var callback = options.callback || function() {};
          
          var keyTimeout;
          
          // NOTE: because we cache lis & len here, users would need to re-init the plugin
          // if they modify the list in the DOM later.  This doesn't give us that much speed
          // boost, so perhaps it's not worth putting it here.
          var lis = list.find("a.lbl");
          var len = lis.length;
          var oldDisplay = len > 0 ? lis[0].style.display : "block";
          callback(len); // do a one-time callback on initialization to make sure everything's in sync
          
          input.change(function() {
            // var startTime = new Date().getTime();
            var filter = input.val().toLowerCase();
            var li, innerText;
            var numShown = 0;
            for (var i = 0; i < len; i++) {
              li = lis[i];
              innerText = !options.selector ? 
                (li.textContent || li.innerText || "") : 
                $(li).find(options.selector).text();
              
              if (innerText.toLowerCase().indexOf(filter) >= 0) {
                if (li.style.display == "none") {
                  li.style.display = oldDisplay;
                }
                numShown++;
              } else {
                if (li.style.display != "none") {
                  li.style.display = "none";
                }
              }
            }
            callback(numShown);
            // var endTime = new Date().getTime();
            // console.log('Search for ' + filter + ' took: ' + (endTime - startTime) + ' (' + numShown + ' results)');
            return false;
          }).keydown(function() {
            clearTimeout(keyTimeout);
            keyTimeout = setTimeout(function() {
              if( input.val() === lastFilter ) return;
              lastFilter = input.val();
              input.change();
            }, timeout);
          });
          return this; // maintain jQuery chainability
        }

    function twitchViewModel () {

        var vm = this; 

        vm.selectedYear = new Date().getFullYear();
        vm.sortListBySpecies = true;

        vm.regionType = ["Kommun", "Landskap"];
        vm.selectedRegionType = localStorage.getItem("twitchRegionType") !== null ? localStorage.getItem("twitchRegionType") : vm.regionType[1];
        vm.setRegionType = function(regionType) {
            vm.selectedRegionType = regionType;
            localStorage.setItem("twitchRegionType", regionType);
            vm.firstLoad();
        };
        
        vm.regionData = {};
        vm.setRegionData = function(namn, antal, yearTicks) {
            vm.regionData[namn] = {
                antal : antal,
                yearTicks : yearTicks,
                updated : new Date()
            };
            localStorage.setItem(vm.selectedRegionType + "Data", JSON.stringify(vm.regionData));
            return vm.regionData[namn];
        };

        vm.getRegionData = function(namn) {
            return vm.regionData ? vm.regionData[namn] : null;
        };

        vm.missingSpeciesArray = [];

        // Loading sightings active?
        vm.extractionIsActive = false;
        vm.extractionActivated = function(state) {
            vm.extractionIsActive = state;
            vm.Templates.modal.find(".loader").toggleClass("paused", !vm.extractionIsActive);
            return state;
        };

        // HTML Templates and Styles
        vm.Templates = {};

        // Add some style to inserted elements
        vm.Templates.styles = $([
            "<style type='text/css'>",
                "#btnToggleTwitch { position: fixed; bottom:10px; left:10px; z-index:9999; }",
                ".loader { height: 4px; width: 100%; position: relative; overflow: hidden; background-color: #ddd; }",
                ".loader:before { display: block; position: absolute; content: ''; left: -200px; width: 200px; height: 4px; background-color: #2980b9; animation: loading 2s linear infinite; }",
                ".loader.paused { background-color: #f6f6f6; }",
                ".loader.paused:before { background-color: #f6f6f6; -webkit-animation-play-state: paused; -moz-animation-play-state: paused; -o-animation-play-state: paused; animation-play-state: paused; }",
                "@keyframes loading { from {left: -200px; width: 30%;} 50% {width: 30%;} 70% {width: 70%;} 80% { left: 50%;} 95% {left: 120%;} to {left: 100%;} }",
                "#extractedsightings h4 { margin: 1em 0 0;border-bottom: 1px solid #999; }",
                "#extractedsightings tr:not(.divider) { cursor:pointer; border-bottom:1px solid #eee; }",
                "#extractSightingsModal .modal-body .dropdown { display: inline-block; }",
                "#extractSightingsModal .modal-footer { padding: 7px; }",
                "#extractSightingsModal h4 { font-weight:normal; }",
                "#extractSightingsModal .btn-small { padding: 5px; line-height: 1;} ",
                "table.regionlist { width: 100%; font-size:13px; line-height: 1.4;}",
                "table.regionlist td.index { width: 3%; white-space: nowrap; text-align: right; font-size: 10px; padding-right: 10px; color: #999; }",
                "table.regionlist td.date { width: 3%; white-space: nowrap; }",
                "table.regionlist em { font-size:11px; padding-left:5px; color: #666; }",
                "table.regionlist tr { border-bottom:1px solid #F3F3F3; }",
                "#regionstab { padding:15px 0 75px; }",
                ".custommodal .btn-small [class^='icon-'], .custommodal .btn-small [class*=' icon-'] { padding: 7px 4px 5px 5px; }",
                ".lbl b { padding-left: 4px; display: inline-block; }",
                ".lbl { display: inline-block; padding: 4px 8px; line-height: 14px; white-space: nowrap; vertical-align: baseline; background-color: #FFF; border: 1px solid rgba(0,0,0,0.1); margin: 2px; font-size: 12px; border-radius: 3px; }",
                ".lbl.hasdata { background-color: #D7EBEF; } ",
                ".lbl.hasdata.empty { background-color: #FFE3C7; } ",
                ".buttonwrapper { text-align:center; margin-bottom:15px; }",
                "#extractSightingsModal #smalltabs { margin:-15px -15px 5px !important; }",
            "</style>"
        ].join("\n")).appendTo(document.body);

        // The button used to show or hide to modal window
        vm.Templates.button = $('<button type="button" class="btn btn-small btn-success" id="btnToggleTwitch"><i class="icon-th-list"></i></button>').click(function(e) {
            e.preventDefault();
            $("#sightingInfoModal").modal('hide');
            vm.Templates.modal.modal("show");
        }).appendTo(document.body);

        vm.Templates.modalTitle = '<span class="modal-title"><i class="icon-th-list"></i> <b><span class="modal-title-text">Kryss per ' + vm.selectedRegionType.toLowerCase() + '</span></b> <span class="count"></span><br><small></small></span>';

        // The modal window for sightings
        vm.Templates.modal = $([
            '<div class="modal hide in custommodal" id="extractSightingsModal">',
                '<div class="modal-header">',
                    '<button type="button" class="close" data-dismiss="modal"><span>&times;</span></button>',
                    vm.Templates.modalTitle,
                '</div>',
                '<div class="loader"></div>',
                '<div class="modal-body">',
                    '<ul class="nav nav-tabs" id="smalltabs">',
                        '<li class="active"><a href="#regionstab" data-toggle="tab">Översikt</a></li>',
                        '<li><a href="#listtab" data-toggle="tab" class=" btn-map">Vald lista</a></li>',
                    '</ul>',
                    '<div class="tab-content">',
                        '<div class="tab-pane active" id="regionstab">',
                            '<div class="form-group">',
                                '<input type="text" class="form-control" id="search_input" placeholder="Sök">',
                            '</div>',
                            '<div id="regiontickswrapper"></div>',
                        '</div>',
                        '<div class="tab-pane" id="listtab">Välj lista...</div>',
                    '</div>',
                '</div>',
                '<div class="modal-footer">',
                    '<div class="dropup">',
                        '<a href="#" class="btn btn-small pull-left btn-settings" data-toggle="dropdown">Inställningar <i class="icon-cog"></i></a>',
                        '<ul class="dropdown-menu">',
                            '<li class="nav-header"><i class="icon-user"></i> ' + localStorage.getItem('twitch-useralias') + '</li>',
                            '<li class="divider"><a href="#landskap">Landskap</a></li>',
                            '<li><a href="#settings">Byt användare</a></li>',
                            '<li><a href="#kommun">Kommun</a></li>',
                            '<li><a href="#landskap">Landskap</a></li>',
                            '<li class="divider"><a href="#landskap">Landskap</a></li>',
                            '<li><a href="#eraseall">Rensa allt <i class="icon-remove"></i></a></li>',
                        '</ul>',
                    '</div>',
                    '<a href="#" class="btn btn-small pull-right btn-loadmultiple">Bulkuppdatera <i class="icon-play"></i></a>',
                '</div>',
            '</div>'
        ].join("\n")).appendTo(document.body).modal("show").find("button.close").click(function() {
            vm.extractionActivated(false);
        }).end().find(".btn-loadmultiple").click(function(e) {
            e.preventDefault();
            $("#regionstab .lbl:not(.hasdata):lt(25)").each(function() {
                vm.getListData($(this).closest(".dropdown"));
            });
        }).end();

        vm.Templates.settingsForm = $([
            '<form>',
                '<div class="form-group">',
                    '<input type="text" class="form-control" id="input_useralias" placeholder="Användaralias">',
                '</div>',
                '<button type="submit" class="btn btn-primary">Spara</button>',
            '</form>'
        ].join("\n")).find(".btn-primary").click(function(e) {
            e.preventDefault();
            localStorage.setItem("twitch-useralias", vm.Templates.settingsForm.find("#input_useralias").val());
            vm.Templates.settingsForm.remove();
            vm.Templates.modal.find(".modal-footer").show();
            vm.Templates.modal.find(".modal-title").replaceWith(vm.Templates.modalTitle);
            vm.Templates.modal.find(".modal-footer").show();
            vm.Templates.modal.find(".modal-body").find("#smalltabs, .tab-content").show();
            vm.firstLoad();
        }).end();

        vm.showSettings = function() {
            vm.Templates.modal.find(".modal-footer").hide();
            vm.Templates.modal.find(".modal-title").html("<b>Inställningar</b>");
            vm.Templates.modal.find(".modal-body").find("#smalltabs, .tab-content").hide();
            vm.Templates.modal.find(".modal-body").append(vm.Templates.settingsForm);
            vm.Templates.settingsForm.find("#input_useralias").val(localStorage.getItem("twitch-useralias") || "").focus().select();
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

        vm.getMissingSpeciesUrl = function(regionName) {
            return "//artportalen.se/List/CompareSpecies/NotEquals/" + localStorage.getItem("twitch-useralias") + "/Total/" + vm.selectedRegionType + "/" + regionName + "/With/All/Total/" + vm.selectedRegionType + "/" + regionName + "/F%C3%A5glar";
        };

        vm.getUsersByRegionUrl = function(regionName) {
            return "//artportalen.se/List/Top/User/F%C3%A5glar/Total/" + vm.selectedRegionType + "/" + regionName + "/AnySite";
        };

        vm.getSitesByRegionUrl = function(regionName) {
            return "//artportalen.se/List/Top/Site/F%C3%A5glar/Total/" + vm.selectedRegionType + "/" + regionName;
        };

        vm.displayRegionItem = function(namn, data) {
            var hasData = typeof data !== 'undefined' && data !== null;
            var cssClass = hasData ? " hasdata" : "";
            cssClass += hasData && data.antal === 0 ? " empty" : "";
            return [
                "<div class='dropdown'>",
                    "<a href='#' class='lbl " + cssClass + "' data-toggle='dropdown'>",
                        "<span>" + namn + "</span>",
                        hasData ? " <b>" + data.antal + "</b>" : "",
                        //hasData ? " <em>" + data.yearTicks + "</em>" : "",
                    "</a>",
                    "<ul class='dropdown-menu'>",
                        "<li><a href='#update'>Uppdatera</a></li>",
                        "<li><a href='#getlist'>Visa lista</a></li>",
                        hasData ? "<li class='divider'></li><li class='nav-header'><i class='icon-refresh'></i> " + data.updated + "</li>" : "",
                    "</ul>",
                "</div>"
            ].join('');
        };

        vm.getListData = function(obj) {
            var regionName = $(obj).find(".lbl span").text();
            vm.extractionActivated(true);
            $.get(vm.getListUrl(regionName), function( data ) {
                var yearSum = 0;
                vm.missingSpeciesArray = $(data).find("span[data-taxonid]").map(function() {
                    if (parseInt($(this).closest("tr").find("td.date").attr("title").substring(0, 4)) === parseInt(vm.selectedYear)) { 
                        yearSum++; 
                    }
                    return $(this).data("taxonid");
                }).get();
                vm.setRegionData(regionName, vm.missingSpeciesArray.length, yearSum);
                vm.updateRegionSumma();
                $(obj).replaceWith(vm.displayRegionItem(regionName, vm.setRegionData(regionName, vm.missingSpeciesArray.length, yearSum)));
                vm.extractionActivated(false);
            });
        };

        vm.showRegionTicks = function(obj) {
            vm.extractionActivated(true);
            var regionName = $(obj).find(".lbl span").text();
            vm.Templates.modal.find("#listtab").html('<img src="//artportalen.se/Content/Images/ajax-loader-circle.gif"> Hämtar kryss i ' + regionName + '...');
            $.get(vm.getListUrl(regionName), function( data ) {
                var yearSum = 0;
                vm.missingSpeciesArray = $(data).find("span[data-taxonid]").map(function() {
                    if (parseInt($(this).closest("tr").find("td.date").attr("title").substring(0, 4)) === parseInt(vm.selectedYear)) { 
                        yearSum++; 
                    }
                    return $(this).data("taxonid");
                }).get();
                var numberOfSpecies = vm.missingSpeciesArray.length;
                var $table = $("<table class='regionlist'/>").html($(data).find("#specieslist tbody"));
                var $header = $([
                    '<div class="buttonwrapper">',
                        '<h4>' + regionName + ' <b>' + numberOfSpecies + '</b> (' + yearSum + ')</h4>',
                        '<div class="btn-group">',
                            '<a href="#" id="sortlist" class="btn btn-small" target="_blank"><i class="icon-sort"></i></a>',
                            '<a href="' + vm.getListUrl(regionName) + '" class="btn btn-small" target="_blank">Lista</a>',
                            '<a href="' + vm.getMissingSpeciesUrl(regionName) + '" class="btn btn-small" target="_blank">Saknas</a>',
                            '<a href="' + vm.getUsersByRegionUrl(regionName) + '" class="btn btn-small" target="_blank">Topplista</a>',
                            '<a href="' + vm.getSitesByRegionUrl(regionName) + '" class="btn btn-small" target="_blank">Lokaler</a>',
                        '</div>',
                    '</div>'
                ].join('')).find("#sortlist").click(function(e) {
                    e.preventDefault();
                    vm.sortListBySpecies = !vm.sortListBySpecies;
                    vm.showRegionTicks($(obj));
                }).end();
                vm.Templates.modal.find("#listtab").html($header.add($table));
                $('#smalltabs a[href="#listtab"]').text(regionName + " (" + numberOfSpecies + ")");
                vm.setRegionData(regionName, numberOfSpecies, yearSum);
                $(obj).replaceWith(vm.displayRegionItem(regionName, vm.setRegionData(regionName, numberOfSpecies, yearSum)));
                vm.extractionActivated(false);
            });
        };

        vm.sumTicks = function(propName) {
            var sum = 0;
            for (var key in vm.regionData) {
               if (vm.regionData.hasOwnProperty(key)) {
                  var obj = vm.regionData[key];
                  for (var prop in obj) {
                     if (obj.hasOwnProperty(prop) && prop === propName) {
                        sum += obj[prop];
                     }
                  }
               }
            }
            return sum;
        };

        vm.updateRegionSumma = function() {
            var summa = vm.sumTicks("antal");
            var yearTicks = vm.sumTicks("yearTicks");
            var medel = summa / vm.regions.length;
            function roundToTwo(num) {    
                return +(Math.round(num + "e+2")  + "e-2");
            }
            vm.Templates.modal.find(".modal-title .count").text("(" + summa + ")");
            vm.Templates.modal.find(".modal-title small").text((vm.regions.length - vm.Templates.modal.find(".lbl:has(:empty)").length) + " av " + vm.regions.length + " | " + roundToTwo(medel) + " i medel | " + yearTicks + " nya " + vm.selectedYear);
        };

        vm.firstLoad = function() {
            vm.extractionActivated(true);
            if (vm.selectedRegionType === vm.regionType[0]) {
                vm.regions = ['Botkyrka', 'Danderyd', 'Ekerö', 'Haninge', 'Huddinge', 'Järfälla', 'Lidingö', 'Nacka', 'Norrtälje', 'Nykvarn', 'Nynäshamn', 'Salem', 'Sigtuna', 'Sollentuna', 'Solna', 'Stockholm', 'Sundbyberg', 'Södertälje', 'Tyresö', 'Täby', 'Upplands-Bro', 'Upplands-Väsby', 'Vallentuna', 'Vaxholm', 'Värmdö', 'Österåker', 'Enköping', 'Heby', 'Håbo', 'Knivsta', 'Tierp', 'Uppsala', 'Älvkarleby', 'Östhammar', 'Eskilstuna', 'Flen', 'Gnesta', 'Katrineholm', 'Nyköping', 'Oxelösund', 'Strängnäs', 'Trosa', 'Vingåker', 'Boxholm', 'Finspång', 'Kinda', 'Linköping', 'Mjölby', 'Motala', 'Norrköping', 'Söderköping', 'Vadstena', 'Valdemarsvik', 'Ydre', 'Åtvidaberg', 'Ödeshög', 'Aneby', 'Eksjö', 'Gislaved', 'Gnosjö', 'Habo', 'Jönköping', 'Mullsjö', 'Nässjö', 'Sävsjö', 'Tranås', 'Vaggeryd', 'Vetlanda', 'Värnamo', 'Alvesta', 'Lessebo', 'Ljungby', 'Markaryd', 'Tingsryd', 'Uppvidinge', 'Växjö', 'Älmhult', 'Borgholm', 'Emmaboda', 'Hultsfred', 'Högsby', 'Kalmar', 'Mönsterås', 'Mörbylånga', 'Nybro', 'Oskarshamn', 'Torsås', 'Vimmerby', 'Västervik', 'Gotland', 'Karlshamn', 'Karlskrona', 'Olofström', 'Ronneby', 'Sölvesborg', 'Bjuv', 'Bromölla', 'Burlöv', 'Båstad', 'Eslöv', 'Helsingborg', 'Hässleholm', 'Höganäs', 'Hörby', 'Höör', 'Klippan', 'Kristianstad', 'Kävlinge', 'Landskrona', 'Lomma', 'Lund', 'Malmö', 'Osby', 'Perstorp', 'Simrishamn', 'Sjöbo', 'Skurup', 'Staffanstorp', 'Svalöv', 'Svedala', 'Tomelilla', 'Trelleborg', 'Vellinge', 'Ystad', 'Åstorp', 'Ängelholm', 'Örkelljunga', 'Östra Göinge', 'Falkenberg', 'Halmstad', 'Hylte', 'Kungsbacka', 'Laholm', 'Varberg', 'Ale', 'Alingsås', 'Bengtsfors', 'Bollebygd', 'Borås', 'Dals-Ed', 'Essunga', 'Falköping', 'Färgelanda', 'Grästorp', 'Gullspång', 'Göteborg', 'Götene', 'Herrljunga', 'Hjo', 'Härryda', 'Karlsborg', 'Kungälv', 'Lerum', 'Lidköping', 'Lilla Edet', 'Lysekil', 'Mariestad', 'Mark', 'Mellerud', 'Munkedal', 'Mölndal', 'Orust', 'Partille', 'Skara', 'Skövde', 'Sotenäs', 'Stenungsund', 'Strömstad', 'Svenljunga', 'Tanum', 'Tibro', 'Tidaholm', 'Tjörn', 'Tranemo', 'Trollhättan', 'Töreboda', 'Uddevalla', 'Ulricehamn', 'Vara', 'Vårgårda', 'Vänersborg', 'Åmål', 'Öckerö', 'Arvika', 'Eda', 'Filipstad', 'Forshaga', 'Grums', 'Hagfors', 'Hammarö', 'Karlstad', 'Kil', 'Kristinehamn', 'Munkfors', 'Storfors', 'Sunne', 'Säffle', 'Torsby', 'Årjäng', 'Askersund', 'Degerfors', 'Hallsberg', 'Hällefors', 'Karlskoga', 'Kumla', 'Laxå', 'Lekeberg', 'Lindesberg', 'Ljusnarsberg', 'Nora', 'Örebro', 'Arboga', 'Fagersta', 'Hallstahammar', 'Heby', 'Kungsör', 'Köping', 'Norberg', 'Sala', 'Skinnskatteberg', 'Surahammar', 'Västerås', 'Avesta', 'Borlänge', 'Falun', 'Gagnef', 'Hedemora', 'Leksand', 'Ludvika', 'Malung-Sälen', 'Mora', 'Orsa', 'Rättvik', 'Smedjebacken', 'Säter', 'Vansbro', 'Älvdalen', 'Bollnäs', 'Gävle', 'Hofors', 'Hudiksvall', 'Ljusdal', 'Nordanstig', 'Ockelbo', 'Ovanåker', 'Sandviken', 'Söderhamn', 'Härnösand', 'Kramfors', 'Sollefteå', 'Sundsvall', 'Timrå', 'Ånge', 'Örnsköldsvik', 'Berg', 'Bräcke', 'Härjedalen', 'Krokom', 'Ragunda', 'Strömsund', 'Åre', 'Östersund', 'Bjurholm', 'Dorotea', 'Lycksele', 'Malå', 'Nordmaling', 'Norsjö', 'Robertsfors', 'Skellefteå', 'Sorsele', 'Storuman', 'Umeå', 'Vilhelmina', 'Vindeln', 'Vännäs', 'Åsele', 'Arjeplog', 'Arvidsjaur', 'Boden', 'Gällivare', 'Haparanda', 'Jokkmokk', 'Kalix', 'Kiruna', 'Luleå', 'Pajala', 'Piteå', 'Älvsbyn', 'Överkalix', 'Övertorneå'];
            } else {
                vm.regions = ["Skåne", "Blekinge", "Småland", "Öland", "Gotland", "Halland", "Bohuslän", "Dalsland", "Västergötland", "Närke", "Östergötland", "Södermanland", "Uppland", "Västmanland", "Värmland", "Dalarna", "Gästrikland", "Hälsingland", "Medelpad", "Ångermanland", "Västerbotten", "Norrbotten", "Härjedalen", "Jämtland", "Åsele lappmark", "Lycksele lappmark", "Pite lappmark", "Lule lappmark", "Torne lappmark"]
            }
            vm.regionData = JSON.parse(localStorage.getItem(vm.selectedRegionType + "Data"));
            var html = [];
            $.each(vm.regions, function (index, value) {
                var regionItem = vm.getRegionData(value);
                html.push(vm.displayRegionItem(value, regionItem));
            });
            vm.Templates.modal.find("#regiontickswrapper").html(html.join(''));
            vm.Templates.modal.find('#search_input').fastLiveFilter('#regiontickswrapper');
            vm.Templates.modal.find(".modal-title-text").text("Kryss per " + vm.selectedRegionType.toLowerCase());
            vm.updateRegionSumma();
            vm.extractionActivated(false);
        };

        vm.init = function() {
            if (!window.viewModel.localStorageEnabled()) {
                alert("Error! No local storage enabled...");
                return false;
            }

            $(document).keyup(function(e) {
                if (e.keyCode == 27) { 
                    vm.extractionActivated(false);
                }
            });

            vm.Templates.modal.on("click", ".dropdown-menu a", function(e) {
                e.preventDefault();
                if ($(this).attr("href") === "#getlist") {
                    $('#smalltabs a[href="#listtab"]').tab('show');
                    vm.showRegionTicks($(this).closest(".dropdown"));
                } else if ($(this).attr("href") === "#update") {
                    vm.getListData($(this).closest(".dropdown"));
                } else if ($(this).attr("href") === "#settings") {
                    vm.showSettings();
                } else if ($(this).attr("href") === "#kommun") {
                    vm.setRegionType(vm.regionType[0]);
                } else if ($(this).attr("href") === "#landskap") {
                    vm.setRegionType(vm.regionType[1]);
                } else if ($(this).attr("href") === "#eraseall") {
                    vm.regionData = {};
                    localStorage.setItem(vm.selectedRegionType + "Data", JSON.stringify(vm.regionData));
                    vm.firstLoad();
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
