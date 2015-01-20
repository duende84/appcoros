var APP      = require('core'),
    params   = arguments[0] || {},
    type     = params.type || '';

var buildList = function(items){

	var filter_items = _.filter(items, function(it){ return it.type === type.toLowerCase(); });
    _.map(filter_items, function(_obj, i) {

    	var item = {
	        itemName        : { text: _obj.name },
	        itemType        : { text: _obj.type.charAt(0) === 'h' ? 'H' : 'C' },
	        itemButton      : { title: L('see') },
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
	{ type: 'coirs', name: 'Coir 1' },
	{ type: 'coirs', name: 'Coir 2' },
	{ type: 'coirs', name: 'Coir 3' },

	{ type: 'hymns', name: 'Hymn 1' },
	{ type: 'hymns', name: 'Hymn 2' },
	{ type: 'hymns', name: 'Hymn 3' },

	{ type: 'coros', name: 'Coro 1' },
	{ type: 'coros', name: 'Coro 2' },
	{ type: 'coros', name: 'Coro 3' },

	{ type: 'himnos', name: 'Himno 1' },
	{ type: 'himnos', name: 'Himno 2' },
	{ type: 'himnos', name: 'Himno 3' }
]);
