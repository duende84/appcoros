exports.setupMenu = function(options) {
    if ( options.title != null ) {
        $.lblText.setText(options.title);
    }

    if ( options.noSearch ) {
        $.searchPane.hide();
        $.menu.remove($.searchPane);
    }
};