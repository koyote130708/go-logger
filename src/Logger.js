/*
 * Copyright (c) 2022 Michael Ko. All Rights Reserved.
 */

"use strict";

var Level = require("./Level");

function expectFunction(val) {
    if (typeof val !== "function") {
        throw new TypeError("Expected a function, but found: ", val);
    }
    return val;
}

var CONSOLE_LOG_FUNCTIONS = {
    all: console.log,
    trace: console.trace,
    debug: console.debug,
    info: console.info,
    warn: console.warn,
    error: console.error,
    fatal: console.error
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
 * @param {(Level|number|string)} [arg.level] The minimum severity level to log.
 * @param {Function[]} [arg.filters] Message filters.
 * @param {Function[]} [arg.handlers] Message handlers.
 * @param {Function} [arg.formatter] Message formatter.
 * @author Michael Ko (koyote130708@gmail.com)
 * @version 1.0.0
 * @namespace Logger
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
     * logger.info("hi"); // => logged
     * logger.info(1);    // => not logged
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
     * // prefix the level name.
     * logger.setFormatter((level, msg) => {
     *      return level.name + ":" + msg;
     * });
     * 
     * logger.info("hello"); // => logs "info:hello"
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
     * @returns {boolean} <code>true</code> if the message is logged, <code>false</code> otherwise.
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
     * @returns {boolean} <code>true</code> if the message is logged, <code>false</code> otherwise.
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
     * @returns {boolean} <code>true</code> if the message is logged, <code>false</code> otherwise.
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
     * @returns {boolean} <code>true</code> if the message is logged, <code>false</code> otherwise.
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
     * @returns {boolean} <code>true</code> if the message is logged, <code>false</code> otherwise.
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
     * @returns {boolean} <code>true</code> if the message is logged, <code>false</code> otherwise.
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
     * @returns {boolean} <code>true</code> if the message is logged, <code>false</code> otherwise.
     * @since 1.0.0
     */
    fatal: function (msg) {
        return this.log.apply(this, [Level.FATAL].concat(Array.prototype.slice.call(arguments)));
    }
});

var DEFAULT;

Object.assign(Logger, {
    /**
     * The default Logger instance.
     * @since 1.0.0
     * @memberof Logger
     * @static
     */
    getDefault: function () {
        if (DEFAULT == null) {
            DEFAULT = new Logger({name: "default"});
        }

        DEFAULT.addHandler(function (level) {
            var levelName = level.name != null ? level.name : null;
            var logFn = CONSOLE_LOG_FUNCTIONS[levelName] || CONSOLE_LOG_FUNCTIONS.all;

            if (logFn) {
                var args = Array.prototype.slice.call(arguments, 1);
                args.unshift(level);
                logFn.apply(this, args);
            }
        });

        return DEFAULT;
    },
    Level: Level,
    /**
     * Calls the <code>getName</code> method on the default <code>Logger</code> instance 
     * with the provided arguments and returns the result.
     * @since 1.0.0
     * @memberof Logger
     * @static
     */
    getName: function () {
        return Logger.prototype.getName.apply(this.getDefault(), arguments);
    },
    /**
     * Calls the <code>setName</code> method on the default <code>Logger</code> instance 
     * with the provided arguments and returns the result.
     * @since 1.0.0
     * @memberof Logger
     * @static
     */
    setName: function () {
        return Logger.prototype.setName.apply(this.getDefault(), arguments);
    },
    /**
     * Calls the <code>getLevel</code> method on the default <code>Logger</code> instance 
     * with the provided arguments and returns the result.
     * @since 1.0.0
     * @memberof Logger
     * @static
     */
    getLevel: function () {
        return Logger.prototype.getLevel.apply(this.getDefault(), arguments);
    },
    /**
     * Calls the <code>setLevel</code> method on the default <code>Logger</code> instance 
     * with the provided arguments and returns the result.
     * @since 1.0.0
     * @memberof Logger
     * @static
     */
    setLevel: function () {
        return Logger.prototype.setLevel.apply(this.getDefault(), arguments);
    },
    /**
     * Calls the <code>getAllFilters</code> method on the default <code>Logger</code> instance 
     * with the provided arguments and returns the result.
     * @since 1.0.0
     * @memberof Logger
     * @static
     */
    getAllFilters: function () {
        return Logger.prototype.getAllFilters.apply(this.getDefault(), arguments);
    },
    /**
     * Calls the <code>addFilter</code> method on the default <code>Logger</code> instance 
     * with the provided arguments and returns the result.
     * @since 1.0.0
     * @memberof Logger
     * @static
     */
    addFilter: function () {
        return Logger.prototype.addFilter.apply(this.getDefault(), arguments);
    },
    /**
     * Calls the <code>removeFilter</code> method on the default <code>Logger</code> instance 
     * with the provided arguments and returns the result.
     * @since 1.0.0
     * @memberof Logger
     * @static
     */
    removeFilter: function () {
        return Logger.prototype.removeFilter.apply(this.getDefault(), arguments);
    },
    /**
     * Calls the <code>clearFilters</code> method on the default <code>Logger</code> instance 
     * with the provided arguments and returns the result.
     * @since 1.0.0
     * @memberof Logger
     * @static
     */
    clearFilters: function () {
        return Logger.prototype.clearFilters.apply(this.getDefault(), arguments);
    },
    /**
     * Calls the <code>getAllHandlers</code> method on the default <code>Logger</code> instance 
     * with the provided arguments and returns the result.
     * @since 1.0.0
     * @memberof Logger
     * @static
     */
    getAllHandlers: function () {
        return Logger.prototype.getAllHandlers.apply(this.getDefault(), arguments);
    },
    /**
     * Calls the <code>addHandler</code> method on the default <code>Logger</code> instance 
     * with the provided arguments and returns the result.
     * @since 1.0.0
     * @memberof Logger
     * @static
     */
    addHandler: function () {
        return Logger.prototype.addHandler.apply(this.getDefault(), arguments);
    },
    /**
     * Calls the <code>removeHandler</code> method on the default <code>Logger</code> instance 
     * with the provided arguments and returns the result.
     * @since 1.0.0
     * @memberof Logger
     * @static
     */
    removeHandler: function () {
        return Logger.prototype.removeHandler.apply(this.getDefault(), arguments);
    },
    /**
     * Calls the <code>clearHandlers</code> method on the default <code>Logger</code> instance 
     * with the provided arguments and returns the result.
     * @since 1.0.0
     * @memberof Logger
     * @static
     */
    clearHandlers: function () {
        return Logger.prototype.clearHandlers.apply(this.getDefault(), arguments);
    },
    /**
     * Calls the <code>getFormatter</code> method on the default <code>Logger</code> instance 
     * with the provided arguments and returns the result.
     * @since 1.0.0
     * @memberof Logger
     * @static
     */
    getFormatter: function () {
        return Logger.prototype.getFormatter.apply(this.getDefault(), arguments);
    },
    /**
     * Calls the <code>setFormatter</code> method on the default <code>Logger</code> instance 
     * with the provided arguments and returns the result.
     * @since 1.0.0
     * @memberof Logger
     * @static
     */
    setFormatter: function () {
        return Logger.prototype.setFormatter.apply(this.getDefault(), arguments);
    },
    /**
     * Calls the <code>log</code> method on the default <code>Logger</code> instance 
     * with the provided arguments and returns the result.
     * @since 1.0.0
     * @memberof Logger
     * @static
     */
    log: function () {
        return Logger.prototype.log.apply(this.getDefault(), arguments);
    },
    /**
     * Calls the <code>trace</code> method on the default <code>Logger</code> instance 
     * with the provided arguments and returns the result.
     * @since 1.0.0
     * @memberof Logger
     * @static
     */
    trace: function () {
        return Logger.prototype.trace.apply(this.getDefault(), arguments);
    },
    /**
     * Calls the <code>debug</code> method on the default <code>Logger</code> instance 
     * with the provided arguments and returns the result.
     * @since 1.0.0
     * @memberof Logger
     * @static
     */
    debug: function () {
        return Logger.prototype.debug.apply(this.getDefault(), arguments);
    },
    /**
     * Calls the <code>info</code> method on the default <code>Logger</code> instance 
     * with the provided arguments and returns the result.
     * @since 1.0.0
     * @memberof Logger
     * @static
     */
    info: function () {
        return Logger.prototype.info.apply(this.getDefault(), arguments);
    },
    /**
     * Calls the <code>warn</code> method on the default <code>Logger</code> instance 
     * with the provided arguments and returns the result.
     * @since 1.0.0
     * @memberof Logger
     * @static
     */
    warn: function () {
        return Logger.prototype.warn.apply(this.getDefault(), arguments);
    },
    /**
     * Calls the <code>error</code> method on the default <code>Logger</code> instance 
     * with the provided arguments and returns the result.
     * @since 1.0.0
     * @memberof Logger
     * @static
     */
    error: function () {
        return Logger.prototype.error.apply(this.getDefault(), arguments);
    },
    /**
     * Calls the <code>fatal</code> method on the default <code>Logger</code> instance 
     * with the provided arguments and returns the result.
     * @since 1.0.0
     * @memberof Logger
     * @static
     */
    fatal: function () {
        return Logger.prototype.fatal.apply(this.getDefault(), arguments);
    }
});


/**
 * @callback messageCallback
 * @param {Level} level The severity level of the message.
 * @param {...*} msg The message parameters.
 */

module.exports = Logger;