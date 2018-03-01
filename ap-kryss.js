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
                ".exportSightings .btn-small [class^='icon-'], .exportSightings .btn-small [class*=' icon-'] { margin-left: 5px; border-left: 1px solid #DCDCDC; padding: 7px 0px 5px 8px; }",
                ".lbl b { padding-left: 4px; display: inline-block; }",
                ".lbl { display: inline-block; padding: 4px 8px; line-height: 14px; white-space: nowrap; vertical-align: baseline; background-color: #D7EBEF; border: 1px solid rgba(0,0,0,0.1); margin: 2px; font-size: 12px; border-radius: 3px; }",
                "#extractSightingsModal #smalltabs { margin:-15px -15px 5px !important; }",
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
                    '<ul class="nav nav-tabs" id="smalltabs">',
                        '<li class="active"><a href="#regionstab" data-toggle="tab">Översikt</a></li>',
                        '<li><a href="#listtab" data-toggle="tab" class=" btn-map">Inställningar</a></li>',
                    '</ul>',
                    '<div class="tab-content">',
                        '<div class="tab-pane" id="regionstab">',
                            '<div class="loadingmessage"><img src="//artportalen.se/Content/Images/ajax-loader-circle.gif"> Letar kryss...</div>',
                        '</div>',
                        '<div class="tab-pane" id="listtab"></div>',
                    '</div>',
                '</div>',
                '<div class="modal-footer">',
                    '<a href="#" class="btn btn-small pull-left btn-settings">Inställningar <i class="icon-cog"></i></a>',
                    '<a href="#" class="btn btn-small btn-export">Exportera <i class="icon-cloud-download"></i></a>',
                    '<a href="#" class="btn btn-small pull-right btn-abort">Scanna <i class="icon-pause"></i></a>',
                '</div>',
            '</div>'
        ].join("\n")).appendTo(document.body).find("button.close").click(function() {
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
        vm.Templates.table = $("<table id='extractedsightings'></table>").appendTo(vm.Templates.modal.find(".modal-body"));

        vm.Templates.exportView = $([
            '<div class="modal hide in" id="exportSightings">',
                '<div class="modal-header">',
                    '<b>Exportera</b> ',
                    '<button type="button" class="btn btn-select">Markera text</button>',
                    '<button type="button" class="close" data-dismiss="modal"><span>&times;</span></button>',
                '</div>',
                '<div class="modal-body">',
                    '<div id="exportArea"></div>',
                '</div>',
            '</div>'
        ].join("\n")).appendTo(document.body).find(".btn-select").click(function(e) {
            e.preventDefault();
            vm.selectText("exportArea");
        }).end();

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

            function compareLists(obj) {
                // console.log(obj);
                for (var key in vm.listModule.twitchMatrix) {
                    var list = vm.listModule.twitchMatrix[key];
                    // console.log(list);
                    if (list.type == "Lokal" && list.siteid == (obj.SiteParentId || obj.SiteId)) {
                        // console.log("Lokal träff " + list.name);
                        return $.inArray(obj.TaxonId, list.species) === -1;
                    }
                    if (list.type == "Landskap" && list.name == obj.RegionName) {
                        // console.log("Landskap träff " + list.name);
                        return $.inArray(obj.TaxonId, list.species) === -1;
                    }
                }
                return false;
            }

            return $.grep(window.viewModel.sightings(), function(obj, index) {
                return compareLists(obj);
                //return $.inArray(obj.TaxonId, vm.missingSpeciesArray) === -1;
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
                    vm.firebase.sightings.set(selectedSighting, sightingid);
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

        vm.utilities = {
            debug: true,
            log: function(message) {
                if (vm.utilities.debug) console.log(message);
            },
            localStorageEnabled: function (){
                var test = 'test';
                try {
                    localStorage.setItem(test, test);
                    localStorage.removeItem(test);
                    return true;
                } catch(e) {
                    return false;
                }
            },
            user : {
                isUserLoggedIn: false,
                isUserLoggedInUrl : '//artportalen.se/?t=' + new Date().getTime(),
                checkIfUserIsLoggedInToArtportalen: function(callBackFunction) {
                    $.get(vm.utilities.user.isUserLoggedInUrl, function( data ) {
                        vm.Templates.modal.find(".loadingmessage").hide();
                        vm.utilities.user.isUserLoggedIn = !!$(data).find("ul[data-useralias]").length;
                        if (!vm.utilities.user.isUserLoggedIn) {
                            vm.utilities.user.displayNotLoggedInMessage();
                        };
                        callBackFunction();
                        vm.utilities.log("vm.utilities.user.checkIfUserIsLoggedInToArtportalen();");
                        vm.utilities.log(vm.utilities.user.isUserLoggedIn);
                    });
                },
                displayNotLoggedInMessage: function() {
                    vm.Templates.modal.find(".modal-title").html("<h4 class='text-warning'><i class='icon-warning-sign'></i> Ej inloggad i Artportalen!<br><small>Öppna ett annat webbläsarfönster och logga in i Artportalen, var nogrann med att ange https i webbadressen</small></h4>");
                }
            },
            regions: {
                mapProvince: {
                    sk : 'Skåne',
                    bl : 'Blekinge',
                    sm : 'Småland',
                    öl : 'Öland'
                }
            },
            stopExtractionByEscapeKey: function() {
                $(document).keyup(function(e) {
                    if (e.keyCode == 27) { 
                        vm.extractionActivated(false);
                    }
                });
            },
            renderData: function(settings) {
                var templateHtml = '<ul>';
                for (var key in settings.data) {
                    var dataItem = settings.isJSON ? JSON.parse(settings.data[key]) : settings.data[key];
                    templateHtml += settings.renderItem(dataItem);
                }
                templateHtml += '</ul>';
                var renderTemplateHtml = vm.Templates.modal.find("#listtab").find(settings.elementId); 
                renderTemplateHtml.append('<h5>' + settings.message + '</h5>' + templateHtml);
                vm.utilities.indicateChange(renderTemplateHtml);
            },
            getScript: function(url, success) {
                var script = document.createElement('script');
                script.src = url;
                var head = document.getElementsByTagName('head')[0],
                done = false;
                script.onload = script.onreadystatechange = function () {
                    if (!done && (!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete')) {
                        done = true;
                        success();
                        script.onload = script.onreadystatechange = null;
                        head.removeChild(script);
                    }
                };
                head.appendChild(script);
            },
            indicateChange: function($element) {
                $element.stop().css("background-color", "#FFFF9C").animate({ backgroundColor: "#FFFFFF"}, 1500);
            },
            sighting: {
                getSightingById: function(sightingId) {
                    $.get("//artportalen.se/Sighting/" + sightingId + "?t=" + new Date().getTime(), function( data ) {
                        vm.Templates.modal.find(".loadingmessage").hide();
                        var sightingObject = vm.utilities.sighting.createSightingObject($(data), sightingId);
                        vm.utilities.log(sightingObject);
                    });
                },
                scrape: {
                    SightingPresentation: function(row) {
                        return [
                            row.find("td.label:contains(Antal)").siblings("td.data").text(),
                            row.find("td.label:contains(Kön)").siblings("td.data").text(),
                            row.find("td.label:contains(Ålder)").siblings("td.data").text(),
                            row.find("td.label:contains(Aktivitet)").siblings("td.data").text()
                        ].join(" ");
                    },
                    Site: function(row, index, trueForData) {
                        var scrape = row.find("[data-siteid]:eq(" + index + ")") || "";
                        return trueForData ? scrape.data("siteid") : scrape.text();
                    },
                    ByLabel: function(row, label) {
                        return row.find("td.label:contains(" + label + ")").siblings("td.data").text();
                    },
                    TaxonName: function(row, index) {
                        return row.find("[data-taxonid]:eq(" + index + ")").text();
                    },
                    Time: function(row) {
                        return [
                            row.find("td.label:contains(Startdatum)").siblings("td.data span:eq(1)").text(),
                            row.find("td.label:contains(Slutdatum)").siblings("td.data span:eq(1)").text()
                        ].join(" - ");
                    }
                },
                createSightingObject: function(row, sightinId) {
                    return {
                        TodaysSightingId : sightinId,
                        SightingId : sightinId,
                        TriggeredValidationLevel : 0,
                        TaxonId : row.find("[data-taxonid]:eq(0)").data("taxonid"),
                        TaxonSpeciesGroupId : 0,
                        SightingPresentation : vm.utilities.sighting.scrape.SightingPresentation(row),
                        SitePresentation : vm.utilities.sighting.scrape.Site(row, 0, false) + ', ' + vm.utilities.sighting.scrape.Site(row, 1, false),
                        SiteId : vm.utilities.sighting.scrape.Site(row, 0, true),
                        SiteName : vm.utilities.sighting.scrape.Site(row, 0, false),
                        SiteParentId : vm.utilities.sighting.scrape.Site(row, 1, true),
                        SiteParentName : vm.utilities.sighting.scrape.Site(row, 1, false),
                        Observers : row.find("#coobservers").html(),
                        PublicCommentId : 0,
                        TimePresentation : vm.utilities.sighting.scrape.Time(row),
                        NoteOfInterest : !!row.find("td.label:contains(Intressant kommentar)").length,
                        Unspontaneous : false,
                        UnsureDetermination : false,
                        HasImages : !!row.find("a[href='#SightingDetailImages'] em").text(), //
                        RegionName : vm.utilities.sighting.scrape.ByLabel(row, "Landskap"),
                        RegionShortName : vm.utilities.sighting.scrape.ByLabel(row, "Landskap"),
                        RegionalSightingState : 1,
                        ObservedDatePresentation : vm.utilities.sighting.scrape.ByLabel(row, "Startdatum"),
                        PublishedDatePresentation : vm.utilities.sighting.scrape.ByLabel(row, "Startdatum"),
                        TaxonScientificName : vm.utilities.sighting.scrape.TaxonName(row, 1),
                        TaxonName : vm.utilities.sighting.scrape.TaxonName(row, 0),
                        Startdate : vm.utilities.sighting.scrape.ByLabel(row, "Startdatum"),
                        PublicComment : vm.utilities.sighting.scrape.ByLabel(row, "Kommentar")
                    };
                }
            }
        };

        vm.firebase = {
            enabled : ko.observable(false),
            url: function() {
                return localStorage.getItem('twitch-useralias').toLowerCase();
            },
            init: function(callBackFunction) {
                // Be sure to load  first
                vm.utilities.getScript('//www.gstatic.com/firebasejs/4.10.0/firebase.js', function () {
                    // Initialize Firebase
                    var config = {
                        apiKey: "AIzaSyCj5vVCvWRVPxl0_YJHmKaYKvoQJOTJ4WE",
                        authDomain: "twitcher-app.firebaseapp.com",
                        databaseURL: "https://twitcher-app.firebaseio.com",
                        projectId: "twitcher-app",
                        storageBucket: "twitcher-app.appspot.com",
                        messagingSenderId: "698525556871"
                    };
                    firebase.initializeApp(config);
                    vm.utilities.log("Firebase ready!");

                    callBackFunction();

                    // Show in GUI that Firebase is succesfully loaded
                    // vm.Templates.modal.find("#listtab").append("<span class='label label-success'><i class='icon-check'></i> Firebase.js</span>");

                    vm.firebase.enabled(true);
                });
            },       
            lists: {
                set : function(listData) {
                    firebase.database().ref(vm.firebase.url() + '/lists/' + listData.name + listData.year).set(listData);
                },
                get : function(callbackFunction) {
                    firebase.database().ref(vm.firebase.url() + '/lists/').once('value').then(function(snapshot) {
                        callbackFunction(snapshot.val());
                    });
                }
            },
            sightings: {
                set: function(sighting, sightingid) {
                    firebase.database().ref(vm.firebase.url() + '/sightings/' + sightingid).set(sighting);
                },
                get: function(callbackFunction) {
                    firebase.database().ref(vm.firebase.url() + '/sightings/').once('value').then(function(snapshot) {
                        callbackFunction(snapshot.val());
                    });
                }
            },
            species: {
                set: function(listData, callbackFunction) {
                    firebase.database().ref(vm.firebase.url() + '/species/').set(listData, function(error){
                        callbackFunction(error);
                    });
                },
                get: function(callbackFunction) {
                    firebase.database().ref(vm.firebase.url() + '/species/').once('value').then(function(snapshot) {
                        callbackFunction(snapshot.val());
                    });
                }
            }
        }

        vm.listModule = {
            Templates: {
                searchForm: $([
                    '<form>',
                        '<div class="form-group">',
                            '<div class="well well-small" id="settings-sightings">',
                                '<h4>Fynd<h4>',
                                '<button class="btn btn-primary" type="button" id="settings-sightings-render">Visa</button>',
                                '<button class="btn btn-primary" type="button" id="settings-sightings-update">Uppdatera <i class=icon-refresh></i></button>',
                            '</div>',
                            '<div class="well well-small" id="settings-lists">',
                                '<h4>Listor<h4>',
                                '<input type="text" class="form-control" id="searchAreaName" placeholder="Lägg till lista, sök kommun/lokal/landskap"><br>',
                                '<button class="btn btn-primary" type="button" id="settings-lists-render">Visa</button>',
                                '<button class="btn btn-primary" type="button" id="settings-lists-update">Uppdatera <i class=icon-refresh></i></button>',
                            '</div>',
                            '<div class="well well-small" id="settings-species">',
                                '<h4>Taxonlista<h4>',
                                '<button class="btn btn-primary" type="button" id="settings-species-render">Visa</button>',
                                '<button class="btn btn-primary" type="button" id="settings-species-update">Uppdatera <i class=icon-refresh></i></button>',
                            '</div>',
                        '</div>',
                    '</form>'
                ].join("\n"))
            },
            twitchMatrix: JSON.parse(localStorage.getItem('twitchMatrix')),
            sightings: {
                update : function() {
                    for (var key in localStorage) {
                        if (key.indexOf("sightingid") != "-1") {
                            vm.firebase.sightings.set(JSON.parse(localStorage.getItem(key)), key);
                        }
                    }
                },
                render : function() {
                    vm.utilities.log("vm.listModule.sightings.displayData()");
                    vm.firebase.sightings.get(function(sightings) {
                        vm.utilities.renderData({
                            elementId: "#settings-sightings",
                            message: "Alla fynd i Firebase",
                            isJSON: true,
                            data : sightings,
                            renderItem : function(item) {
                                return '<li><b>' + item.TaxonName + '</b> - ' + item.SitePresentation + ' (<i>' + item.ObservedDatePresentation + '</i>)</li>';
                            }
                        });
                    });
                }
            },
            lists: {
                update: function() {
                    vm.firebase.lists.get(function(data) {
                        localStorage.setItem("twitchMatrix", JSON.stringify(data));
                    });
                },
                render : function() {
                    vm.utilities.log("vm.listModule.lists.displayData()");
                    vm.firebase.lists.get(function(lists) {
                        vm.utilities.renderData({
                            elementId: "#settings-lists",
                            message: "Alla listor i Firebase",
                            data : lists,
                            renderItem : function(item) {
                                return '<li><b>' + item.name + '</b> <em>' + item.type + '</em> (' + item.speciesCount + ')</li>';
                            }
                        });
                    }); 
                }
            },
            species: {
                update: function() {
                   $.get('//artportalen.se/List/Top/Species/F%C3%A5glar/Total/Kommun/Alla%20lokaler/AnySite/OrderByTaxon/Asc/AnyUser', function( data ) {
                        var speciesArray = $(data).find("span[data-taxonid]").map(function(index) {
                            return {
                                taxonid: $(this).data("taxonid"),
                                speciesName: $(this).find("strong").text(),
                                speciesNameScientific: $(this).find("em.scientific").text(),
                                sortorder: index
                            };
                        }).get();
                        vm.utilities.log("vm.listModule.species.setAll()");
                        vm.utilities.log(speciesArray);
                        vm.firebase.species.set(speciesArray, function() {
                            vm.utilities.log("TJOHO");
                        });
                    });
                },
                render : function() {
                    vm.utilities.log("vm.listModule.species.displayData()");
                    vm.firebase.species.get(function(species) {
                        vm.utilities.renderData({
                            elementId: "#settings-species",
                            message: "Artlista i Firebase",
                            data : species,
                            renderItem : function(item) {
                                return '<li><b>' + item.speciesName + '</b> <em>' + item.speciesNameScientific + '</em></li>'
                            }
                        });
                    });
                }
            },
            getListUrl: function(item, year) {
                return [
                    "//artportalen.se/List/Top/Species/F%C3%A5glar",
                    year ? year : item.IsSite ? 'AllYears' : 'Total', 
                    item.IsRegion ? "Landskap" : "Kommun", 
                    item.Name, 
                    item.IsSite ? item.Id : 'AnySite',
                    "OrderByTaxon/Asc", 
                    localStorage.getItem("twitch-useralias")
                ].join('/') + "?t=" + new Date().getTime();
            },
            fetchList: function(item, year) {
                $.get(vm.listModule.getListUrl(item, year), function( data ) {
                    vm.Templates.modal.find(".loadingmessage").hide();
                    var speciesArray = $(data).find("span[data-taxonid]").map(function() {
                        return $(this).data("taxonid");
                    }).get();
                    var listData = {
                        type: item.IsMunicipality ? "Kommun" : item.IsRegion ? "Landskap" : "Lokal",
                        siteid: item.Id || null,
                        name: item.Name,
                        year: year,
                        species: speciesArray,
                        speciesCount: speciesArray.length,
                        lastUpdated: Date.now()
                    }
                    vm.utilities.log("vm.listModule.fetchList();");
                    vm.utilities.log(listData);
                    vm.firebase.lists.set(listData);
                });
            },
            addList: function(item) {
                vm.utilities.log("vm.listModule.addList();");
                vm.utilities.log(item);
                vm.listModule.fetchList(item, '');
            },
            autoComplete: function() {
                var xhrRegionForList;
                vm.Templates.modal.find("#listtab").find("#searchAreaName").keypress(function (event) {
                    if (event.keyCode == 13) { event.preventDefault(); }
                    if (xhrRegionForList) { xhrRegionForList.abort(); }
                }).autocomplete({
                    delay: 150,
                    source: function(request, response) {
                        xhrRegionForList = Artportalen.ajaxPost(
                            window.Artportalen_ApplicationPath + '/Location/FindGeographicLocation',
                            { 
                                Term: request.term,
                                SearchForSites : true,
                                IncludeSubSites : false
                            },
                            function( data ) {
                                if (data == null || !data.length) {
                                    data = [{ Id : 0, Name: 'Sökningen gav inga träffar', Description: '', TypeDescription: '', ColorString: '#eee' }];
                                }
                                response( $.map( data, function( item ) {
                                    return item;
                                }));
                            }
                        );
                    },
                    minLength: 2,
                    select:  function (event, ui) {
                        if (ui.item.Id == 0) {
                            return false;
                        }
                        vm.listModule.addList(ui.item);
                        return false;
                    },
                    open: function(event, ui) {
                        //$("#searchSiteLoader").remove(); // Remove the AJAX loading indicator
                    },
                }).data("autocomplete")._renderItem = function (ul, item) {
                    return $("<li></li>")
                        .data("item.autocomplete", item)
                        .append("<a>" + item.Name + " <em class='unit'>(" + item.Description + ")</em>" + "</a>")
                        .appendTo(ul);
                };
            },
            init: function() {
                vm.Templates.modal.find("#listtab").append(vm.listModule.Templates.searchForm)
                    .find("#settings-sightings-update").click(function(event) {
                        event.preventDefault();
                        vm.listModule.sightings.update();
                    }).end()
                    .find("#settings-sightings-render").click(function(event) {
                        event.preventDefault();
                        vm.listModule.sightings.render();
                    }).end()
                    .find("#settings-species-update").click(function(event) {
                        event.preventDefault();
                        vm.listModule.species.update();
                    }).end()
                    .find("#settings-species-render").click(function(event) {
                        event.preventDefault();
                        vm.listModule.species.render(); 
                    }).end()
                    .find("#settings-lists-update").click(function(event) {
                        event.preventDefault();
                        vm.listModule.lists.update();
                    }).end()
                    .find("#settings-lists-render").click(function(event) {
                        event.preventDefault();
                        vm.listModule.lists.render(); 
                    }).end();
                    


                // Be sure to load lodash first
                vm.utilities.getScript('//cdnjs.cloudflare.com/ajax/libs/lodash.js/1.3.1/lodash.min.js', function () {
                    // Show in GUI that lodash is succesfully loaded
                    // vm.Templates.modal.find("#listtab").append("<span class='label label-success'><i class='icon-check'></i> Lodash.js</span>");
                    // Attach the search form
                    vm.listModule.autoComplete();
                });
            }
        };

        vm.tests = {
            getSightingsById: function() {
                vm.utilities.sighting.getSightingById(69648966); // Med intressant notering
                vm.utilities.sighting.getSightingById(69576435); // Med media + intressant notering
                vm.utilities.sighting.getSightingById(69671300); // Plain stuff
            },
            mapRegions: function() {
                vm.utilities.log(vm.utilities.regions.mapProvince["sk"]);
            },
            init: function() {
                vm.utilities.debug = true;
                vm.utilities.log("vm.tests.init();");
                vm.tests.mapRegions();
            }
        }

        vm.init = function() {

            // No local storage, stop immediately
            if (!vm.utilities.localStorageEnabled()) {
                alert("Error! No local storage enabled...");
                return false;
            }

            // Check if user is logged in
            vm.utilities.user.checkIfUserIsLoggedInToArtportalen(function() {
                // User is logged in - go on with initialization 
                if (vm.utilities.user.isUserLoggedIn) {

                    // List module and firebase
                    vm.listModule.init();
                    vm.firebase.init(function() {

                        // Check url of host page
                        var hostUrl = location.href;
                        if (hostUrl.indexOf("//artportalen.se/Sighting/") !== -1) {
                            
                            var sightingId = $(document.body).find("[data-sightingid]:eq(0)").data();
                            var sightingObject = vm.utilities.sighting.createSightingObject($(document.body), sightingId);

                            vm.utilities.log("Sighting Detail View: id = " + sightingId);
                            vm.utilities.log(sightingObject);

                            localStorage.setItem('sightingid-' + sightingId, JSON.stringify(sightingObject));
                            vm.firebase.sightings.set(JSON.stringify(sightingObject), sightingId);

                            return false;
                        } else {
                            // No user - show settings
                            if (localStorage.getItem('twitch-useralias') === null) {
                                vm.extractionActivated(false);
                                vm.showSettings();
                            // Else - run first load
                            } else {

                                // Set a larger page size, fetching faster...
                                window.viewModel.setPageSize(500);

                                vm.extractionActivated(false);
                                vm.firstLoad();
                                vm.Templates.modal.modal("show");
                                vm.Templates.table.on( "click", "tr:not(.divider)", function() {
                                    $(this).addClass("rowAdded");
                                    vm.showSightingInfo($(this).data("todayssightingid"));
                                })
                            }
                        }
                    });

                } else {
                    return false;
                }
            });


            vm.utilities.stopExtractionByEscapeKey();

            vm.tests.init();

        };
        vm.init();
    }

    window.twitchViewModel = new twitchViewModel();
    ko.applyBindings(window.viewModel, window.twitchViewModel.Templates.modal[0]);

})();
