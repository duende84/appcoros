var APP      = require('core'),
    params   = arguments[0] || {},
    type     = params.type || '',
    filter_items;

var filterItems = function(items){
	filter_items = _.filter(items, function(it){ return it.type === type.toLowerCase(); });
	buildList(filter_items);
};

var buildList = function(items){
    _.map(items, function(_obj, i) {

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

var filterHandler = function() {
    var term      =  $.menu.getView('inputSearch').getValue().toLowerCase();
    var dataItems = [];
    $.section.setItems([]);
    _.map(filter_items, function(it) {
        if(it.name.toLowerCase().indexOf(term) > -1){
            dataItems.push(it);
        }
    });
    buildList(dataItems);
};

$.menu.setupMenu({ title: type, returnEvent: filterHandler });

APP.addContext($.indexWindow, $.screenWrapper);
APP.openCurrentWindow();

filterItems([
	{ type: 'choirs', name: 'Choir 1' },
	{ type: 'choirs', name: 'Choir 2' },
	{ type: 'choirs', name: 'Choir 3' },

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
