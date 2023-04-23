/*
 * Copyright (c) 2022 Michael Ko. All Rights Reserved.
 */

"use strict";

var Constant = require("go-constant");

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