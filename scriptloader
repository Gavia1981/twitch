var JSZ_SCRIPTLOADER = (function(vm) {

	vm.host = {
		ebird: !!$("#submit-summary").length,
		mobile : !!$("#sightingInfoModal").length,
		view : !!$("#PresentationViewReload").length
	}

	vm.getScript = function(scriptName) {
		$.getScript("https://rawgit.com/Gavia1981/twitch/master/" + scriptName + "?t=" + new Date().getTime())
		.done(function( script, textStatus ) {
		}).fail(function( jqxhr, settings, exception ) {
			alert("Error!");
		});
	};

	vm.init = function() {
		if (vm.host.ebird) {
			vm.getScript("ebird.js");
		} else if (vm.host.mobile) {
			vm.buttons = $([
			'<div class="btn-group" style="position: fixed;bottom: 10px;left: 10px;">',
				"<a href='kommunkryss.js' class='btn btn-large'>Regionkryss</a>",
				"<a href='modal-test.js' class='btn btn-large'>Filtrera fynd</a>",
				"<a href='import-export.js' class='btn btn-large'>Importera</a>",
			"</div>"
			].join('')).find("a").click(function(e) {
				e.preventDefault();
				vm.getScript($(this).attr("href"));
				vm.buttons.remove();
			}).end().appendTo(document.body);
		} else {
			vm.getScript("import-export.js");
		}
	};

	vm.init();

	return vm;

}(JSZ_SCRIPTLOADER || {}));
