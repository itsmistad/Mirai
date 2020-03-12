/*
 * notify.js
 * 
 * This script contains a handler for both push notifications and on-screen notifications.
 */

var notify = new function() {

    var obj = {}, stack = [], audio = [], stackQueue = [], centerQueue = [];
    var idPrefix = 'notify-popup-';
    var popupElement = options =>
        `<div id="${options.id}" class="${options.class}" style="display:none;">
    <div class="close">X</div>
    <div class="header">${options.header}</div>
    <div class="subheader">${options.subheader}</div>
    <div class="body">${options.body}</div>
    <div class="buttons"></div>
</div>
`;
    var defaultNotificationLayer = 2000;
    var defaultOverlayLayer = 1999;
    var defaultOptions = {
        // These shouldn't be touched... usually
        targetSelector: 'body', // What element selector to use when adding the notification using the "targetMethod"
        targetMethod: 'append', // How to add the notification to the "targetSelector" ('prepend', 'append', 'before', and 'after')
        class: 'notify-popup', // The string list of style classes for the element's class attribute
        header: '', // The html header of the notification ('' = disabled and hidden)
        subheader: '', // The html subheader of the notification ('' = disabled and hidden)
        body: '', // The html body of the notification ('' = disabled and hidden)
        closeButton: true, // Toggles the close button
        timeout: 0, // How long (in ms) until the notification closes (0 = disabled)
        fadeOutDuration: 400, // How long (in ms) does the fade out animation last
        fadeInDuration: 800, // How long (in ms) does the fade in animation last
        layer: defaultNotificationLayer, // The z-index layer of the notification
        onStartClose: () => { }, // The event that gets called when the notification starts closing 
        onClose: () => { }, // The event that gets called when the notification is fully closed
        queue: false, // Toggles handling FIFO notification queues by sliding down the notifications after an older sibling is closed
        maxInQueue: 4, // The maximum amount of notifications that can be added to the stack at once when "queue" is true
        sound: 'default', // The sound name that was specified with "notify.initSound(name, file)"
        buttons: [
            {
                text: 'OK',
                class: '', // The string list of style classes for the element's class attribute
                action: button => { }, // The event that gets called when the button is clicked
                close: true // Toggles whether the button closes the notification when clicked
            }
        ]
    };

    obj.initSound = (name, file) => {
        audio.push({
            name,
            audio: new Audio(file)
        });
    };

    // Initializes a connection to the socket.io server
    obj.initNetwork = () => {
        if (network)
            return network.on('notify.me', json => obj.me(json, null, true));
        return null;
    };

    // Enables or disables the notification background overlay.
    obj.overlay = (enable, delay, opacity) => {
        var overlayId = 'notify-overlay';
        var currentOverlay = $('body').find('#' + overlayId);
        if (currentOverlay.length && !enable) {
            if (!delay) delay = defaultOptions.fadeOutDuration;
            currentOverlay.fadeOut(delay, () => {
                currentOverlay.remove();
            });
        } else if (!currentOverlay.length && enable) {
            $('body').append(`<div id="${overlayId}" style="display:none;"></div>`);
            currentOverlay = $('#' + overlayId);
            if (!opacity) opacity = 0.3;
            currentOverlay.css({
                position: 'absolute',
                left: '0',
                top: '0 ',
                height: $(document).height() + 'px',
                width: $(window).width() + 'px',
                'background-color': `rgba(0,0,0,${opacity})`,
                'z-index': defaultOverlayLayer
            });
            if (!delay) delay = defaultOptions.fadeInDuration;
            currentOverlay.fadeIn(delay);
        }
    };

    /*
     * Creates a new notification pop-up.
     * Calls "callback" with the following properties in "object":  
     * - id // The id of the notification element
     * - $ // The jQuery object of the element
     * - options // The original options notify.me was called with
     * - close() // Closes the notification
     * 
     * ignoreFunctions is for network use only. Setting this to true will ignore any JS functions passed from the network (prevents JS injection).
     */
    obj.me = (options, callback, ignoreFunctions) => {
        var idSuffix = Math.ceil(Math.random() * 99999);
        var mergedOptions = { ...defaultOptions, ...options };
        for (const [key, value] of Object.entries(defaultOptions)) {
            // If the new option is null/undefined or if the new option is not the same type as the default, override with the default.
            if (mergedOptions[key] == null || typeof mergedOptions[key] !== typeof defaultOptions[key])
                mergedOptions[key] = defaultOptions[key];
        }

        var id = idPrefix + idSuffix;
        if (mergedOptions.queue) {
            mergedOptions.targetSelector = '#notify-queue';
            mergedOptions.targetMethod = 'prepend';
            mergedOptions.class = mergedOptions.class + ' corner';
        }
        var target = $(mergedOptions.targetSelector);

        if (mergedOptions.queue && stack.filter(_ => _.targetSelector === '#notify-queue').length >= mergedOptions.maxInQueue){
            stackQueue.push({
                options, callback, ignoreFunctions
            });
            return;
        }

        if (target.length) {
            var elementOptions = {
                id,
                class: mergedOptions.class,
                header: mergedOptions.header,
                subheader: mergedOptions.subheader,
                body: mergedOptions.body
            };
            var element = popupElement(elementOptions);
            switch (mergedOptions.targetMethod) {
                case 'prepend':
                    target.prepend(element);
                    break;
                case 'before':
                    target.before(element);
                    break;
                case 'after':
                    target.after(element);
                    break;
                case 'append':
                default:
                    target.append(element);
                    break;
            }

            var ret = new function () {
                var result = {};

                result.id = id;
                result.$ = $('#' + id);
                result.options = mergedOptions;
                result.close = () => {
                    var stackItem;
                    if (mergedOptions.timeoutHandle)
                        clearTimeout(mergedOptions.timeoutHandle);
                    if (!ignoreFunctions)
                        mergedOptions.onStartClose();
                    if (mergedOptions.queue && stack.length) {
                        stackItem = stack.findIndex(_ => _.notification.id === result.id);
                        var wait = true;
                        for (var item of stack.filter(_ => _.targetSelector === '#notify-queue')) {
                            var n = item.notification;
                            if (n.id === result.id) {
                                wait = false;
                                stack.splice(stackItem ? stackItem : 0, 1);
                                continue;
                            } else if (!wait) {
                                n._triggerStackSlide(result.$.outerHeight(true));
                            }
                        }
                        var first = stack.find(_ => _.targetSelector === '#notify-queue' && _.notification.options.timeout > 0);
                        if (first) {
                            var firstNotification = first.notification;
                            firstNotification.options.timeoutHandle = setTimeout(firstNotification.close, firstNotification.options.timeout);
                        }
                    } else if (!mergedOptions.queue) {
                        centerQueue.pop();  
                        if (!centerQueue.length) {
                            obj.overlay(false, mergedOptions.fadeOutDuration, 0.3);
                        }
                    }
                    result.$.fadeOut(mergedOptions.fadeOutDuration, function () {
                        $(this).remove();
                        if (!ignoreFunctions)
                            mergedOptions.onClose();
                        if (mergedOptions.queue && stackQueue.length > 0) {
                            var notification = stackQueue.pop();
                            obj.me(notification.options, notification.callback, notification.ignoreFunctions);
                        }
                    });
                };

                result._currentAnimation = null;
                result._currentDistance = 0;
                result._totalDistance = 0;
                result._triggerStackSlide = targetDistance => {
                    result._totalDistance += targetDistance;
                    var translation = result._totalDistance;
                    if (result._currentAnimation)
                        result._currentAnimation.stop();
                    result._currentAnimation = $({ translation: result._currentDistance });
                    result._currentAnimation.animate({
                            translation
                        },
                        {
                            duration: result.options.fadeOutDuration,
                            easing: 'swing',
                            step: function() {
                                result.$.css('transform', `translateY(${this.translation}px)`);
                                result._currentDistance = this.translation;
                            },
                            complete: function () {
                                result.$.css('transform', 'none');
                                result._currentAnimation = null;
                                result._currentDistance = 0;
                                result._totalDistance = 0;
                            }
                        });
                };

                return result;
            };

            if (mergedOptions.queue) 
                stack.push({
                    targetSelector: '#notify-queue',
                    notification: ret
                });

            var jQ = ret.$;
            jQ.css('z-index', mergedOptions.layer);
            if (elementOptions.header === '')
                jQ.find('.header').hide();
            if (elementOptions.subheader === '')
                jQ.find('.subheader').hide();
            if (elementOptions.body === '')
                jQ.find('.body').hide();

            var buttonsElement = jQ.find('.buttons');
            if (buttonsElement.length) {
                mergedOptions.buttons.forEach(_ => {
                    var buttonId = idPrefix + 'button-' + Math.ceil(Math.random() * 99999);
                    buttonsElement.append(`<button id="${buttonId}" class="${_.class}">${_.text}</button>`);
                    $('#' + buttonId).click(function () {
                        if (!ignoreFunctions)
                            _.action($(this));
                        if (_.close)
                            ret.close();
                    });
                });
            }
            if (!mergedOptions.closeButton)
                jQ.find('.close').hide();
            jQ.find('.close').click(function () {
                ret.close();
            });

            if (mergedOptions.sound) {
                var sound = audio.find(_ => _.name === mergedOptions.sound).audio.play();
                if (sound !== undefined) {
                    sound.then(_ => {
                        // Do... nothing?
                    }).catch(err => {
                        console.error(`😞 notify.js failed to play the "${mergedOptions.sound}" sound because the user hasn't interacted with the page yet.`);
                    });
                }
            }
            jQ.fadeIn(mergedOptions.fadeInDuration, () => {
                if (mergedOptions.timeout > 0 && (!mergedOptions.queue || stack.filter(_ => _.notification.options.timeout > 0)[0].notification.id === ret.id))
                    mergedOptions.timeoutHandle = setTimeout(ret.close, mergedOptions.timeout);
            });

            if (!mergedOptions.queue) {
                if (!centerQueue.length) {
                    obj.overlay(true, mergedOptions.fadeInDuration, 0.3);
                }
                centerQueue.push({
                    ret
                });
            }

            if (callback) callback(ret);
            return;
        }

        console.error(`Failed to create a notification. Bad selector: ${mergedOptions.targetSelector}`);
    };

    return obj;
}