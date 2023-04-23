(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Logger"] = factory();
	else
		root["Logger"] = factory();
})(this, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(1);

/***/ }),
/* 1 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
 * Copyright (c) 2022 Michael Ko. All Rights Reserved.
 */



var Level = __webpack_require__(2);

function expectFunction(val) {
    if (typeof val !== "function") {
        throw new TypeError("Expected a function, but found: ", val);
    }
    return val;
}

var CONSOLE_LOG_FUNCTIONS = {
    ALL: console.log,
    TRACE: console.trace,
    DEBUG: console.debug,
    INFO: console.info,
    WARN: console.warn,
    ERROR: console.error,
    FATAL: console.error
};

/**
 * A <code>Logger</code> object is used to log messages. 
 * A log level can be specified to allow only messages that is equal to or above the minimum severity level 
 * and additionally filters can be added to further narrow down to specific messages.
 * Messages that meet the level requirement and pass the filters will be forwarded to registered handlers to be processed. 
 * Additionally a formatter can be added to format a message before forwarding it to the handlers.
 * 
 * When the constructor is used:
 * - With no argument, it creates a new instance with default constructor options.
 * - With a plain object argument, it creates a new instance with the specified constructor options.
 * - With a Logger instance, it creates a copy of the instance.
 * - As a function, Logger(value) converts the argument to a Logger instance. 
 * If the value is already a Logger, it returns the instance.
 * 
 * Log levels
 * - OFF:   0   ("off")
 * - ALL:   1   ("all")
 * - TRACE: 100 ("trace")
 * - DEBUG: 200 ("debug")
 * - INFO:  300 ("info")
 * - WARN:  400 ("warn")
 * - ERROR: 500 ("error")
 * - FATAL: 600 ("fatal")
 * @param {(Object|Logger)} [arg] constructor options or an instance of logger to copy.
 * @param {string} [arg.name] The name of the Logger.
 * @param {(number|string)} [arg.level] The minimum severity level to log.
 * @param {Function[]} [arg.filters] Message filters.
 * @param {Function[]} [arg.handlers] Message handlers.
 * @param {Function} [arg.formatter] Message formatter.
 * @author Michael Ko (koyote130708@gmail.com)
 * @version 1.0.0
 */
function Logger(arg) {
    if (this instanceof Logger) {
        arg = arg != null ? arg : {};
        if (arg != null && arg.constructor === Object) {
            this._name = null;
            this._level = Level.ALL;
            this._filters = [];
            this._handlers = [];
            this._formatter = null;

            if (arg.name != null) {
                this.setName(arg.name);
            }

            if (arg.level !== undefined) {
                this.setLevel(arg.level);
            }

            if (arg.filters != null) {
                for (var i = 0; i < arg.filters.length; i++) {
                    this.addFilter(arg.filters[i]);
                }
            }

            if (arg.handlers != null) {
                for (var i = 0; i < arg.handlers.length; i++) {
                    this.addHandler(arg.handlers[i]);
                }
            }

            if (arg.formatter != null) {
                this.setFormatter(arg.formatter);
            }
        } else if (arg instanceof Logger) {
            var other = arg;
            this._name = other.getName();
            this._level = other.getLevel();
            this._filters = other.getAllFilters().slice();
            this._handlers = other.getAllHandlers().slice();
            this._formatter = other.getFormatter();
        } else {
            throw new TypeError("Expected a plain object or an instance of Logger, but found: " + arg);
        }
    } else {
        if (arg instanceof Logger) {
            return arg;
        }
        return new Logger(arg);
    }
}

Object.assign(Logger.prototype, {
    /**
     * Returns the name of this Logger.
     * @returns {string} The name of this Logger.
     * @since 1.0.0
     */
    getName: function () {
        return this._name;
    },
    /**
     * Sets the name of this Logger.
     * @param {string} name The new name.
     * @returns {Logger} This Logger instance.
     * @since 1.0.0
     */
    setName: function (name) {
        this._name = name != null ? String(name) : null;
        return this;
    },
    /**
     * Returns the log level specified for this Logger.
     * @returns {Level} The log level.
     * @since 1.0.0
     */
    getLevel: function () {
        return this._level;
    },
    /**
     * Sets the minimum severity level that is allowed to be logged by this Logger. 
     * Only messages with a severity level equal to or higher than the specified level will be logged 
     * and if the log level is set to Level.OFF, no messages will be logged.
     * @param {Level} level The log level.
     * @returns {Logger} This Logger instance.
     * @example 
     * // log all messages
     * logger.setLevel(Level.ALL);
     * 
     * // log only messages with a severity level equal to Level.INFO or higher. 
     * logger.setLevel(Level.INFO);
     * 
     * // turn off logging
     * logger.setLevel(Level.OFF);
     * @since 1.0.0
     */
    setLevel: function (level) {
        this._level = Level.get(level) || Level(level);
        return this;
    },
    /**
     * Returns all of the message filters attached to this Logger.
     * @returns {Function[]} The filter functions in a new array.
     * @since 1.0.0
     */
    getAllFilters: function () {
        return this._filters.slice();
    },
    /**
     * Adds a message filter which tests if a message should be forwarded to the handlers. 
     * A truthy value must be returned from all the filters attached in order 
     * for the message to be forwarded to the handlers for processing.
     * @param {messageCallback} filter The filter function to add.
     * @returns {Logger} This Logger instance.
     * @example
     * // add a filter that only accepts string messages.
     * logger.addFilter((level, msg) => {
     *      return typeof msg === "string";
     * });
     * 
     * // add a filter that accepts if the second message parameter is defined.
     * logger.addFilter((level, msg, msg2) => {
     *      return typeof msg2 != null;
     * });
     * @since 1.0.0
     */
    addFilter: function (filter) {
        this._filters.push(expectFunction(filter));
        return this;
    },
    /**
     * Removes a message filter from this Logger.
     * @param {Function} filter The filter function to remove.
     * @returns {Logger} This Logger instance.
     * @since 1.0.0
     */
    removeFilter: function (filter) {
        var index = this._filters.indexOf(filter);
        if (index >= 0) {
            this._filters.splice(index, 1);
        }
        return this;
    },
    /**
     * Removes all message filters from this Logger.
     * @returns {Logger} This Logger instance.
     * @since 1.0.0
     */
    clearFilters: function () {
        this._filters = [];
        return this;
    },
    /**
     * Returns all of the log handlers attached to this Logger.
     * @returns {Function[]} The handler functions in a new array.
     * @since 1.0.0
     */
    getAllHandlers: function () {
        return this._handlers.slice();
    },
    /**
     * Adds a message handler which will process messages that meet both the minimum severity level and filters.
     * @param {messageCallback} handler The handler function to add.
     * @returns {Logger} This Logger instance.
     * @example
     * // log messages to the console.
     * logger.addHandler((level, msg) => {
     *      console.log(level.name, msg);
     * });
     * @since 1.0.0
     */
    addHandler: function (handler) {
        this._handlers.push(expectFunction(handler));
        return this;
    },
    /**
     * Removes a message handler from this Logger.
     * @param {Function} handler The handler function to remove.
     * @returns {Logger} This Logger instance.
     * @since 1.0.0
     */
    removeHandler: function (handler) {
        var index = this._handlers.indexOf(handler);
        if (index >= 0) {
            this._handlers.splice(index, 1);
        }
        return this;
    },
    /**
     * Removes all message handlers from this Logger.
     * @returns {Logger} This Logger instance.
     * @since 1.0.0
     */
    clearHandlers: function () {
        this._handlers = [];
        return this;
    },
    /**
     * Returns the current message formatter.
     * @returns {Function} The formatter function if specified; null otherwise.
     * @since 1.0.0
     */
    getFormatter: function () {
        return this._formatter || null;
    },
    /**
     * Sets a message formatter to format accepted messages before forwarding to the handlers.
     * @param {messageCallback} formatter The formatter function to use to format messages.
     * @returns {Logger} This Logger instance.
     * @example 
     * // put a timestamp in the message.
     * logger.setFormatter((level, msg) => {
     *      return new Date().toISOString() + ":" + msg;
     * });
     * @since 1.0.0
     */
    setFormatter: function (formatter) {
        this._formatter = formatter != null ? expectFunction(formatter) : null;
        return this;
    },
    /**
     * Logs a message with the specified level and the message parameters.
     * If the message meets the minimum log level and filter requirements, it will be forwarded to the handlers. 
     * Additionally, if a formatter is set, the message will be formatted before being passed to the handlers.
     * @param {(number|string|Level)} level The message level.
     * @param {...*} msg The message parameters.
     * @returns {Logger} <code>true</code> if the message is logged, <code>false</code> otherwise.
     * @since 1.0.0
     */
    log: function (level, msg) {
        if (!level || this._level.value === Level.OFF.value) {
            return false;
        }

        var levelObj = Level.get(level) || Level(level);

        if (!levelObj.value || this._level.value > levelObj.value) {
            return false;
        }

        var args = Array.prototype.slice.call(arguments, 1);
        args.unshift(levelObj);

        for (var i = 0; i < this._filters.length; i++) {
            if (!this._filters[i].apply(this, args.slice())) {
                return false;
            }
        }

        if (this._formatter != null) {
            var formatted = this._formatter.apply(this, args.slice());
            if (formatted !== undefined) {
                formatted = formatted instanceof Array ? formatted : [formatted];
                formatted.unshift(levelObj);
                args = formatted;
            }
        }

        for (var i = 0; i < this._handlers.length; i++) {
            this._handlers[i].apply(this, args.slice());
        }
        return this._handlers.length > 0;
    },
    /**
     * Logs a message with the <code>Level.TRACE</code> level and the message parameters.
     * If the message meets the minimum log level and filter requirements, it will be forwarded to the handlers. 
     * Additionally, if a formatter is set, the message will be formatted before being passed to the handlers.
     * This is same as calling <code>log(Level.TRACE, msg)</code>
     * @param {...*} msg The message parameters.
     * @returns {Logger} This Logger instance.
     * @example
     * trace("data");
     * @since 1.0.0
     */
    trace: function (msg) {
        return this.log.apply(this, [Level.TRACE].concat(Array.prototype.slice.call(arguments)));
    },
    /**
     * Logs a message with the <code>Level.DEBUG</code> level and the message parameters.
     * If the message meets the minimum log level and filter requirements, it will be forwarded to the handlers. 
     * Additionally, if a formatter is set, the message will be formatted before being passed to the handlers.
     * This is same as calling <code>log(Level.DEBUG, msg)</code>
     * @param {...*} msg The message parameters.
     * @returns {Logger} This Logger instance.
     * @since 1.0.0
     */
    debug: function (msg) {
        return this.log.apply(this, [Level.DEBUG].concat(Array.prototype.slice.call(arguments)));
    },
    /**
     * Logs a message with the <code>Level.INFO</code> level and the message parameters.
     * If the message meets the minimum log level and filter requirements, it will be forwarded to the handlers. 
     * Additionally, if a formatter is set, the message will be formatted before being passed to the handlers.
     * This is same as calling <code>log(Level.INFO, msg)</code>
     * @param {...*} msg The message parameters.
     * @returns {Logger} This Logger instance.
     * @since 1.0.0
     */
    info: function (msg) {
        return this.log.apply(this, [Level.INFO].concat(Array.prototype.slice.call(arguments)));
    },
    /**
     * Logs a message with the <code>Level.WARN</code> level and the message parameters.
     * If the message meets the minimum log level and filter requirements, it will be forwarded to the handlers. 
     * Additionally, if a formatter is set, the message will be formatted before being passed to the handlers.
     * This is same as calling <code>log(Level.WARN, msg)</code>
     * @param {...*} msg The message parameters.
     * @returns {Logger} This Logger instance.
     * @since 1.0.0
     */
    warn: function (msg) {
        return this.log.apply(this, [Level.WARN].concat(Array.prototype.slice.call(arguments)));
    },
    /**
     * Logs a message with the <code>Level.ERROR</code> level and the message parameters.
     * If the message meets the minimum log level and filter requirements, it will be forwarded to the handlers. 
     * Additionally, if a formatter is set, the message will be formatted before being passed to the handlers.
     * This is same as calling <code>log(Level.ERROR, msg)</code>
     * @param {...*} msg The message parameters.
     * @returns {Logger} This Logger instance.
     * @since 1.0.0
     */
    error: function (msg) {
        return this.log.apply(this, [Level.ERROR].concat(Array.prototype.slice.call(arguments)));
    },
    /**
     * Logs a message with the <code>Level.FATAL</code> level and the message parameters.
     * If the message meets the minimum log level and filter requirements, it will be forwarded to the handlers. 
     * Additionally, if a formatter is set, the message will be formatted before being passed to the handlers.
     * This is same as calling <code>log(Level.FATAL, msg)</code>
     * @param {...*} msg The message parameters.
     * @returns {Logger} This Logger instance.
     * @since 1.0.0
     */
    fatal: function (msg) {
        return this.log.apply(this, [Level.FATAL].concat(Array.prototype.slice.call(arguments)));
    }
});


var DEFAULT_LOGGER = new Logger({name: "default"});

DEFAULT_LOGGER.addHandler(function (level) {
    var levelName = level.name != null ? level.name.toUpperCase() : null;
    var logFn = CONSOLE_LOG_FUNCTIONS[levelName] || CONSOLE_LOG_FUNCTIONS.ALL;

    if (logFn) {
        var args = Array.prototype.slice.call(arguments, 1);
        args.unshift(level);
        logFn.apply(this, args);
    }
});

/**
 * The default Logger instance.
 * @since 1.0.0
 * @static
 */
Logger.DEFAULT = DEFAULT_LOGGER;
Logger.Level = Level;

/**
 * @callback messageCallback
 * @param {Level} level The severity level of the message.
 * @param {...*} msg The message parameters.
 */

module.exports = Logger;

/***/ }),
/* 2 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
 * Copyright (c) 2022 Michael Ko. All Rights Reserved.
 */



var Constant = __webpack_require__(3);

/**
 * The <code>Level</code> class defines the standard logging levels that can be used to control logging output. 
 * - OFF:   0   ("off")
 * - ALL:   1   ("all")
 * - TRACE: 100 ("trace")
 * - DEBUG: 200 ("debug")
 * - INFO:  300 ("info")
 * - WARN:  400 ("warn")
 * - ERROR: 500 ("error")
 * - FATAL: 600 ("fatal")
 * @since 1.0.0
 * @static
 */
var Level = Constant.newType("Level", ["value", "name"], {
    valueOf: "value"
});

Level.OFF = Level(0, "off");
Level.ALL = Level(1, "all");
Level.TRACE = Level(100, "trace");
Level.DEBUG = Level(200, "debug");
Level.INFO = Level(300, "info");
Level.WARN = Level(400, "warn");
Level.ERROR = Level(500, "error");
Level.FATAL = Level(600, "fatal");

Level.values = [Level.OFF, Level.ALL, Level.TRACE, Level.DEBUG, Level.INFO, Level.WARN, Level.ERROR, Level.FATAL];

/**
 * Returns a <code>Level</code> object by the name or value. If no match is found in the <code>Level.values</code>, undefined is returned.
 * @param {(string|number)} nameOrValue The name or the value of the <code>Level</code> object to get.
 * @returns {Level} The <code>Level</code> object that has the name or the value if found; undefined otherwise.
 * @since 1.0.0
 * @static
 */
Level.get = function (nameOrValue) {
    if (typeof nameOrValue === "string") {
        for (var i = 0; i < Level.values.length; i++) {
            var entry = Level.values[i];
            if (entry.name === nameOrValue) {
                return entry;
            }
        }

    } else if (typeof nameOrValue === "number") {
        for (var i = 0; i < Level.values.length; i++) {
            var entry = Level.values[i];
            if (entry.value === nameOrValue) {
                return entry;
            }
        }
    } else {
        for (var i = 0; i < Level.values.length; i++) {
            var entry = Level.values[i];
            if (entry === nameOrValue) {
                return entry;
            }
        }
    }
    return undefined;
};

/**
 * Returns a <code>Level</code> object that is one level below the specified level. If no match is found in the <code>Level.values</code>, undefined is returned.
 * @param {(string|number|Level)} nameOrValue - The name or value of the level to find the one level below.
 * @returns {(Level|undefined)} - The <code>Level</code> object that is one level below the specified level if found; undefined otherwise.
 * @since 1.0.0
 * @static
 */
Level.below = function (nameOrValue) {
    var levelValue = typeof nameOrValue === "number" ? nameOrValue : Level.get(nameOrValue).value;

    if (levelValue != null) {
        for (var i = Level.values.length - 1; i >= 0; i--) {
            if (Level.values[i] != null && Level.values[i].value < levelValue) {
                return Level.values[i];
            }
        }
    }
    return undefined;
};

/**
 * Returns a <code>Level</code> object that is one level above the specified level. If no match is found in the <code>Level.values</code>, undefined is returned.
 * @param {(string|number|Level)} nameOrValue - The name or value of the level to find the one level above.
 * @returns {(Level|undefined)} - The <code>Level</code> object that is one level above the specified level if found; undefined otherwise.
 * @since 1.0.0
 * @static
 */
Level.above = function (nameOrValue) {
    var levelValue = typeof nameOrValue === "number" ? nameOrValue : Level.get(nameOrValue).value;

    if (levelValue != null) {
        for (var i = 0; i < Level.values.length; i++) {
            if (Level.values[i] != null && Level.values[i].value > levelValue) {
                return Level.values[i];
            }
        }
    }
    return undefined;
};

module.exports = Level;

/***/ }),
/* 3 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(4);

/***/ }),
/* 4 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var newType = __webpack_require__(5);

/**
 * Creates a wrapper object which has constant value and name properties.
 * @param {*} value The value of the constant.
 * @param {string} name The name of the constant.
 * @example 
 * const RED = Constant("#FF0000", "Red");
 * 
 * console.log(RED.value);          // => "#FF0000"
 * console.log(RED.valueOf());      // => "#FF0000"
 * console.log(RED.name);           // => "Red"
 * @since 1.0.0
 */
var Constant = newType("Constant", ["value", "name"], {
    validate: function (value, name) {
        return [value, name != null ? String(name) : null];
    },
    valueOf: "value"
});


Constant.newType = newType;

module.exports = Constant;


/***/ }),
/* 5 */
/***/ ((module) => {

/**
 * Creates a new constant type constructor.
 * @param {string} name The name of the constructor.
 * @param {string[]} propNames The names of the constructor parameters which will be constant properties.
 * @param {Object} [options] Constructor options.
 * @param {function} [options.validate] The constructor parameter validator.
 * @param {(function|string)} [options.valueOf] The name of the property to return as the value of the instance or the function to use to return the value of the instance.
 * @param {boolean} [options.saveInstances] Whether to save instances or not. The instances are saved in an array, <code>{ConstantType}.instances</code>.
 * @return {function} The new constant type constructor.
 * @example
 * const Day = Constant.newType("Day", ["dayOfWeek", "name", "shortName"], { 
 *    valueOf: "dayOfWeek", 
 *    saveInstances: true 
 * });
 * 
 * const MONDAY = Day(1, "Monday", "Mon");
 * 
 * console.log(MONDAY.dayOfWeek);   // => 1
 * console.log(MONDAY.valueOf());   // => 1
 * console.log(MONDAY.name);        // => "Monday"
 * console.log(MONDAY.shortName);   // => "Mon"
 * console.log(Day.instances);      // [ Day { dayOfWeek: 1, name: "Monday", shortName: "Mon" } ]
 * @static
 * @since 1.1.0
 */
function newType(name, propNames, options) {
    if (options && options.validate != null && typeof options.validate !== "function") {
        throw new TypeError("Expected a function for validate, but found: ", options.validate);
    }


    var ConstantType = function (arg) {

        if (this instanceof ConstantType) {
            var args;

            if (options && options.validate != null) {
                args = options.validate.apply(this, arguments);
            }

            args = args === undefined ? arguments : args;


            if (propNames != null) {
                for (var i = 0; i < propNames.length; i++) {
                    Object.defineProperty(this, propNames[i], {
                        enumerable: true,
                        configurable: false,
                        writable: false,
                        value: args[i]
                    });
                }
            }

            if (options && options.saveInstances) {
                ConstantType.instances.push(this);
            }

        } else {
            if (arg instanceof ConstantType) {
                return arg;
            }
            return new ConstantType(...arguments);
        }
    };

    if (options && options.saveInstances) {
        Object.defineProperty(ConstantType, "instances", {
            enumerable: true,
            configurable: false,
            writable: false,
            value: []
        });
    }

    if (options) {
        if (typeof options.valueOf === "string") {
            ConstantType.prototype.valueOf = function () {
                return this[options.valueOf];
            };
        } else if (typeof options.valueOf === "function") {
            ConstantType.prototype.valueOf = options.valueOf;
        }
    }


    if (name != null) {
        Object.defineProperty(ConstantType, "name", {
            configurable: false,
            writable: false,
            value: name
        });
    }

    return ConstantType;
}


module.exports = newType;

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module used 'module' so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(0);
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});