"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class VirtualKeyboardJs {
    constructor() {
        this.init();
    }
    init(callback, forceLoad) {
        var _a;
        var head = (_a = document.getElementsByTagName('head')) === null || _a === void 0 ? void 0 : _a[0];
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = "https://code.jquery.com/jquery-3.7.1.min.js";
        script.id = 'aigens-script-jquryid';
        const hasJs = document.getElementById('aigens-script-jquryid');
        script.onload = () => {
            window['ajQury'] = window['$'];
            this.runAction(window['$']);
            callback && callback(window['$']);
        };
        var style = document.createElement('style');
        style.id = 'aigens-style-keyboard-css-id';
        const hasStyle = document.getElementById('aigens-style-keyboard-css-id');
        style.textContent = `
            .virtual-keyboard{display:inline-block;background:#fff;font-family:Arial,Helvetica Neue,Helvetica,sans-serif;user-select:none;white-space:nowrap;border-radius:.3rem}.virtual-keyboard .layout{display:none;flex-direction:row}.virtual-keyboard .layout .kb-column{display:flex;flex-direction:column;flex:1 1 auto}.virtual-keyboard .layout.active{display:flex}.virtual-keyboard .kb-row{white-space:nowrap}.virtual-keyboard .key{display:inline-block;vertical-align:bottom;text-align:center;margin:.2rem;padding:.3rem .7rem;line-height:1.3rem;cursor:pointer;user-select:none;border:1px solid #d3d3d3;border-radius:.3rem;color:grey;white-space:nowrap;min-width:1rem}.virtual-keyboard .key.spacer{background:transparent;border:none;min-width:unset}.virtual-keyboard .key.sizer{min-width:unset}.virtual-keyboard .key.fill{flex:1 1 auto}.virtual-keyboard .key:active{background-color:#d3d3d3}.virtual-keyboard .kb-row{display:flex;justify-content:center}.virtual-keyboard .key.space{flex:unset;width:20rem}.virtual-keyboard .key.space.fill{flex:1 1 auto;width:unset}.virtual-keyboard.theme-black{background:#1b1b1b;font-family:Arial,Helvetica Neue,Helvetica,sans-serif;user-select:none;padding:.5rem}.virtual-keyboard.theme-black .key{display:inline-block;vertical-align:bottom;background-color:#383838;background:linear-gradient(#2c2c2c,#414141);border-width:0 0 .2rem;border-style:none none solid;border-radius:.3rem;border-color:#0f0f0f;text-align:center;color:#bbb;box-shadow:0 0 5px 0 #1d1d1d;cursor:pointer;user-select:none}.virtual-keyboard.theme-black .key:active{margin-top:.4rem;border-bottom-width:0;background-color:#0f0f0f;background:linear-gradient(#202020,#353535)}.virtual-keyboard.theme-black .key.spacer{background:transparent;border:none;box-shadow:none}.virtual-keyboard.theme-mac{background:#e2e5e8;font-family:Arial,Helvetica Neue,Helvetica,sans-serif;user-select:none;padding:.5rem}.virtual-keyboard.theme-mac .key{display:inline-block;vertical-align:bottom;background-color:#fafafa;background:linear-gradient(#e8e8e8,#fff);border-width:0 0 .2rem;border-style:none none solid;border-radius:.3rem;border-color:#aaa;text-align:center;color:#aaa;box-shadow:0 0 5px 0 #aaa;cursor:pointer;user-select:none}.virtual-keyboard.theme-mac .key:active{margin-top:.4rem;border-bottom-width:0;background-color:#f5f5f5;background:linear-gradient(#dfd8d8,#f4f4f4)}.virtual-keyboard.theme-mac .key.spacer{background:transparent;border:none;box-shadow:none}
        `;
        if (!hasJs || forceLoad)
            head === null || head === void 0 ? void 0 : head.appendChild(script);
        if (!hasStyle || forceLoad)
            head === null || head === void 0 ? void 0 : head.appendChild(style);
    }
    runAction($) {
        // const ipcRenderer = require('electron').ipcRenderer;
        // const EventEmitter = require('events');
        /**
         * A wrapper over setTimeout to ease clearing and early trigger of the function.
         * @param {function} fn
         * @param {int} timeout
         * @returns {object} Returns an object { clear: <function>, trigger: <function> }
         */
        function delayFn(fn, timeout) {
            var timeoutId = setTimeout(fn, timeout);
            return {
                clear: function () {
                    clearTimeout(timeoutId);
                },
                trigger: function () {
                    clearTimeout(timeoutId);
                    fn();
                }
            };
        }
        /**
         * A wrapper over setInterval to ease clearing and early trigger of the function.
         * @param {function} fn
         * @param {int} interval
         * @returns {object} Returns an object { clear: <function>, trigger: <function> }
         */
        function repeatFn(fn, interval) {
            var repeatId = setInterval(fn, interval);
            return {
                clear: function () {
                    clearInterval(repeatId);
                },
                trigger: function () {
                    clearInterval(repeatId);
                    fn();
                }
            };
        }
        /**
         * Allows calling fn first at one timeout then repeadeatly at a second interval.
         * Used, to mimic keyboard button held down effect.
         * @param {function} fn
         * @param {int} delay
         * @param {int} interval
         * @returns {object} Returns an object { clear: <function>, trigger: <function> }
         */
        function delayThenRepeat(fn, delay, interval) {
            let secondInt = null;
            let firstDelay = null;
            firstDelay = delayFn(() => {
                fn();
                secondInt = repeatFn(fn, interval);
                firstDelay = null;
            }, delay);
            return {
                clear: function () {
                    if (firstDelay) {
                        firstDelay.clear();
                    }
                    if (secondInt) {
                        secondInt.clear();
                    }
                },
                trigger: function () {
                    if (firstDelay) {
                        firstDelay.trigger();
                        firstDelay = null;
                    }
                    if (secondInt) {
                        secondInt.clear();
                        secondInt = null;
                    }
                }
            };
        }
        /**
         * Helper class dedicated to create a keyboard layout(single state)
         */
        class KeyboardLayout {
            constructor($container, name, layout, config) {
                // super();
                this.layout = layout;
                this.$container = $container;
                this.name = name;
                this.config = config;
                this.init();
            }
            init() {
                this.$layoutContainer = $('<div class="layout"></div>');
                this.$layoutContainer.addClass(this.name);
                this.$container.append(this.$layoutContainer);
                if (this.name == 'normal') {
                    this.$layoutContainer.addClass('active');
                }
                // lets loop over layout once first to check if we have column layout
                // this is defined as an array of arrays. Each row containing more than one
                // string defines a new column
                var columnCount = 1;
                for (var i in this.layout) {
                    var layout = this.layout[i];
                    if (layout.constructor == Array) {
                        if (columnCount < layout.length) {
                            columnCount = layout.length;
                        }
                    }
                }
                // build column containers
                for (let i = 0; i < columnCount; i++) {
                    this.$layoutContainer.append('<div class="kb-column"></div>');
                }
                // lets parse through layout lines and build keys
                for (var i in this.layout) {
                    var layout = this.layout[i];
                    if (layout.constructor != Array) {
                        layout = [layout];
                    }
                    for (var col in layout) {
                        var $row = $('<div class="kb-row"></div>');
                        this.$layoutContainer.find('.kb-column').eq(col).append($row);
                        var keys = layout[col].split(/\s+/m);
                        for (var ki in keys) {
                            var key = keys[ki];
                            if (typeof ki != 'function') {
                                let custom = null;
                                var $key = $(this.config.keyTemplate);
                                var text = key.length > 1 ? key.replace(/[\{\}]/gm, '') : key;
                                var parts = (text == ":") ? [":"] : text.split(':');
                                let modifier = { mod: null, applied: [] };
                                if (parts.length > 1) {
                                    text = parts[0];
                                    modifier.mod = parts[1];
                                }
                                $key.text(text);
                                $row.append($key);
                                // test modifiers
                                if ($.fn.keyboard_custom_modifiers && modifier.mod) {
                                    for (var pattern in $.fn.keyboard_custom_modifiers) {
                                        var patternRx = new RegExp(pattern, 'ig');
                                        if (modifier.mod.search(patternRx) > -1) {
                                            $.fn.keyboard_custom_modifiers[pattern](this.keyboard, $key, modifier);
                                        }
                                    }
                                }
                                // test config.customKeys to apply customizations
                                if (this.config.customKeys) {
                                    for (var pattern in this.config.customKeys) {
                                        var patternRx = new RegExp(pattern, 'ig');
                                        if (text.search(patternRx) > -1) {
                                            custom = this.config.customKeys[pattern];
                                            if (custom.render) {
                                                custom.render(this.keyboard, $key, modifier);
                                            }
                                        }
                                    }
                                }
                                if (custom && custom.handler) {
                                    $key.data('kb-key-handler', custom.handler);
                                }
                                $key.data('kb-key', text);
                            }
                        }
                    }
                }
            }
        }
        /**
         * The Virtual Keyboard class holds all behaviour and rendering for our keyboard.
         */
        class VirtualKeyboard {
            constructor($el, config) {
                // super();
                this.$el = $el;
                this.config = Object.assign({
                    individual: false,
                    theme: null,
                    show: false,
                    displayOnFocus: true,
                    container: null,
                    autoPosition: true,
                    layout: 'us-en',
                    keyTemplate: '<span class="key"></span>',
                    customKeys: Object.assign({}, $.fn.keyboard_custom_keys)
                }, config);
                this.inited = false;
                // replace layout key for layout definition lookup on $.fn.keyboard_layouts
                if (typeof this.config.layout === 'string' ||
                    this.config.layout instanceof String) {
                    this.config.layout = $.fn.keyboard_layouts[this.config.layout];
                }
                this._onMouseDown = false;
                this.init();
            }
            /**
             * Initializes our keyboard rendering and event handing.
             */
            init() {
                if (this.inited) {
                    console.warn("Keyboard already initialized...");
                    return;
                }
                var base = this;
                // build a defaut container if we don't get one from client
                // by default we'll just float under the input element
                // otherwise we let the client implement positioning
                if (!this.config.container) {
                    this.$container = $('<div class="virtual-keyboard"></div>');
                    $('body').append(this.$container);
                }
                else if (typeof this.config.container == 'function') {
                    this.$container = this.config.container(this.$el, this);
                    this.$container.addClass('virtual-keyboard');
                }
                if (this.config.theme) {
                    this.$container.addClass(this.config.theme);
                }
                if (this.config.show) {
                    this.$container.show();
                }
                else {
                    this.$container.hide();
                }
                // hook up element focus events
                this.$el
                    .focus(function (e) {
                    if (base._onMouseDown) {
                        return;
                    }
                    base.inputFocus(e.target);
                })
                    .blur(function (e) {
                    if (base._onMouseDown) {
                        e.stopImmediatePropagation();
                        e.preventDefault();
                        return false;
                    }
                    base.inputUnFocus(e.target);
                });
                // hook up mouse press down/up keyboard sims
                this.$container
                    .on("mousedown touchstart", function (e) {
                    if (!base._onMouseDown && $(e.target).data('kb-key')) {
                        base._onMouseDown = true;
                        base.simKeyDown(e.target);
                        e.stopImmediatePropagation();
                        return false;
                    }
                });
                $('body')
                    .on("mouseup touchend", function (e) {
                    if (base._onMouseDown) {
                        base._onMouseDown = false;
                        base.simKeyUp(e.target);
                    }
                });
                // init layout renderer
                // break layouts into separate keyboards, we'll display them according to their
                // define behaviours later.
                this.layout = {};
                for (var k in this.config.layout) {
                    if (typeof this.config.layout[k] != 'function') {
                        this.layout[k] = new KeyboardLayout(this.$container, k, this.config.layout[k], this.config);
                    }
                }
                this.inited = true;
            }
            /**
             * Displays the next layout or wraps back to the first one in the layout list.
             */
            toggleLayout() {
                var $next = this.$container.find('.layout.active').next();
                if ($next.length == 0) {
                    $next = this.$container.find('.layout:first');
                }
                this.$container
                    .find('.layout')
                    .removeClass('active');
                $next.addClass('active');
            }
            /**
             * Displays a layout by name
             * @param {string} name
             */
            showLayout(name) {
                this.$container
                    .find('.layout')
                    .removeClass('active');
                this.$container
                    .find('.layout.' + name)
                    .addClass('active');
            }
            /**
             * Handles sending keyboard key press requests to the main electron process.
             * From there we'll simulate real keyboard key presses(as far as chromium is concerned)
             * @param {string} key
             */
            pressKey(key, el) {
                var _a, _b;
                // ipcRenderer.send("virtual-keyboard-keypress", key);
                (_b = (_a = window === null || window === void 0 ? void 0 : window['aigensElectronAPI']) === null || _a === void 0 ? void 0 : _a.run) === null || _b === void 0 ? void 0 : _b.call(_a, 'virtual-keyboard-keypress', key);
                // callback && callback(key, el);
                const cb = window['electronVirtualKeyboardCallBack'];
                if (cb instanceof Function)
                    cb && cb(key, el);
            }
            /**
             * Handles displaying the keyboard for a certain input element
             * @param {DomElement} el
             */
            show(el) {
                this.$container.show();
                if (this.config.autoPosition && typeof this.config.autoPosition != 'function') {
                    var offset = $('body').offset();
                    // figure out bottom center position of the element
                    var bounds = el.getBoundingClientRect();
                    var position = {
                        x: bounds.left + offset.left,
                        y: bounds.top + offset.top,
                        width: bounds.width,
                        height: bounds.height
                    };
                    var x = position.x + ((position.width - this.$container.width()) / 2);
                    ``;
                    // keep container away from spilling outside window width
                    if ((x + this.$container.width()) > $(window).width()) {
                        x = $(window).width() - this.$container.width();
                    }
                    // but also make sure we don't spil out to the left window edge either(priority)
                    if (x < 0) {
                        x = 0;
                    }
                    this.$container.css({
                        position: 'absolute',
                        top: position.y + position.height,
                        left: x
                    });
                }
                else if (typeof this.config.autoPosition == 'function') {
                    let position = this.config.autoPosition(el, this.$container);
                    this.$container.css({
                        position: 'absolute',
                        top: position.top,
                        left: position.left
                    });
                }
            }
            /**
             * Handles hiding the keyboard.
             * @param {DomElement} el
             */
            hide(el) {
                this.$container.hide();
            }
            /**
             * Event handler for input focus event behaviour
             * @param {DomElement} el
             */
            inputFocus(el) {
                // If we had an unfocus timeout function setup
                // and we are now focused back on an input, lets
                // cancel it and just move the keyboard into position.
                this.currentElement = el;
                if (this.unfocusTimeout) {
                    this.unfocusTimeout.clear();
                    this.unfocusTimeout = null;
                }
                if (this.config.displayOnFocus) {
                    this.show(el);
                }
            }
            /**
             * Event handler for input blur event behaviour
             * @param {DomElement} el
             */
            inputUnFocus(el) {
                // setup a timeout to hide keyboard.
                // if the input was unfocused due to clicking on the keyboard,
                // we'll be able to cancel the delayed function.
                this.unfocusTimeout = delayFn(() => {
                    if (this.config.displayOnFocus) {
                        this.hide(el);
                    }
                    this.unfocusTimeout = null;
                }, 100);
            }
            simKeyDown(el) {
                // handle key clicks by letting them bubble to the parent container
                // from here we'll call our key presses for normal and custom keys
                // to mimic key held down effect we first trigger our key then wait
                // to call the same key on an interval. Mouse Up stops this loop.
                if (this.unfocusTimeout) {
                    this.unfocusTimeout.clear();
                    this.unfocusTimeout = null;
                }
                // reset focus on next loop
                setTimeout(() => {
                    $(this.currentElement).focus();
                }, 1);
                // if we pressed on key, setup interval to mimic repeated key presses
                if ($(el).data('kb-key')) {
                    this.keydown = delayThenRepeat(() => {
                        //$(this.currentElement).focus();
                        var handler = $(el).data('kb-key-handler');
                        var key = $(el).data('kb-key');
                        if (handler) {
                            key = handler(this, $(el));
                        }
                        if (key !== null && key !== undefined) {
                            this.pressKey(key, this.currentElement);
                        }
                    }, 100, 100);
                }
            }
            simKeyUp(el) {
                // Mouse up stops key down effect. Since mousedown always presses the key at
                // least once, this event handler takes care of stoping the rest of the loop.
                if (this.keydown) {
                    this.keydown.trigger();
                    this.keydown = null;
                }
            }
        }
        /**
         * Simple test for $.is() method to test compatible elements against.
         * @param {int} i
         * @param {DomElement} el
         */
        function testSupportedElements(i, el) {
            return $(el).is('input:text') || $(el).is('input:password') || $(el).is('textarea');
        }
        /**
         * Creates a virtual keyboard instance on the provided elements.
         * @param {object} config
         */
        $.fn.keyboard = function (config) {
            var config = Object.assign({}, {
                individual: false
            }, config);
            if (!config && $(this).data('virtual-keyboard')) {
                return $(this).data('virtual-keyboard');
            }
            $(this).each(function () {
                if (!$(this).is(testSupportedElements)) {
                    throw Error("Virtual Keyboard does not support element of type: " + $(this).prop('name'));
                }
            });
            if (!config.individual) {
                var kb = new VirtualKeyboard($(this), config);
                $(this).data('virtual-keyboard', kb);
                return kb;
            }
            else {
                return $(this).each(function () {
                    var kb = new VirtualKeyboard($(this), config);
                    $(this).data('virtual-keyboard', kb);
                });
            }
        };
        $.fn.keyboard_custom_modifiers = {
            '(\\d+|\\*)(%|cm|em|ex|in|mm|pc|pt|px|vh|vw|vmin)?$': function (kb, $key, modifier) {
                var size = modifier.mod;
                if (size == '*') {
                    $key.addClass('fill');
                }
                else {
                    if (size && size.search('[a-z]') == -1) {
                        size += 'rem';
                    }
                    $key.width(size);
                    $key.addClass('sizer');
                }
                modifier.applied.push('size');
            }
        };
        $.fn.keyboard_custom_keys = {
            '^[`0-9~!@#$%^&*()_+\-=]$': {
                render: function (kb, $key) {
                    $key.addClass('digit');
                }
            },
            '^enter$': {
                render: function (kb, $key) {
                    $key.text('\u23ce ' + $key.text());
                    $key.addClass('action enter');
                },
                handler: function (kb, $key) {
                    return '\r';
                }
            },
            '^shift$': {
                render: function (kb, $key) {
                    $key.text('\u21e7 ' + $key.text());
                    $key.addClass('action shift');
                },
                handler: function (kb, $key) {
                    kb.toggleLayout();
                    return null;
                }
            },
            '^numeric$': {
                render: function (kb, $key) {
                    $key.text('123');
                },
                handler: function (kb, $key) {
                    kb.showLayout('numeric');
                }
            },
            '^abc$': {
                handler: function (kb, $key) {
                    kb.showLayout('normal');
                }
            },
            '^symbols$': {
                render: function (kb, $key) {
                    $key.text('#+=');
                },
                handler: function (kb, $key) {
                    kb.showLayout('symbols');
                }
            },
            '^caps$': {
                render: function (kb, $key) {
                    $key.text('\u21e7');
                    $key.addClass('action shift');
                },
                handler: function (kb, $key) {
                    kb.showLayout('shift');
                    return null;
                }
            },
            '^lower$': {
                render: function (kb, $key) {
                    $key.text('\u21e7');
                    $key.addClass('action shift');
                },
                handler: function (kb, $key) {
                    kb.showLayout('normal');
                    return null;
                }
            },
            '^space$': {
                render: function (kb, $key) {
                    $key.addClass('space');
                },
                handler: function (kb, $key) {
                    return ' ';
                }
            },
            '^tab$': {
                render: function (kb, $key) {
                    $key.addClass('action tab');
                },
                handler: function (kb, $key) {
                    return '\t';
                }
            },
            '^backspace$': {
                render: function (kb, $key) {
                    $key.text('  \u21e6  ');
                    $key.addClass('action backspace');
                },
                handler: function (kb, $key) {
                    return '\b';
                }
            },
            '^del(ete)?$': {
                render: function (kb, $key) {
                    $key.addClass('action delete');
                },
                handler: function (kb, $key) {
                    return String.fromCharCode(127);
                }
            },
            '^sp$': {
                render: function (kb, $key, modifier) {
                    $key.empty();
                    $key.addClass('spacer');
                    if (modifier.applied.indexOf('size') < 0) {
                        $key.addClass('fill');
                    }
                },
                handler: function (kb, $key) {
                    return null;
                }
            }
        };
        $.fn.keyboard_layouts = {
            'us-en': {
                'normal': [
                    '{`:*} 1 2 3 4 5 6 7 8 9 0 - = {backspace:*}',
                    '{tab} q w e r t y u i o p [ ] \\',
                    '{sp:2} a s d f g h j k l ; \' {enter}',
                    '{shift:*} z x c v b n m , . / {shift:*}',
                    '{space}'
                ],
                'shift': [
                    '{~:*} ! @ # $ % ^ & * ( ) _ + {backspace:*}',
                    '{tab} Q W E R T Y U I O P { } |',
                    '{sp:2} A S D F G H J K L : " {enter}',
                    '{shift:*} Z X C V B N M < > ? {shift:*}',
                    '{space}'
                ]
            },
            'us-en:with-numpad': {
                'normal': [
                    '` 1 2 3 4 5 6 7 8 9 0 - = {backspace:*}',
                    ['{tab} q w e r t y u i o p [ ] \\', '7 8 9'],
                    ['{sp:2} a s d f g h j k l ; \' {enter}', '4 5 6'],
                    ['{shift:*} z x c v b n m , . / {shift:*}', '1 2 3'],
                    ['{space}', '0']
                ],
                'shift': [
                    '~ ! @ # $ % ^ & * ( ) _ + {backspace:*}',
                    ['{tab} Q W E R T Y U I O P { } |', '7 8 9'],
                    ['{sp:2} A S D F G H J K L : " {enter}', '4 5 6'],
                    ['{shift:*} Z X C V B N M < > ? {shift:*}', '1 2 3'],
                    ['{space}', '0']
                ]
            },
            'us-en:mobile': {
                'normal': [
                    'q w e r t y u i o p',
                    'a s d f g h j k l',
                    '{caps:*} z x c v b n m {backspace:*}',
                    '{numeric} , {space:*} .  {enter}'
                ],
                'shift': [
                    'Q W E R T Y U I O P',
                    'A S D F G H J K L',
                    '{lower:*} Z X C V B N M {backspace:*}',
                    '{numeric} , {space:*} . {enter}'
                ],
                'numeric': [
                    '1 2 3 4 5 6 7 8 9 0',
                    '- / : ; ( ) $ & @ "',
                    '{symbols:*} {sp} . , ? ! \' {sp} {backspace:*}',
                    '{abc} , {space:*} . {enter}'
                ],
                'symbols': [
                    '[ ] { } # % ^ * + =',
                    '_ \ | ~ < >',
                    '{numeric:*} {sp} . , ? ! \' {Sp} {backspace:*}',
                    '{abc} , {space:*} . {enter}'
                ],
            },
            'us-en:mobile-with-numpad': {
                'normal': [
                    ['q w e r t y u i o p', '7 8 9'],
                    ['a s d f g h j k l', '4 5 6'],
                    ['{caps:*} z x c v b n m {backspace:*}', '1 2 3'],
                    ['{numeric} , {space:*} .  {enter}', '0:2']
                ],
                'shift': [
                    ['Q W E R T Y U I O P', '& * ('],
                    ['A S D F G H J K L', '$ % ^'],
                    ['{lower:*} Z X C V B N M {backspace:*}', '! @ #'],
                    ['{numeric} , {space:*} . {enter}', '):2']
                ],
                'numeric': [
                    ['* + = - / : ; $ & @', '7 8 9'],
                    ['[ ] { } ( ) # % ^ "', '4 5 6'],
                    ['{lower:*} _ \\ | ~ ? ! \' {backspace:*}', '1 2 3'],
                    ['{abc} < {space:*} > {enter}', '0:2']
                ]
            }
        };
    }
    setInput(elementClass, containerClass, electronVirtualKeyboardCallBack, config) {
        if (!elementClass) {
            console.warn("missing elementClass");
            return false;
        }
        let ajQury = window['ajQury'];
        const action = () => {
            ajQury = window['ajQury'];
            window['electronVirtualKeyboardCallBack'] = electronVirtualKeyboardCallBack;
            if (!config)
                config = {};
            ajQury(elementClass).keyboard(Object.assign({ individual: true, layout: 'us-en:mobile', 
                // layout: 'us-en:mobile-with-numpad',
                show: false, displayOnFocus: true, autoPosition: true, container: function ($el) {
                    return $el.parent().find(containerClass);
                } }, config));
        };
        if (!ajQury) {
            console.warn("init...");
            this.init(() => {
                action();
            }, true);
            return false;
        }
        action();
        return true;
    }
    isElectron() {
        var _a;
        return !!((_a = window === null || window === void 0 ? void 0 : window['aigensElectronAPI']) === null || _a === void 0 ? void 0 : _a.run);
    }
}
exports.default = VirtualKeyboardJs;
