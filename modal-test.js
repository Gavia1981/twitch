(function parseTodaysSightings(userAlias) {
    var Templates = {};

    Templates.modal = $([
        '<div class="modal hide in" id="extractSightingsModal">',
            '<div class="modal-header">',
                '<button type="button" class="close" data-dismiss="modal"><span>&times;</span></button>',
                '<h4 class="modal-title">Letar kryss</h4>',
            '</div>',
            '<div class="modal-body">',
                '<div class="tabbable">',
                    '<ul class="nav nav-tabs" id="smalltabs">',
                        '<li class="active"><a href="#test1" data-toggle="tab">3 juni</a></li>',
                        '<li><a href="#test2" data-toggle="tab" class=" btn-map">2 juni</a></li>',
                    '</ul>',
                    '<div class="tab-content">',
                        '<div class="tab-pane active" id="test1"></div>',
                    '</div>',
                '</div>',
            '</div>',
        '</div>'
    ].join("\n"));

    Templates.modal.appendTo(document.body).modal("show");

})("johans");
