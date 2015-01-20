exports.setupMenu = function(options) {
    if ( options.title !== null ) {
        $.lblText.setText(options.title);
    }

    if ( options.noSearch ) {
        $.searchPane.hide();
        $.menu.remove($.searchPane);
    }

    $.view.addEventListener('click', function(){
        var dialog = Ti.UI.createAlertDialog({
            cancel: 2,
            buttonNames: ['Hymns', 'Coirs','Cancel']
        });

        dialog.addEventListener('click', function(e){
            if (e.index === e.source.cancel){
              Ti.API.info('The cancel button was clicked');
            }

            Ti.API.info('e.cancel: ' + e.cancel);
            Ti.API.info('e.source.cancel: ' + e.source.cancel);
            Ti.API.info('e.index: ' + e.index);
        });

        dialog.show();
    });
};
