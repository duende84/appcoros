var APP      = require('core'),
    params   = arguments[0] || {},
    type     = params.type || '';

$.menu.setupMenu({ title: type });

APP.addContext($.indexWindow, $.screenWrapper);
APP.openCurrentWindow();