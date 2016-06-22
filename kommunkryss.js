(function kommuner() {

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


        vm.Municipalitys = ['Botkyrka', 'Danderyd', 'Ekerö', 'Haninge', 'Huddinge', 'Järfälla', 'Lidingö', 'Nacka', 'Norrtälje', 'Nykvarn', 'Nynäshamn', 'Salem', 'Sigtuna', 'Sollentuna', 'Solna', 'Stockholm', 'Sundbyberg', 'Södertälje', 'Tyresö', 'Täby', 'Upplands-Bro', 'Upplands-Väsby', 'Vallentuna', 'Vaxholm', 'Värmdö', 'Österåker', 'Enköping', 'Heby', 'Håbo', 'Knivsta', 'Tierp', 'Uppsala', 'Älvkarleby', 'Östhammar', 'Eskilstuna', 'Flen', 'Gnesta', 'Katrineholm', 'Nyköping', 'Oxelösund', 'Strängnäs', 'Trosa', 'Vingåker', 'Boxholm', 'Finspång', 'Kinda', 'Linköping', 'Mjölby', 'Motala', 'Norrköping', 'Söderköping', 'Vadstena', 'Valdemarsvik', 'Ydre', 'Åtvidaberg', 'Ödeshög', 'Aneby', 'Eksjö', 'Gislaved', 'Gnosjö', 'Habo', 'Jönköping', 'Mullsjö', 'Nässjö', 'Sävsjö', 'Tranås', 'Vaggeryd', 'Vetlanda', 'Värnamo', 'Alvesta', 'Lessebo', 'Ljungby', 'Markaryd', 'Tingsryd', 'Uppvidinge', 'Växjö', 'Älmhult', 'Borgholm', 'Emmaboda', 'Hultsfred', 'Högsby', 'Kalmar', 'Mönsterås', 'Mörbylånga', 'Nybro', 'Oskarshamn', 'Torsås', 'Vimmerby', 'Västervik', 'Gotland', 'Karlshamn', 'Karlskrona', 'Olofström', 'Ronneby', 'Sölvesborg', 'Bjuv', 'Bromölla', 'Burlöv', 'Båstad', 'Eslöv', 'Helsingborg', 'Hässleholm', 'Höganäs', 'Hörby', 'Höör', 'Klippan', 'Kristianstad', 'Kävlinge', 'Landskrona', 'Lomma', 'Lund', 'Malmö', 'Osby', 'Perstorp', 'Simrishamn', 'Sjöbo', 'Skurup', 'Staffanstorp', 'Svalöv', 'Svedala', 'Tomelilla', 'Trelleborg', 'Vellinge', 'Ystad', 'Åstorp', 'Ängelholm', 'Örkelljunga', 'Östra Göinge', 'Falkenberg', 'Halmstad', 'Hylte', 'Kungsbacka', 'Laholm', 'Varberg', 'Ale', 'Alingsås', 'Bengtsfors', 'Bollebygd', 'Borås', 'Dals-Ed', 'Essunga', 'Falköping', 'Färgelanda', 'Grästorp', 'Gullspång', 'Göteborg', 'Götene', 'Herrljunga', 'Hjo', 'Härryda', 'Karlsborg', 'Kungälv', 'Lerum', 'Lidköping', 'Lilla Edet', 'Lysekil', 'Mariestad', 'Mark', 'Mellerud', 'Munkedal', 'Mölndal', 'Orust', 'Partille', 'Skara', 'Skövde', 'Sotenäs', 'Stenungsund', 'Strömstad', 'Svenljunga', 'Tanum', 'Tibro', 'Tidaholm', 'Tjörn', 'Tranemo', 'Trollhättan', 'Töreboda', 'Uddevalla', 'Ulricehamn', 'Vara', 'Vårgårda', 'Vänersborg', 'Åmål', 'Öckerö', 'Arvika', 'Eda', 'Filipstad', 'Forshaga', 'Grums', 'Hagfors', 'Hammarö', 'Karlstad', 'Kil', 'Kristinehamn', 'Munkfors', 'Storfors', 'Sunne', 'Säffle', 'Torsby', 'Årjäng', 'Askersund', 'Degerfors', 'Hallsberg', 'Hällefors', 'Karlskoga', 'Kumla', 'Laxå', 'Lekeberg', 'Lindesberg', 'Ljusnarsberg', 'Nora', 'Örebro', 'Arboga', 'Fagersta', 'Hallstahammar', 'Heby', 'Kungsör', 'Köping', 'Norberg', 'Sala', 'Skinnskatteberg', 'Surahammar', 'Västerås', 'Avesta', 'Borlänge', 'Falun', 'Gagnef', 'Hedemora', 'Leksand', 'Ludvika', 'Malung-Sälen', 'Mora', 'Orsa', 'Rättvik', 'Smedjebacken', 'Säter', 'Vansbro', 'Älvdalen', 'Bollnäs', 'Gävle', 'Hofors', 'Hudiksvall', 'Ljusdal', 'Nordanstig', 'Ockelbo', 'Ovanåker', 'Sandviken', 'Söderhamn', 'Härnösand', 'Kramfors', 'Sollefteå', 'Sundsvall', 'Timrå', 'Ånge', 'Örnsköldsvik', 'Berg', 'Bräcke', 'Härjedalen', 'Krokom', 'Ragunda', 'Strömsund', 'Åre', 'Östersund', 'Bjurholm', 'Dorotea', 'Lycksele', 'Malå', 'Nordmaling', 'Norsjö', 'Robertsfors', 'Skellefteå', 'Sorsele', 'Storuman', 'Umeå', 'Vilhelmina', 'Vindeln', 'Vännäs', 'Åsele', 'Arjeplog', 'Arvidsjaur', 'Boden', 'Gällivare', 'Haparanda', 'Jokkmokk', 'Kalix', 'Kiruna', 'Luleå', 'Pajala', 'Piteå', 'Älvsbyn', 'Överkalix', 'Övertorneå'];

        vm.kommunData = {};
        vm.setKommunData = function(namn, antal) {
            vm.kommunData[namn] = {
                antal : antal,
                updated : new Date()
            };
            localStorage.setItem("kommunData", JSON.stringify(vm.kommunData));
            return vm.kommunData[namn];
        };

        vm.getKommunData = function(namn) {
            return vm.kommunData ? vm.kommunData[namn] : null;
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
                "#btnToggleTwitch { position: fixed; bottom:20px; left:20px; z-index:9999; }",
                ".loader { height: 4px; width: 100%; position: relative; overflow: hidden; background-color: #ddd; }",
                ".loader:before { display: block; position: absolute; content: ''; left: -200px; width: 200px; height: 4px; background-color: #2980b9; animation: loading 2s linear infinite; }",
                ".loader.paused { background-color: #fafafa; }",
                ".loader.paused:before { background-color: #fafafa; -webkit-animation-play-state: paused; -moz-animation-play-state: paused; -o-animation-play-state: paused; animation-play-state: paused; }",
                "@keyframes loading { from {left: -200px; width: 30%;} 50% {width: 30%;} 70% {width: 70%;} 80% { left: 50%;} 95% {left: 120%;} to {left: 100%;} }",
                "#extractedsightings h4 { margin: 1em 0 0;border-bottom: 1px solid #999; }",
                "#extractedsightings tr:not(.divider) { cursor:pointer; border-bottom:1px solid #eee; }",
                "#extractSightingsModal .modal-body .dropdown { display: inline-block; }",
                "#extractSightingsModal .modal-footer { padding: 7px; }",
                "#extractSightingsModal h4 { font-weight:normal; }",
                "#extractSightingsModal .btn-small { padding: 5px; line-height: 1;} ",
                "table.kommunlista { width: 100%; font-size:13px; line-height: 1.4;}",
                "table.kommunlista td.index { width: 3%; white-space: nowrap; text-align: right; font-size: 10px; padding-right: 10px; color: #999; }",
                "table.kommunlista td.date { width: 3%; white-space: nowrap; }",
                "table.kommunlista em { font-size:11px; padding-left:5px; color: #666; }",
                "table.kommunlista tr { border-bottom:1px solid #F3F3F3; }",
                "#kommunkrysstab { padding:15px 0 75px; }",
                ".custommodal .btn-small [class^='icon-'], .custommodal .btn-small [class*=' icon-'] { margin-left: 5px; border-left: 1px solid #DCDCDC; padding: 7px 0px 5px 8px; }",
                ".lbl b { padding-left: 4px; display: inline-block; }",
                ".lbl { display: inline-block; padding: 4px 8px; line-height: 14px; white-space: nowrap; vertical-align: baseline; background-color: #FFF; border: 1px solid rgba(0,0,0,0.1); margin: 2px; font-size: 12px; border-radius: 3px; }",
                ".lbl.hasdata { background-color: #D7EBEF; } ",
            "</style>"
        ].join("\n")).appendTo(document.body);

        // The button used to show or hide to modal window
        vm.Templates.button = $('<button type="button" class="btn btn-large btn-success" id="btnToggleTwitch"><i class="icon-th-list"></i></button>').click(function(e) {
            e.preventDefault();
            $("#sightingInfoModal").modal('hide');
            vm.Templates.modal.modal("show");
        }).appendTo(document.body);

        // The modal window for sightings
        vm.Templates.modal = $([
            '<div class="modal hide in custommodal" id="extractSightingsModal">',
                '<div class="modal-header">',
                    '<button type="button" class="close" data-dismiss="modal"><span>&times;</span></button>',
                    '<span class="modal-title"><i class="icon-th-list"></i> <b></b> Kommunkryss <small></small></span>',
                '</div>',
                '<div class="loader"></div>',
                '<div class="modal-body">',
                    '<ul class="nav nav-tabs" id="smalltabs">',
                        '<li class="active"><a href="#kommunkrysstab" data-toggle="tab">Översikt</a></li>',
                        '<li><a href="#listtab" data-toggle="tab" class=" btn-map">Vald lista</a></li>',
                    '</ul>',
                    '<div class="tab-content">',
                        '<div class="tab-pane active" id="kommunkrysstab">',
                            '<div class="form-group">',
                                '<input type="text" class="form-control" id="search_input" placeholder="Sök kommun">',
                            '</div>',
                            '<div id="kommunkrysswrapper"></div>',
                        '</div>',
                        '<div class="tab-pane" id="listtab">Välj lista...</div>',
                    '</div>',
                '</div>',
                '<div class="modal-footer">',
                    '<a href="#" class="btn btn-small pull-left btn-settings">Inställningar <i class="icon-cog"></i></a>',
                    '<a href="#" class="btn btn-small pull-right btn-loadmultiple">Bulkuppdatera <i class="icon-play"></i></a>',
                    '<a href="#" class="btn btn-small pull-right btn-erase">Rensa allt <i class="icon-remove"></i></a>',
                '</div>',
            '</div>'
        ].join("\n")).appendTo(document.body).modal("show").find("button.close").click(function() {
            vm.extractionActivated(false);
        }).end().find(".btn-loadmultiple").click(function(e) {
            e.preventDefault();
            $("#kommunkrysstab .lbl:not(.hasdata):lt(25)").each(function() {
                vm.getListData($(this).closest(".dropdown"));
            });
        }).end().find(".btn-erase").click(function(e) {
            e.preventDefault();
            vm.kommunData = {};
            localStorage.setItem("kommunData", JSON.stringify(vm.kommunData));
            vm.firstLoad();
        }).end().find(".btn-settings").click(function(e) {
            e.preventDefault();
            vm.showSettings();
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
        
        vm.getListUrl = function(kommunnamn) {
            return [
                "//artportalen.se/List/Top/Species/F%C3%A5glar/Total", 
                "Kommun",
                kommunnamn, 
                "AnySite/OrderByTaxon/Asc", 
                localStorage.getItem("twitch-useralias")
            ].join('/') + "?t=" + new Date().getTime();
        };

        vm.getMissingSpeciesUrl = function(kommunnamn) {
            return "//artportalen.se/List/CompareSpecies/NotEquals/" + localStorage.getItem("twitch-useralias") + "/Total/Kommun/" + kommunnamn + "/With/All/Total/Kommun/" + kommunnamn + "/F%C3%A5glar";
        };

        vm.getKommunLiganUrl = function(kommunnamn) {
            return "//artportalen.se/List/Top/User/F%C3%A5glar/Total/Kommun/" + kommunnamn + "/AnySite";
        };

        vm.getSitesByKommunUrl = function(kommunnamn) {
            return "//artportalen.se/List/Top/Site/F%C3%A5glar/Total/Kommun/" + kommunnamn;
        };

        vm.displayKommunItem = function(namn, data) {
            var hasData = typeof data !== 'undefined' && data !== null;
            return [
                "<div class='dropdown'>",
                    "<a href='#' class='lbl " + (hasData ? " hasdata" : "") + "' data-toggle='dropdown'>",
                        "<span>" + namn + "</span>",
                        hasData ? " <b>" + data.antal + "</b>" : "",
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
            var kommunNamn = $(obj).find(".lbl span").text();
            vm.extractionActivated(true);
            $.get(vm.getListUrl(kommunNamn), function( data ) {
                vm.missingSpeciesArray = $(data).find("span[data-taxonid]").map(function() {
                    return $(this).data("taxonid");
                }).get();
                vm.setKommunData(kommunNamn, vm.missingSpeciesArray.length);
                vm.updateKommunSumma();
                $(obj).replaceWith(vm.displayKommunItem(kommunNamn, vm.setKommunData(kommunNamn, vm.missingSpeciesArray.length)));
                vm.extractionActivated(false);
            });
        };

        vm.showKommunKryss = function(obj) {
            var kommunNamn = $(obj).find(".lbl span").text();
            vm.extractionActivated(true);
            vm.Templates.modal.find("#listtab").html('<img src="//artportalen.se/Content/Images/ajax-loader-circle.gif"> Hämtar kryss i ' + kommunNamn + '...');
            $.get(vm.getListUrl(kommunNamn), function( data ) {
                vm.missingSpeciesArray = $(data).find("span[data-taxonid]").map(function() {
                    return $(this).data("taxonid");
                }).get();
                var numberOfSpecies = vm.missingSpeciesArray.length;
                var $table = $("<table class='kommunlista'/>").html($(data).find("#specieslist tbody"));
                var $header = $([
                    '<div class="btn-group pull-right">',
                        '<a href="' + vm.getListUrl(kommunNamn) + '" class="btn btn-small" target="_blank">Lista</a>',
                        '<a href="' + vm.getMissingSpeciesUrl(kommunNamn) + '" class="btn btn-small" target="_blank">Saknas</a>',
                        '<a href="' + vm.getKommunLiganUrl(kommunNamn) + '" class="btn btn-small" target="_blank">Kommunligan</a>',
                        '<a href="' + vm.getSitesByKommunUrl(kommunNamn) + '" class="btn btn-small" target="_blank">Lokaler</a>',
                    '</div>',
                    '<h4>' + kommunNamn + ' <b>' + numberOfSpecies + '</b></h4>'
                ].join(''));
                vm.Templates.modal.find("#listtab").html($header.add($table));
                $('#smalltabs a[href="#listtab"]').text(kommunNamn + " (" + numberOfSpecies + ")");
                vm.setKommunData(kommunNamn, numberOfSpecies);
                $(obj).replaceWith(vm.displayKommunItem(kommunNamn, vm.setKommunData(kommunNamn, numberOfSpecies)));
                vm.extractionActivated(false);
            });
        };

        vm.sumKommunKryss = function() {
            var sum = 0;
            for (var key in vm.kommunData) {
               if (vm.kommunData.hasOwnProperty(key)) {
                  var obj = vm.kommunData[key];
                  for (var prop in obj) {
                     if (obj.hasOwnProperty(prop) && prop === "antal") {
                        sum += obj[prop];
                     }
                  }
               }
            }
            return sum;
        };

        vm.updateKommunSumma = function() {
            var summa = vm.sumKommunKryss();
            var medel = summa / 290;
            function roundToTwo(num) {    
                return +(Math.round(num + "e+2")  + "e-2");
            }
            vm.Templates.modal.find(".modal-title b").text(summa);
            vm.Templates.modal.find(".modal-title small").text("(" + roundToTwo(medel) + " i medel)");
        };

        vm.firstLoad = function() {
            vm.kommunData = JSON.parse(localStorage.getItem("kommunData"));
            vm.extractionActivated(true);
            var html = [];
            $.each(vm.Municipalitys, function (index, value) {
                var kommunItem = vm.getKommunData(value);
                html.push(vm.displayKommunItem(value, kommunItem));
            });
            vm.Templates.modal.find("#kommunkrysswrapper").html(html.join(''));
            vm.updateKommunSumma();
            vm.extractionActivated(false);
            vm.Templates.modal.find('#search_input').fastLiveFilter('#kommunkrysswrapper');
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
                    vm.showKommunKryss($(this).closest(".dropdown"));
                } else if ($(this).attr("href") === "#update") {
                    vm.getListData($(this).closest(".dropdown"));
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
