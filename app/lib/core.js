var Alloy       = require('alloy');

var APP = {
    /**
     * Global reference to stack of contexts
     */
    ContextStack: [],

    /**
     * Global reference to stack of app messages
     */
    MessagesStack: [],

    /**
     * Global reference to Drawer
     */
    Drawer: null,

    /**
     * Global reference to Loader
     */
    Loader: null,

    /**
    * Device information
    * @type {Object}
    * @param {Boolean} isHandheld Whether the device is a handheld
    * @param {Boolean} isTablet Whether the device is a tablet
    * @param {String} type The type of device, either "handheld" or "tablet"
    * @param {String} os The name of the OS, either "IOS" or "ANDROID"
    * @param {String} name The name of the device, either "IPHONE", "IPAD" or the device model if Android
    * @param {String} version The version of the OS
    * @param {Number} versionMajor The major version of the OS
    * @param {Number} versionMinor The minor version of the OS
    * @param {Number} width The width of the device screen
    * @param {Number} height The height of the device screen
    * @param {Number} dpi The DPI of the device screen
    * @param {String} orientation The device orientation, either "LANDSCAPE" or "PORTRAIT"
    * @param {String} statusBarOrientation A Ti.UI orientation value
    */
    Device: {
        isHandheld           : Alloy.isHandheld,
        isTablet             : Alloy.isTablet,
        type                 : Alloy.isHandheld ? "handheld" : "tablet",
        os                   : null,
        name                 : null,
        version              : Ti.Platform.version,
        versionMajor         : parseInt(Ti.Platform.version.split(".")[0], 10),
        versionMinor         : parseInt(Ti.Platform.version.split(".")[1], 10),
        width                : Ti.Platform.displayCaps.platformWidth > Ti.Platform.displayCaps.platformHeight ? Ti.Platform.displayCaps.platformHeight : Ti.Platform.displayCaps.platformWidth,
        height               : Ti.Platform.displayCaps.platformWidth > Ti.Platform.displayCaps.platformHeight ? Ti.Platform.displayCaps.platformWidth : Ti.Platform.displayCaps.platformHeight,
        dpi                  : Ti.Platform.displayCaps.dpi,
        orientation          : Ti.Gesture.orientation == Ti.UI.LANDSCAPE_LEFT || Ti.Gesture.orientation == Ti.UI.LANDSCAPE_RIGHT ? "LANDSCAPE" : "PORTRAIT",
        statusBarOrientation : null
    },

    /**
    * Network status and information
    * @type {Object}
    * @param {String} type Network type name
    * @param {Boolean} online Whether the device is connected to a network
    */
    Network: {
        type: Ti.Network.networkTypeName,
        online: Ti.Network.online
    },

    /**
    * Global network event handler
    * @param {Object} _event Standard Titanium event callback
    */
    networkObserver: function(_event) {
        Ti.API.debug(">>>>>>>>> APP.networkObserver" + JSON.stringify(_event));

        APP.Network.type = _event.networkTypeName;
        APP.Network.online = _event.online;

        if ( !APP.Network.online ) {
            Alloy.createController('shared/no_network');
        }
    },

    /**
    * Determines the device characteristics
    */
    determineDevice: function() {
        if(OS_IOS) {
            APP.Device.os = "IOS";

            if(Ti.Platform.osname.toUpperCase() == "IPHONE") {
                APP.Device.name = "IPHONE";
            } else if(Ti.Platform.osname.toUpperCase() == "IPAD") {
                APP.Device.name = "IPAD";
            }
        } else if(OS_ANDROID) {
            APP.Device.os = "ANDROID";
            APP.Device.name = Ti.Platform.model.toUpperCase();

            // Fix the display values
            APP.Device.width = (APP.Device.width / (APP.Device.dpi / 160));
            APP.Device.height = (APP.Device.height / (APP.Device.dpi / 160));
        }
    },


    addContext: function(_window, _wrapper){
        var context = {
            window: _window,
            wrapper: _wrapper,
            screen_ctlr: null,
            screen: null,
            vars: {}
        };

        APP.ContextStack.push(context);
    },

    cleanMemory: function (element, keepParent) {
        keepParent = keepParent || false;
        if ( element == null ) {
            return;
        }

        var childs;
        if ( element.getApiName().indexOf('ScrollableView') != -1 ) {
            childs = element.getViews();
        } else {
            childs = element.getChildren();
        }

        _.each(childs.reverse(), function (child) {
            element.remove(child);
            APP.cleanMemory(child);
        });

        childs = null;
        if ( !keepParent ) {
            element = null;
        }
    },

    dropCurrentContext: function(animation){
        var currentContext = APP.ContextStack.pop();

        // close current window
        if ( currentContext ) {
            // avoid closing drawer
            if ( currentContext.window === APP.Drawer ) {
                return;
            }

            if ( OS_IOS ) {
                animation = animation || Ti.UI.createAnimation({
                    duration : 300,
                    left     : '100%',
                    opacity  : 0
                });
                currentContext.window.close(animation);
            }

            if ( OS_ANDROID ) {
                animation = animation || {
                    activityExitAnimation : Titanium.App.Android.R.anim.slide_out_right
                };
                currentContext.window.close(animation);
            }

            _.delay(function() {
                if ( currentContext.screen_ctlr && currentContext.screen_ctlr.teardown ) {
                    currentContext.screen_ctlr.teardown();
                }
                else if( currentContext.screen && currentContext.screen.removeAllChildren ) {
                    currentContext.screen.removeAllChildren();
                }

                if( currentContext.screen_ctlr && currentContext.screen_ctlr.destroy ) {
                    currentContext.screen_ctlr.destroy();
                }

                currentContext.window      =
                currentContext.wrapper     =
                currentContext.screen_ctlr =
                currentContext.screen      =
                currentContext.vars        =
                currentContext             = null;
            }, 300);
        }
    },

    /**
     * Remove all contexts from stack but current
     */
    dropStackedContexts: function(){
        var currentContext = APP.getCurrentContext(),
            stackLength = APP.ContextStack.length;

        if (currentContext && stackLength > 1) {
            // iterate and close windows on stacked contexts
            for (var i = 0, m = stackLength-1; i < m; i++) {
                var ctx = APP.ContextStack[i];

                // avoid closing drawer
                if ( ctx.window !== APP.Drawer ) {
                    ctx.window.close();

                    if ( ctx.screen_ctlr && ctx.screen_ctlr.teardown ) {
                        ctx.screen_ctlr.teardown();
                    }
                    ctx.window = null;
                    ctx.wrapper = null;
                    ctx.screen_ctrl = null;
                    ctx.screen = null;
                    ctx.vars = null;
                    ctx = null;
                }
            }

            APP.ContextStack = [currentContext];
        }
    },

    dropAllStackedContexts: function(_callback){
        var stackLength = APP.ContextStack.length;
        Ti.API.info("cleaning stacked contexts, stack Length: ", stackLength);
        if (stackLength > 0) {
            // iterate and close windows on stacked contexts
            for (var i = 0; i < stackLength; i++) {
                var ctx = APP.ContextStack[i];

                // avoid closing drawer
                if ( ctx.window !== APP.Drawer ) {
                    ctx.window.close();

                    if ( ctx.screen_ctlr && ctx.screen_ctlr.teardown ) {
                        ctx.screen_ctlr.teardown();
                    }
                    ctx.window = null;
                    ctx.wrapper = null;
                    ctx.screen_ctrl = null;
                    ctx.screen = null;
                    ctx.vars = null;
                    ctx = null;
                }
            }

            APP.ContextStack = [];
            if (_callback) { _callback(); }
        }
    },

    updateCurrentContext: function(_window, _wrapper){
        APP.dropCurrentContext();
        APP.addContext(_window, _wrapper);
    },

    /**
     * current context is the last element in the contexts stacks
     */
    getCurrentContext: function(){
        return APP.ContextStack[ APP.ContextStack.length - 1 ];
    },


    getCurrentWindow: function(){
        var currentContext = APP.getCurrentContext() || {};
        return currentContext.window;
    },

    openCurrentWindow: function(animation){
        var currentWindow = APP.getCurrentWindow();
        if ( OS_IOS ) {
            animation = animation || {
                duration : 300,
                left     : 0,
                opacity  : 1.0
            };

            currentWindow.open(animation);
        }

        if ( OS_ANDROID ) {
            animation = animation || {
                activityEnterAnimation : Titanium.App.Android.R.anim.fade_in,
                activityExitAnimation : Titanium.App.Android.R.anim.fade_out
            };
            currentWindow.open(animation);
        }
    },

    getCurrentWrapper: function(){
        var currentContext = APP.getCurrentContext() || {};
        return currentContext.wrapper;
    },

    openScreen: function(_controller, _params){
        var currentContext = APP.getCurrentContext(),
            _screenController = Alloy.createController(_controller, _params),
            _screen = _screenController.getView();

        // add new screen
        currentContext.wrapper.add(_screen);

        // remove existing screen
        if( currentContext.screen != null ){
            currentContext.wrapper.remove(currentContext.screen);

            if ( currentContext.screen_ctlr && currentContext.screen_ctlr.teardown ) {
                currentContext.screen_ctlr.teardown();
            }

            currentContext.screen = null;
            currentContext.screen_ctlr = null;
        }

        currentContext.screen_ctlr = _screenController;
        currentContext.screen = _screen;

        return _screenController;
    },

    closeCurrentScreen: function(){
        var currentContext = APP.getCurrentContext();
        if( currentContext.screen !== null ){
            currentContext.wrapper.remove(currentContext.screen);

            if ( currentContext.screen_ctlr && currentContext.screen_ctlr.teardown ) {
                currentContext.screen_ctlr.teardown();
            }

            currentContext.screen = null;
            currentContext.screen_ctlr = null;
        }
    },

    // TODO: call controller.teardown function
    openModalScreen: function(_controller, _params){
        var currentContext = APP.getCurrentContext(),
            _screenController = Alloy.createController(_controller, _params),
            _screen = _screenController.getView();

        currentContext.wrapper.add(_screen);

        return _screen;
    },

    // TODO: call controller.teardown function
    closeModalScreen: function(_modal_screen){
        var currentContext = APP.getCurrentContext();
        if ( currentContext ) {
            currentContext.wrapper.remove(_modal_screen);
            _modal_screen = null;
        }
    },

    contextGet: function(name){
        var context = APP.getCurrentContext();
        if(context) {
            return context.vars[name];
        }
    },

    contextSet: function(name, value){
        var context = APP.getCurrentContext();
        if(context) {
            context.vars[name] = value;
        }
    },

    contextDelete: function(name){
        var context = APP.getCurrentContext();
        if(context) {
            delete context.vars[name];
        }
    },

    /**
     * Save a message in the stack for later consumption
     */
    saveMessage: function(message){
        if ( APP.validateMessage(message) ) {
            APP.MessagesStack.push(message);
        }
    },

    /**
     * Prevent duplicated messages in the stack
     */
    validateMessage: function(message){
        if ( APP.MessagesStack.length > 0 ) {

            if (message.level !== 'network') {
                return true;
            } else {
                var flag = 0;
                _.each(APP.MessagesStack, function (m) {
                    if (m.level === 'network') {
                        flag = 1;
                    }
                });
                return flag === 0 ? true : false;
            }
        }else{
            return true;
        }
    },

    /**
     * Sequencially show all messages in the stack
     * This operation also flush the stack
     */
    consumeMessages: function(){
        var message = APP.MessagesStack.shift();
        if ( message ) {
            message.consume = true;
            Alloy.createController('app_messages/message', message);
        }
    },

    startLoader: function(_callback, updateDrawer, fullscreen){
        var controller;
        updateDrawer = updateDrawer || false;
        fullscreen   = fullscreen || false;

        if ( APP.Loader != null ) {
            APP.stopLoader();
        }

        if ( updateDrawer && OS_ANDROID) {
            controller = Alloy.createController('loading/index_tabbar_android',{
                callback : _callback
            });
            updateDrawer(controller);
        } else {
            controller = Alloy.createController('loading/index',{
                callback   : _callback,
                tabbarMode : updateDrawer ? true : false,
                fullscreen : fullscreen
            }).getView();
        }

        APP.Loader = {
            controller : controller,
            tabbarMode : updateDrawer ? true : false
        };

        /*APP.addContext(
            APP.Loader,
            loadingCtrl.getView('loadingWrapper')
        );*/
    },

    stopLoader: function(){
        if ( APP.Loader == null ) {
            return;
        }

        if ( APP.Loader.tabbarMode === true && OS_ANDROID ) {
            APP.Loader.controller.teardown();
            APP.Loader = null;
            return;
        }

        var loaderWindow = APP.Loader.controller;
        if ( OS_IOS ) {
            loaderWindow.close({
                duration  : 350,
                opacity   : 0,
                transform : Ti.UI.create2DMatrix().scale(0.4)
            });
        }

        if ( OS_ANDROID ) {
            loaderWindow.close({
                activityExitAnimation: Titanium.App.Android.R.anim.shrink_fade_out_center
            });
        }

        APP.Loader = null;
    },

    log: function(value, title) {
        var base = 50;

        if (title !== undefined) {
            var size = title.length;
            Ti.API.error(Array(base/2).join("x") + " " + title + " " + Array(base/2).join("x"));
            Ti.API.error(typeof(value) == "object" ? JSON.stringify(value) : value);
            Ti.API.error(Array(base + size + 2).join("x") + "\n\n");

        } else {
            Ti.API.error(Array(base).join("x"));
            Ti.API.error(typeof(value) == "object" ? JSON.stringify(value) : value);
            Ti.API.error(Array(base).join("x"));
        }
    }

};

module.exports = APP;
