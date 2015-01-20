var APP      = require('core'),
    params   = arguments[0] || {};

$.viewHymns.addEventListener('click', function(){
	Alloy.createController('list_views', { type: L('lblHymns') });
});

$.viewChoirs.addEventListener('click', function(){
	Alloy.createController('list_views', { type: L('lblChoirs') });
});

APP.addContext($.indexWindow, $.screenWrapper);
APP.openCurrentWindow();