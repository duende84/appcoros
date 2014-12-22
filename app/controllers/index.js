var APP      = require('core'),
    params   = arguments[0] || {};

$.viewHymns.addEventListener('click', function(){
	Alloy.createController('list_views', { type: L('lblHymns') });
});

$.viewCoirs.addEventListener('click', function(){
	Alloy.createController('list_views', { type: L('lblCoirs') });
});

APP.addContext($.indexWindow, $.screenWrapper);
APP.openCurrentWindow();