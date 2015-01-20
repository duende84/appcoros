exports.setupMenu = function(options) {
    if ( options.title !== null ) {
        $.lblText.setText(options.title);
    }

    if ( options.noSearch ) {
        $.searchPane.hide();
        $.menu.remove($.searchPane);
    } else {
        if ( OS_ANDROID ) {
            $.inputSearch.softKeyboardOnFocus = Ti.UI.Android.SOFT_KEYBOARD_HIDE_ON_FOCUS;

            $.inputSearch.addEventListener('click', function(){
                $.inputSearch.softKeyboardOnFocus = Ti.UI.Android.SOFT_KEYBOARD_SHOW_ON_FOCUS;
            });
        }
    }

    if ( options.returnEvent !== null ) {
        $.inputSearch.addEventListener('return', options.returnEvent);
    }

    $.view.addEventListener('click', function(){
        var dialog = Ti.UI.createAlertDialog({
            cancel: 2,
            buttonNames: ['Hymns', 'Choirs','Cancel']
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
