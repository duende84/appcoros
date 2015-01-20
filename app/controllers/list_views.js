var APP      = require('core'),
    params   = arguments[0] || {},
    type     = params.type || '';

var buildList = function(arr){
    _.map(arr, function(_obj, i) {

    	var item = {
	        itemName        : { text: _obj.name },
	        itemType        : { text: _obj.type === 'hymn' ? 'H' : 'C' },
	        itemButton      : { title: 'Ver' },
	        itemObject      : _obj,
	        properties      : {
	            layout           : 'horizontal',
	            touchEnabled     : false,
	            accessoryType    : Ti.UI.LIST_ACCESSORY_TYPE_NONE,
	            height           : Ti.UI.SIZE,
	            backgroundColor  : 'transparent'
	        }
	    };
	    if ( OS_IOS ) {
	        item.properties.selectionStyle = Ti.UI.iPhone.ListViewCellSelectionStyle.NONE;
	    }

        $.section.appendItems([item]);
    });
};

$.menu.setupMenu({ title: type });

APP.addContext($.indexWindow, $.screenWrapper);
APP.openCurrentWindow();

buildList([
	{ type: 'coir', name: 'Coro 1' },
	{ type: 'coir', name: 'Coro 2' },
	{ type: 'coir', name: 'Coro 3' },
	{ type: 'hymn', name: 'Himno 1' },
	{ type: 'hymn', name: 'Himno 2' },
	{ type: 'hymn', name: 'Himno 3' },
]);
