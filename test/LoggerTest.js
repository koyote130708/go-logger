/* global AssertionError */
"use strict";

var assert = require("chai").assert;

var Logger = require("../src/Logger");
var Level = Logger.Level;

function clearLogs(logs) {
    for (var k in logs) {
        logs[k].length = 0;
    }
    return logs;
}

function newLogs() {
    return {
        all: [],
        trace: [],
        debug: [],
        info: [],
        warn: [],
        error: [],
        fatal: []
    };
}


function newHandler() {
    var logs = newLogs();

    var handler = function (level, msg) {
        assert(level instanceof Level);

        var params = Array.prototype.slice.call(arguments, 1);

        logs.all.push(params);

        if (level !== Level.ALL) {
            var key = level.name || level.value;
            if (logs[key] == null) {
                logs[key] = [];
            }
            logs[key].push(params);
        }
    };
    handler.logs = logs;
    return handler;
}


suite("Logger", function () {

    var logger0, logger, logs, logs2, data, data1, data2, data3, data4;

    var filter1 = function (level, msg) {
        assert(level instanceof Level);
        return typeof msg === "string";
    };

    var filter2 = function (level, msg, msg2) {
        assert(level instanceof Level);
        return msg.length > 2 || typeof msg2 === "number";
    };

    var formatter = function (level, msg) {
        assert(level instanceof Level);

        var params = Array.prototype.slice.call(arguments, 1);

        var results = params.map(function (value) {
            return level.name + ":" + value;
        });
        return results.length === 1 ? results[0] : results;
    };


    setup(function () {
        logger0 = new Logger();
        logger = null;
        data = null;
        logs = null;

        // only 1 handler
        data1 = {
            arg: {
                name: "logger1",
                level: Level.ALL,
                handlers: [newHandler()]
            }
        };

        data1.logger = new Logger(data1.arg);


        // 1 filter and 1 handler
        data2 = {
            arg: {
                name: "logger2",
                level: Level.DEBUG,
                filters: [filter1],
                handlers: [newHandler()]
            }
        };

        data2.logger = new Logger(data2.arg);


        // 1 filter, 1 handler and 1 formatter
        data3 = {
            arg: {
                name: "logger3",
                level: Level.INFO,
                filters: [filter1],
                handlers: [newHandler()],
                formatter: formatter
            }
        };

        data3.logger = new Logger(data3.arg);


        // 2 filters, 2 handlers and 1 formatter
        data4 = {
            arg: {
                name: "logger4",
                level: Level.WARN,
                filters: [filter1, filter2],
                handlers: [newHandler(), newHandler()],
                formatter: formatter
            }
        };

        data4.logger = new Logger(data4.arg);
    });


    suite("#datasets", function () {

        test("dataset1", function () {
            data = data1;

            assert.equal(data.arg.name, "logger1");
            assert.equal(data.arg.level, Level.ALL);
            assert.equal(data.arg.handlers.length, 1);
            assert.equal(typeof data.arg.handlers[0], "function");
            assert.equal(data.arg.filters, undefined);
            assert.equal(data.arg.formatter, undefined);

            assert(data.logger instanceof Logger);
        });


        test("dataset2", function () {
            data = data2;

            assert.equal(data.arg.name, "logger2");
            assert.equal(data.arg.level, Level.DEBUG);
            assert.equal(data.arg.handlers.length, 1);
            assert.equal(typeof data.arg.handlers[0], "function");
            assert.equal(data.arg.filters.length, 1);
            assert.equal(typeof data.arg.filters[0], "function");
            assert.equal(data.arg.formatter, undefined);

            assert(data.logger instanceof Logger);
        });


        test("dataset3", function () {
            data = data3;

            assert.equal(data.arg.name, "logger3");
            assert.equal(data.arg.level, Level.INFO);
            assert.equal(data.arg.handlers.length, 1);
            assert.equal(typeof data.arg.handlers[0], "function");
            assert.equal(data.arg.filters.length, 1);
            assert.equal(typeof data.arg.filters[0], "function");
            assert.equal(typeof data.arg.formatter, "function");

            assert(data.logger instanceof Logger);
        });


        test("dataset4", function () {
            data = data4;

            assert.equal(data.arg.name, "logger4");
            assert.equal(data.arg.level, Level.WARN);
            assert.equal(data.arg.handlers.length, 2);
            assert.equal(typeof data.arg.handlers[0], "function");
            assert.equal(typeof data.arg.handlers[1], "function");
            assert.equal(data.arg.filters.length, 2);
            assert.equal(typeof data.arg.filters[0], "function");
            assert.equal(typeof data.arg.filters[1], "function");
            assert.equal(typeof data.arg.formatter, "function");

            assert(data.logger instanceof Logger);
        });

    });


    suite("#constructor", function () {

        test("no aruments", function () {
            assert.equal(logger0.getName(), null);
            assert.equal(logger0.getLevel(), Level.ALL);
            assert.deepEqual(logger0.getAllFilters(), []);
            assert.deepEqual(logger0.getAllHandlers(), []);
        });

        test("nullish aruments", function () {
            logger = new Logger(undefined);
            assert.equal(logger.getName(), null);
            assert.equal(logger.getLevel(), Level.ALL);
            assert.deepEqual(logger.getAllFilters(), []);
            assert.deepEqual(logger.getAllHandlers(), []);

            logger = new Logger(null);
            assert.equal(logger.getName(), null);
            assert.equal(logger.getLevel(), Level.ALL);
            assert.deepEqual(logger.getAllFilters(), []);
            assert.deepEqual(logger.getAllHandlers(), []);
        });


        test("constructor options", function () {
            logger = new Logger({
                name: "Foo",
                level: Level.WARN,
                filters: [filter1, filter2],
                handlers: [console.log, console.warn],
                formatter: formatter
            });

            assert.equal(logger.getName(), "Foo");
            assert.equal(logger.getLevel(), Level.WARN);
            assert.deepEqual(logger.getAllFilters(), [filter1, filter2]);
            assert.deepEqual(logger.getAllHandlers(), [console.log, console.warn]);
            assert.equal(logger.getFormatter(), formatter);
        });

        test("copy constructor", function () {
            logger = data4.logger;

            var copy = new Logger(logger);
            assert.equal(copy.getName(), logger.getName());
            assert.equal(copy.getLevel(), logger.getLevel());
            assert.deepEqual(copy.getAllFilters(), logger.getAllFilters());
            assert.deepEqual(copy.getAllHandlers(), logger.getAllHandlers());
            assert.equal(copy.getFormatter(), logger.getFormatter());
        });

        test("with no new operator", function () {
            assert.equal(logger0, Logger(logger0));
            assert.equal(data1.logger, Logger(data1.logger));
            assert.equal(data2.logger, Logger(data2.logger));
            assert.equal(data3.logger, Logger(data3.logger));
            assert.equal(data4.logger, Logger(data4.logger));
            assert(Logger({}) instanceof Logger);
        });


        test("exception", function () {
            assert.throw(function () {
                new Logger(false);
            }, TypeError);
        });
    });


    suite("#getName", function () {

        test("default", function () {
            assert.equal(new Logger().getName(), null);
        });

        test("set via constructor", function () {
            assert.equal(new Logger({name: "foo"}).getName(), "foo");
        });

        test("set via copy constructor", function () {
            assert.equal(new Logger(new Logger({name: "foo"})).getName(), "foo");
        });

        test("set via setter", function () {
            logger0.setName("foo");

            assert.equal(logger0.getName(), "foo");
        });
    });


    suite("#setName", function () {

        test("nullish", function () {
            logger0.setName();
            assert.equal(logger0.getName(), null);

            logger0.setName(undefined);
            assert.equal(logger0.getName(), null);

            logger0.setName(null);
            assert.equal(logger0.getName(), null);
        });


        test("string", function () {
            logger0.setName("");
            assert.equal(logger0.getName(), "");

            logger0.setName("foo");
            assert.equal(logger0.getName(), "foo");
        });


        test("non-string", function () {
            logger0.setName(1);
            assert.equal(logger0.getName(), "1");

            logger0.setName(false);
            assert.equal(logger0.getName(), "false");
        });
    });


    suite("#getLevel", function () {

        test("default", function () {
            assert.equal(new Logger().getLevel(), Level.ALL);
        });


        test("set via constructor", function () {
            assert.equal(new Logger({level: Level.DEBUG}).getLevel(), Level.DEBUG);
        });

        test("set via copy constructor", function () {
            assert.equal(new Logger(new Logger({level: Level.DEBUG})).getLevel(), Level.DEBUG);
        });

        test("set via setter", function () {
            logger0.setLevel(Level.DEBUG);
            assert.equal(logger0.getLevel(), Level.DEBUG);
        });
    });


    suite("#setLevel", function () {

        test("using value", function () {
            logger0.setLevel(Level.INFO.value);
            assert.equal(logger0.getLevel(), Level.INFO);

            logger0.setLevel(Level.WARN.value);
            assert.equal(logger0.getLevel(), Level.WARN);
        });


        test("using name", function () {
            logger0.setLevel(Level.INFO.name);
            assert.equal(logger0.getLevel(), Level.INFO);

            logger0.setLevel(Level.WARN.name);
            assert.equal(logger0.getLevel(), Level.WARN);
        });


        test("using constant object", function () {
            logger0.setLevel(Level.INFO);
            assert.equal(logger0.getLevel(), Level.INFO);

            logger0.setLevel(Level.WARN);
            assert.equal(logger0.getLevel(), Level.WARN);
        });


        test("custom levels", function () {
            logger0.setLevel(123);
            assert.equal(logger0.getLevel().value, 123);

            logger0.setLevel(456);
            assert.equal(logger0.getLevel().value, 456);
        });
    });


    suite("#getAllHandlers", function () {

        test("0 handlers", function () {
            assert.deepEqual(logger0.getAllHandlers(), []);
        });


        test("1 handler", function () {
            assert.deepEqual(data1.logger.getAllHandlers(), data1.arg.handlers);
        });


        test("2 handlers", function () {
            assert.deepEqual(data4.logger.getAllHandlers(), data4.arg.handlers);
        });
    });


    suite("#addHandler", function () {

        var handler1, handler2;

        test("1 handler", function () {
            handler1 = newHandler();

            assert.deepEqual(logger0.getAllHandlers(), []);
            logger0.addHandler(handler1);
            assert.deepEqual(logger0.getAllHandlers(), [handler1]);
        });


        test("2 handlers - unique", function () {
            handler1 = newHandler();
            handler2 = newHandler();

            assert.deepEqual(logger0.getAllHandlers(), []);
            logger0.addHandler(handler1);
            logger0.addHandler(handler2);
            assert.deepEqual(logger0.getAllHandlers(), [handler1, handler2]);
        });


        test("2 handlers - same", function () {
            handler1 = newHandler();

            assert.deepEqual(logger0.getAllHandlers(), []);
            logger0.addHandler(handler1);
            logger0.addHandler(handler1);
            assert.deepEqual(logger0.getAllHandlers(), [handler1, handler1]);
        });


        test("exceptions", function () {

            assert.throw(function () {
                logger0.addHandler(null);
            }, TypeError);

            assert.throw(function () {
                logger0.addHandler(0);
            }, TypeError);
        });
    });


    suite("#removeHandler", function () {

        test("null", function () {
            logger = data1.logger;

            assert.equal(logger.getAllHandlers().length, 1);
            logger.removeHandler(null);
            assert.equal(logger.getAllHandlers().length, 1);
        });


        test("non-existent", function () {
            logger = data1.logger;

            assert.equal(logger.getAllHandlers().length, 1);
            logger.removeHandler(function () {});
            assert.equal(logger.getAllHandlers().length, 1);
        });


        test("1 handler", function () {
            data = data1;
            logger = data.logger;

            assert.equal(logger.getAllHandlers().length, 1);
            logger.removeHandler(data.arg.handlers[0]);
            assert.deepEqual(logger.getAllHandlers(), []);

            logger.removeHandler(data.arg.handlers[0]);
            assert.deepEqual(logger.getAllHandlers(), []);
        });


        test("2 handlers", function () {
            data = data4;
            logger = data.logger;

            assert.equal(logger.getAllHandlers().length, 2);
            logger.removeHandler(data.arg.handlers[0]);
            assert.deepEqual(logger.getAllHandlers(), [data.arg.handlers[1]]);

            logger.removeHandler(data.arg.handlers[1]);
            assert.deepEqual(logger.getAllHandlers(), []);

            logger.removeHandler(data.arg.handlers[0]);
            logger.removeHandler(data.arg.handlers[1]);
            assert.deepEqual(logger.getAllHandlers(), []);
        });
    });


    suite("#clearHandlers", function () {

        test("0 handlers", function () {
            assert.deepEqual(logger0.getAllHandlers(), []);
            logger0.clearHandlers();
            assert.deepEqual(logger0.getAllHandlers(), []);
        });


        test("1 handler", function () {
            logger = data1.logger;

            assert.equal(logger.getAllHandlers().length, 1);
            logger.clearHandlers();
            assert.deepEqual(logger0.getAllHandlers(), []);
        });


        test("2 handlers", function () {
            logger = data4.logger;

            assert.equal(logger.getAllHandlers().length, 2);
            logger.clearHandlers();
            assert.deepEqual(logger0.getAllHandlers(), []);
        });
    });


    suite("#getAllFilters", function () {

        test("no filter", function () {
            assert.deepEqual(logger0.getAllFilters(), []);
        });


        test("with 1 filter", function () {
            assert.deepEqual(data2.logger.getAllFilters(), data2.arg.filters);
        });


        test("with 2 filters", function () {
            assert.deepEqual(data4.logger.getAllFilters(), data4.arg.filters);
        });
    });


    suite("#addFilter", function () {

        var filter1 = function () {}, filter2 = function () {};

        test("1 filter", function () {
            assert.deepEqual(logger0.getAllFilters(), []);

            logger0.addFilter(filter1);
            assert.deepEqual(logger0.getAllFilters(), [filter1]);
        });


        test("2 filters", function () {
            assert.deepEqual(logger0.getAllFilters(), []);

            logger0.addFilter(filter1);
            logger0.addFilter(filter2);
            assert.deepEqual(logger0.getAllFilters(), [filter1, filter2]);
        });


        test("exceptions", function () {
            assert.throw(function () {
                logger0.addFilter(null);
            }, TypeError);

            assert.throw(function () {
                logger0.addFilter(1);
            }, TypeError);
        });
    });


    suite("#removeFilter", function () {

        test("null", function () {
            logger0.removeFilter(null);
            assert.deepEqual(logger0.getAllFilters(), []);
        });


        test("non-existent", function () {
            logger = data2.logger;

            assert.equal(logger.getAllFilters().length, 1);
            logger.removeFilter(function () {});
            assert.equal(logger.getAllFilters().length, 1);
        });


        test("1 filter", function () {
            logger = data2.logger;

            assert.equal(logger.getAllFilters().length, 1);
            logger.removeFilter(data2.arg.filters[0]);
            assert.deepEqual(logger.getAllFilters(), []);
        });


        test("2 filters", function () {
            data = data4;
            logger = data.logger;

            assert.equal(logger.getAllFilters().length, 2);
            logger.removeFilter(data.arg.filters[0]);
            assert.deepEqual(logger.getAllFilters(), [data.arg.filters[1]]);

            logger.removeFilter(data.arg.filters[1]);
            assert.deepEqual(logger.getAllFilters(), []);
        });
    });


    suite("#clearFilters", function () {

        test("0 filters", function () {
            assert.deepEqual(logger0.getAllFilters(), []);
            logger0.clearFilters();
            assert.deepEqual(logger0.getAllFilters(), []);
        });


        test("1 filter", function () {
            logger = data2.logger;

            assert.equal(logger.getAllFilters().length, 1);
            logger.clearFilters();
            assert.deepEqual(logger.getAllFilters(), []);
        });


        test("2 filters", function () {
            logger = data4.logger;

            assert.equal(logger.getAllFilters().length, 2);
            logger.clearFilters();
            assert.deepEqual(logger.getAllFilters(), []);
        });
    });


    suite("#getFormatter", function () {

        test("no formatter", function () {
            assert.equal(logger0.getFormatter(), null);
        });


        test("with formatter", function () {
            assert.equal(data3.logger.getFormatter(), data3.arg.formatter);
            assert.equal(data4.logger.getFormatter(), data4.arg.formatter);
        });
    });


    suite("#setFormatter", function () {

        test("nullish", function () {
            logger0.setFormatter();
            assert.equal(logger0.getFormatter(), null);

            logger0.setFormatter(undefined);
            assert.equal(logger0.getFormatter(), null);

            logger0.setFormatter(null);
            assert.equal(logger0.getFormatter(), null);
        });


        test("function", function () {
            var formatter = function () {};

            logger0.setFormatter(formatter);
            assert.equal(logger0.getFormatter(), formatter);
        });


        test("exceptions", function () {
            assert.throw(function () {
                logger0.setFormatter(0);
            }, TypeError);
        });
    });



    suite("#log", function () {

        test("no handler", function () {
            logger0.log(Level.ALL);
            logger0.log(Level.TRACE);
            logger0.log(Level.DEBUG);
            logger0.log(Level.INFO);
            logger0.log(Level.WARN);
            logger0.log(Level.ERROR);
            logger0.log(Level.FATAL);
        });


        test("1 handler only", function () {
            logger = data1.logger;
            logs = data1.arg.handlers[0].logs;


            var emptyLogs = newLogs();

            // not logged
            logger.setLevel(Level.OFF);

            assert.deepEqual(logs, emptyLogs);
            logger.log(Level.ALL, "1");
            assert.deepEqual(logs, emptyLogs);

            // not logged
            logger.setLevel(Level.INFO);

            logger.log(Level.DEBUG, "1");
            assert.deepEqual(logs, emptyLogs);

            // logged
            logger.log(Level.INFO, "1");
            assert.deepEqual(logs.info, [["1"]]);


            // logged
            logger.log(Level.INFO, "2", "3");
            assert.deepEqual(logs.all, [["1"], ["2", "3"]]);
            assert.deepEqual(logs.trace, []);
            assert.deepEqual(logs.debug, []);
            assert.deepEqual(logs.info, [["1"], ["2", "3"]]);
            assert.deepEqual(logs.warn, []);
            assert.deepEqual(logs.error, []);
            assert.deepEqual(logs.fatal, []);


            // logged
            logger.log(Level.WARN, "4", "5", "6");
            assert.deepEqual(logs.all, [["1"], ["2", "3"], ["4", "5", "6"]]);
            assert.deepEqual(logs.trace, []);
            assert.deepEqual(logs.debug, []);
            assert.deepEqual(logs.info, [["1"], ["2", "3"]]);
            assert.deepEqual(logs.warn, [["4", "5", "6"]]);
            assert.deepEqual(logs.error, []);
            assert.deepEqual(logs.fatal, []);
        });


        test("1 handler only - different message types", function () {
            logger = data1.logger;
            logs = data1.arg.handlers[0].logs;

            logger.log(Level.DEBUG, " Abc ");
            assert.deepEqual(logs.debug, [[" Abc "]]);

            logger.log(Level.DEBUG, 123);
            assert.deepEqual(logs.debug, [[" Abc "], [123]]);

            logger.log(Level.DEBUG, false);
            assert.deepEqual(logs.debug, [[" Abc "], [123], [false]]);

            logger.log(Level.DEBUG, undefined);
            assert.deepEqual(logs.debug, [[" Abc "], [123], [false], [undefined]]);

            logger.log(Level.DEBUG, null);
            assert.deepEqual(logs.debug, [[" Abc "], [123], [false], [undefined], [null]]);

            logger.log(Level.DEBUG, {name: "Foo"});
            assert.deepEqual(logs.debug, [[" Abc "], [123], [false], [undefined], [null], [{name: "Foo"}]]);

            logger.log(Level.DEBUG, ["One", "Two", "Three"]);
            assert.deepEqual(logs.debug, [[" Abc "], [123], [false], [undefined], [null], [{name: "Foo"}], [["One", "Two", "Three"]]]);

            logger.log(Level.DEBUG, filter1);
            assert.deepEqual(logs.debug, [[" Abc "], [123], [false], [undefined], [null], [{name: "Foo"}], [["One", "Two", "Three"]], [filter1]]);
        });



        test("1 handler only - using level objects", function () {
            logger = data1.logger;
            logs = data1.arg.handlers[0].logs;

            assert.deepEqual(logs.all, []);
            logger.log(Level.ALL, "1");
            assert.deepEqual(logs.all, [["1"]]);

            assert.deepEqual(logs.trace, []);
            logger.log(Level.TRACE, "2");
            assert.deepEqual(logs.trace, [["2"]]);

            assert.deepEqual(logs.debug, []);
            logger.log(Level.DEBUG, "3");
            assert.deepEqual(logs.debug, [["3"]]);

            assert.deepEqual(logs.info, []);
            logger.log(Level.INFO, "4");
            assert.deepEqual(logs.info, [["4"]]);

            assert.deepEqual(logs.warn, []);
            logger.log(Level.WARN, "5");
            assert.deepEqual(logs.warn, [["5"]]);

            assert.deepEqual(logs.error, []);
            logger.log(Level.ERROR, "6");
            assert.deepEqual(logs.error, [["6"]]);

            assert.deepEqual(logs.fatal, []);
            logger.log(Level.FATAL, "7");
            assert.deepEqual(logs.fatal, [["7"]]);

            assert.deepEqual(logs.all, [["1"], ["2"], ["3"], ["4"], ["5"], ["6"], ["7"]]);
            assert.deepEqual(logs.trace, [["2"]]);
            assert.deepEqual(logs.debug, [["3"]]);
            assert.deepEqual(logs.info, [["4"]]);
            assert.deepEqual(logs.warn, [["5"]]);
            assert.deepEqual(logs.error, [["6"]]);
            assert.deepEqual(logs.fatal, [["7"]]);
        });


        test("1 handler only - using level values", function () {
            logger = data1.logger;
            logs = data1.arg.handlers[0].logs;

            assert.deepEqual(logs.all, []);
            logger.log(Level.ALL.value, "1");
            assert.deepEqual(logs.all, [["1"]]);

            assert.deepEqual(logs.trace, []);
            logger.log(Level.TRACE.value, "2");
            assert.deepEqual(logs.trace, [["2"]]);

            assert.deepEqual(logs.debug, []);
            logger.log(Level.DEBUG.value, "3");
            assert.deepEqual(logs.debug, [["3"]]);

            assert.deepEqual(logs.info, []);
            logger.log(Level.INFO.value, "4");
            assert.deepEqual(logs.info, [["4"]]);

            assert.deepEqual(logs.warn, []);
            logger.log(Level.WARN.value, "5");
            assert.deepEqual(logs.warn, [["5"]]);

            assert.deepEqual(logs.error, []);
            logger.log(Level.ERROR.value, "6");
            assert.deepEqual(logs.error, [["6"]]);

            assert.deepEqual(logs.fatal, []);
            logger.log(Level.FATAL.value, "7");
            assert.deepEqual(logs.fatal, [["7"]]);

            assert.deepEqual(logs.all, [["1"], ["2"], ["3"], ["4"], ["5"], ["6"], ["7"]]);
            assert.deepEqual(logs.trace, [["2"]]);
            assert.deepEqual(logs.debug, [["3"]]);
            assert.deepEqual(logs.info, [["4"]]);
            assert.deepEqual(logs.warn, [["5"]]);
            assert.deepEqual(logs.error, [["6"]]);
            assert.deepEqual(logs.fatal, [["7"]]);
        });


        test("1 handler only - using level names", function () {
            logger = data1.logger;
            logs = data1.arg.handlers[0].logs;

            assert.deepEqual(logs.all, []);
            logger.log(Level.ALL.name, "1");
            assert.deepEqual(logs.all, [["1"]]);

            assert.deepEqual(logs.trace, []);
            logger.log(Level.TRACE.name, "2");
            assert.deepEqual(logs.trace, [["2"]]);

            assert.deepEqual(logs.debug, []);
            logger.log(Level.DEBUG.name, "3");
            assert.deepEqual(logs.debug, [["3"]]);

            assert.deepEqual(logs.info, []);
            logger.log(Level.INFO.name, "4");
            assert.deepEqual(logs.info, [["4"]]);

            assert.deepEqual(logs.warn, []);
            logger.log(Level.WARN.name, "5");
            assert.deepEqual(logs.warn, [["5"]]);

            assert.deepEqual(logs.error, []);
            logger.log(Level.ERROR.name, "6");
            assert.deepEqual(logs.error, [["6"]]);

            assert.deepEqual(logs.fatal, []);
            logger.log(Level.FATAL.name, "7");
            assert.deepEqual(logs.fatal, [["7"]]);

            assert.deepEqual(logs.all, [["1"], ["2"], ["3"], ["4"], ["5"], ["6"], ["7"]]);
            assert.deepEqual(logs.trace, [["2"]]);
            assert.deepEqual(logs.debug, [["3"]]);
            assert.deepEqual(logs.info, [["4"]]);
            assert.deepEqual(logs.warn, [["5"]]);
            assert.deepEqual(logs.error, [["6"]]);
            assert.deepEqual(logs.fatal, [["7"]]);
        });


        test("1 handler only - using custom levels", function () {
            logger = data1.logger;
            logs = data1.arg.handlers[0].logs;

            assert.deepEqual(logs.all, []);
            assert.deepEqual(logs[111], undefined);

            assert(logger.log(111, "1"));
            assert.deepEqual(logs[111], [["1"]]);

            assert(logger.log(111, "2", "3"));
            assert.deepEqual(logs[111], [["1"], ["2", "3"]]);

            assert(logger.log(112, 1));
            assert.deepEqual(logs[112], [[1]]);

            assert(logger.log("112", "abc"));
            assert.deepEqual(logs[112], [[1], ["abc"]]);

            // falsy values
            assert(!logger.log(null, null));
            assert.deepEqual(logs.null, undefined);

            assert(!logger.log(undefined, undefined));
            assert.deepEqual(logs.undefined, undefined);

            assert(!logger.log(false, false));
            assert.deepEqual(logs.false, undefined);

            assert(!logger.log(Number.NaN, Number.NaN));
            assert.deepEqual(logs.NaN, undefined);

            assert(!logger.log("", ""));
            assert.deepEqual(logs[""], undefined);

            assert(!logger.log(0, "off"));
            assert.deepEqual(logs[0], undefined);


            assert.deepEqual(logs.all, [["1"], ["2", "3"], [1], ["abc"]]);
            assert.deepEqual(logs.trace, []);
            assert.deepEqual(logs.debug, []);
            assert.deepEqual(logs.info, []);
            assert.deepEqual(logs.warn, []);
            assert.deepEqual(logs.error, []);
            assert.deepEqual(logs.fatal, []);
        });


        test("1 handler, 1 filter, no formatter", function () {
            logger = data2.logger;
            logs = data2.arg.handlers[0].logs;


            // different levels
            assert.deepEqual(logs.all, []);
            logger.log(Level.ALL, "1");
            assert.deepEqual(logs.all, []);

            assert.deepEqual(logs.trace, []);
            logger.log(Level.TRACE, "2");
            assert.deepEqual(logs.trace, []);

            assert.deepEqual(logs.debug, []);
            logger.log(Level.DEBUG, "3");
            assert.deepEqual(logs.debug, [["3"]]);

            assert.deepEqual(logs.info, []);
            logger.log(Level.INFO, "4");
            assert.deepEqual(logs.info, [["4"]]);

            assert.deepEqual(logs.warn, []);
            logger.log(Level.WARN, "5");
            assert.deepEqual(logs.warn, [["5"]]);

            assert.deepEqual(logs.error, []);
            logger.log(Level.ERROR, "6");
            assert.deepEqual(logs.error, [["6"]]);

            assert.deepEqual(logs.fatal, []);
            logger.log(Level.FATAL, "7");
            assert.deepEqual(logs.fatal, [["7"]]);

            assert.deepEqual(logs.all, [["3"], ["4"], ["5"], ["6"], ["7"]]);
            assert.deepEqual(logs.trace, []);
            assert.deepEqual(logs.debug, [["3"]]);
            assert.deepEqual(logs.info, [["4"]]);
            assert.deepEqual(logs.warn, [["5"]]);
            assert.deepEqual(logs.error, [["6"]]);
            assert.deepEqual(logs.fatal, [["7"]]);


            // different types of messages
            logger.log(Level.DEBUG, " Abc ");
            assert.deepEqual(logs.debug, [["3"], [" Abc "]]);

            logger.log(Level.DEBUG, "One", "Two", "Three");
            assert.deepEqual(logs.debug, [["3"], [" Abc "], ["One", "Two", "Three"]]);

            logger.log(Level.DEBUG, 123);
            assert.deepEqual(logs.debug, [["3"], [" Abc "], ["One", "Two", "Three"]]);

            logger.log(Level.DEBUG, false);
            assert.deepEqual(logs.debug, [["3"], [" Abc "], ["One", "Two", "Three"]]);

            logger.log(Level.DEBUG, undefined);
            assert.deepEqual(logs.debug, [["3"], [" Abc "], ["One", "Two", "Three"]]);

            logger.log(Level.DEBUG, null);
            assert.deepEqual(logs.debug, [["3"], [" Abc "], ["One", "Two", "Three"]]);

            logger.log(Level.DEBUG, {name: "Foo"});
            assert.deepEqual(logs.debug, [["3"], [" Abc "], ["One", "Two", "Three"]]);

            logger.log(Level.DEBUG, filter1);
            assert.deepEqual(logs.debug, [["3"], [" Abc "], ["One", "Two", "Three"]]);
        });


        test("1 handler, 1 filter, 1 formatter", function () {
            logger = data3.logger;
            logs = data3.arg.handlers[0].logs;


            assert.deepEqual(logs.all, []);
            logger.log(Level.ALL, "1");
            assert.deepEqual(logs.all, []);

            assert.deepEqual(logs.trace, []);
            logger.log(Level.TRACE, "2");
            assert.deepEqual(logs.trace, []);

            assert.deepEqual(logs.debug, []);
            logger.log(Level.DEBUG, "3");
            assert.deepEqual(logs.debug, []);

            assert.deepEqual(logs.info, []);
            logger.log(Level.INFO, 4);
            assert.deepEqual(logs.info, []);
            logger.log(Level.INFO, "4");
            assert.deepEqual(logs.info, [["info:4"]]);

            assert.deepEqual(logs.warn, []);
            logger.log(Level.WARN, 5);
            assert.deepEqual(logs.warn, []);
            logger.log(Level.WARN, "5");
            assert.deepEqual(logs.warn, [["warn:5"]]);

            assert.deepEqual(logs.error, []);
            logger.log(Level.ERROR, 6);
            assert.deepEqual(logs.error, []);
            logger.log(Level.ERROR, "6");
            assert.deepEqual(logs.error, [["error:6"]]);

            assert.deepEqual(logs.fatal, []);
            logger.log(Level.FATAL, 7);
            assert.deepEqual(logs.fatal, []);
            logger.log(Level.FATAL, "7");
            assert.deepEqual(logs.fatal, [["fatal:7"]]);
            logger.log(Level.FATAL, "f", 8);
            assert.deepEqual(logs.fatal, [["fatal:7"], ["fatal:f", "fatal:8"]]);

            assert.deepEqual(logs.all, [["info:4"], ["warn:5"], ["error:6"], ["fatal:7"], ["fatal:f", "fatal:8"]]);
            assert.deepEqual(logs.trace, []);
            assert.deepEqual(logs.debug, []);
            assert.deepEqual(logs.info, [["info:4"]]);
            assert.deepEqual(logs.warn, [["warn:5"]]);
            assert.deepEqual(logs.error, [["error:6"]]);
            assert.deepEqual(logs.fatal, [["fatal:7"], ["fatal:f", "fatal:8"]]);
        });


        test("2 handlers, 2 filters, 1 formatter", function () {
            logger = data4.logger;
            logs = data4.arg.handlers[0].logs;
            logs2 = data4.arg.handlers[1].logs;


            assert.deepEqual(logs.all, []);
            logger.log(Level.ALL, "a");
            assert.deepEqual(logs.all, []);
            logger.log(Level.ALL, "a", 1);
            assert.deepEqual(logs.all, []);

            assert.deepEqual(logs.trace, []);
            logger.log(Level.TRACE, "b");
            assert.deepEqual(logs.trace, []);
            logger.log(Level.TRACE, "b", 2);
            assert.deepEqual(logs.trace, []);

            assert.deepEqual(logs.debug, []);
            logger.log(Level.DEBUG, "c");
            assert.deepEqual(logs.debug, []);
            logger.log(Level.DEBUG, "c", 3);
            assert.deepEqual(logs.debug, []);

            assert.deepEqual(logs.info, []);
            logger.log(Level.INFO, "d");
            assert.deepEqual(logs.info, []);
            logger.log(Level.INFO, "d", 4);
            assert.deepEqual(logs.info, []);

            assert.deepEqual(logs.warn, []);
            logger.log(Level.WARN, "e");
            assert.deepEqual(logs.warn, []);
            logger.log(Level.WARN, "e", 5);
            assert.deepEqual(logs.warn, [["warn:e", "warn:5"]]);

            assert.deepEqual(logs.error, []);
            logger.log(Level.ERROR, "f");
            assert.deepEqual(logs.error, []);
            logger.log(Level.ERROR, "f", 6);
            assert.deepEqual(logs.error, [["error:f", "error:6"]]);

            assert.deepEqual(logs.fatal, []);
            logger.log(Level.FATAL, "g");
            assert.deepEqual(logs.fatal, []);
            logger.log(Level.FATAL, "abc");
            assert.deepEqual(logs.fatal, [["fatal:abc"]]);
            logger.log(Level.FATAL, "g", 7);
            assert.deepEqual(logs.fatal, [["fatal:abc"], ["fatal:g", "fatal:7"]]);

            logger.log(Level.FATAL, "ab", true);
            assert.deepEqual(logs.fatal, [["fatal:abc"], ["fatal:g", "fatal:7"]]);


            assert.deepEqual(logs.all, [["warn:e", "warn:5"], ["error:f", "error:6"], ["fatal:abc"], ["fatal:g", "fatal:7"]]);
            assert.deepEqual(logs.trace, []);
            assert.deepEqual(logs.debug, []);
            assert.deepEqual(logs.info, []);
            assert.deepEqual(logs.warn, [["warn:e", "warn:5"]]);
            assert.deepEqual(logs.error, [["error:f", "error:6"]]);
            assert.deepEqual(logs.fatal, [["fatal:abc"], ["fatal:g", "fatal:7"]]);

            assert.deepEqual(logs, logs2);
        });


    });


    function testLogs(logger, logs, level) {
        level = Level.get(level);

        // prechecks
        assert.deepEqual(logs.all, []);
        assert.deepEqual(logs.trace, []);
        assert.deepEqual(logs.debug, []);
        assert.deepEqual(logs.info, []);
        assert.deepEqual(logs.warn, []);
        assert.deepEqual(logs.error, []);
        assert.deepEqual(logs.fatal, []);

        logger.setLevel(Level.OFF);
        logger[level.name]("1");

        assert.deepEqual(logs.all, []);
        assert.deepEqual(logs.trace, []);
        assert.deepEqual(logs.debug, []);
        assert.deepEqual(logs.info, []);
        assert.deepEqual(logs.warn, []);
        assert.deepEqual(logs.error, []);
        assert.deepEqual(logs.fatal, []);

        logger.setLevel(Level.above(level) || new Level(Level.FATAL.value + 1));
        logger[level.name]("1");

        assert.deepEqual(logs.all, []);
        assert.deepEqual(logs.trace, []);
        assert.deepEqual(logs.debug, []);
        assert.deepEqual(logs.info, []);
        assert.deepEqual(logs.warn, []);
        assert.deepEqual(logs.error, []);
        assert.deepEqual(logs.fatal, []);

        logger.setLevel(level);

        logger[level.name]("1");
        assert.deepEqual(logs[level.name], [["1"]]);

        logger[level.name](" Abc ");
        assert.deepEqual(logs[level.name], [["1"], [" Abc "]]);

        logger[level.name]("One", "Two", "Three");
        assert.deepEqual(logs[level.name], [["1"], [" Abc "], ["One", "Two", "Three"]]);

        logger[level.name](123);
        assert.deepEqual(logs[level.name], [["1"], [" Abc "], ["One", "Two", "Three"], [123]]);

        logger[level.name](false);
        assert.deepEqual(logs[level.name], [["1"], [" Abc "], ["One", "Two", "Three"], [123], [false]]);

        logger[level.name](undefined);
        assert.deepEqual(logs[level.name], [["1"], [" Abc "], ["One", "Two", "Three"], [123], [false], [undefined]]);

        logger[level.name](null);
        assert.deepEqual(logs[level.name], [["1"], [" Abc "], ["One", "Two", "Three"], [123], [false], [undefined], [null]]);

        logger[level.name]({name: "Foo"});
        assert.deepEqual(logs[level.name], [["1"], [" Abc "], ["One", "Two", "Three"], [123], [false], [undefined], [null], [{name: "Foo"}]]);

        logger[level.name](filter1);
        assert.deepEqual(logs[level.name], [["1"], [" Abc "], ["One", "Two", "Three"], [123], [false], [undefined], [null], [{name: "Foo"}], [filter1]]);

        assert.deepEqual(logs.all, [["1"], [" Abc "], ["One", "Two", "Three"], [123], [false], [undefined], [null], [{name: "Foo"}], [filter1]]);

        for (var name in logs) {
            if (name !== "all" && name !== level.name) {
                assert.deepEqual(logs[name], []);
            }
        }
    }

    function testLogsWithFilter(logger, logs, level) {
        level = Level.get(level);

        // precheck
        assert.deepEqual(logs.all, []);
        assert.deepEqual(logs.trace, []);
        assert.deepEqual(logs.debug, []);
        assert.deepEqual(logs.info, []);
        assert.deepEqual(logs.warn, []);
        assert.deepEqual(logs.error, []);
        assert.deepEqual(logs.fatal, []);

        logger.setLevel(Level.OFF);
        logger[level.name]("a");

        assert.deepEqual(logs.all, []);
        assert.deepEqual(logs.trace, []);
        assert.deepEqual(logs.debug, []);
        assert.deepEqual(logs.info, []);
        assert.deepEqual(logs.warn, []);
        assert.deepEqual(logs.error, []);
        assert.deepEqual(logs.fatal, []);

        logger.setLevel(Level.above(level) || new Level(Level.FATAL.value + 1));
        logger[level.name]("a");

        assert.deepEqual(logs.all, []);
        assert.deepEqual(logs.trace, []);
        assert.deepEqual(logs.debug, []);
        assert.deepEqual(logs.info, []);
        assert.deepEqual(logs.warn, []);
        assert.deepEqual(logs.error, []);
        assert.deepEqual(logs.fatal, []);


        logger.setLevel(level);

        // logged
        logger[level.name]("a");

        assert.deepEqual(logs, {
            all: [["a"]],
            trace: [],
            debug: [],
            info: [],
            warn: [],
            error: [],
            fatal: [],
            [level.name]: [["a"]]
        });

        // logged
        logger[level.name]("b", 2);

        assert.deepEqual(logs, {
            all: [["a"], ["b", 2]],
            trace: [],
            debug: [],
            info: [],
            warn: [],
            error: [],
            fatal: [],
            [level.name]: [["a"], ["b", 2]]
        });


        // not logged
        logger[level.name](1);

        assert.deepEqual(logs, {
            all: [["a"], ["b", 2]],
            trace: [],
            debug: [],
            info: [],
            warn: [],
            error: [],
            fatal: [],
            [level.name]: [["a"], ["b", 2]]
        });
    }

    function testLogsWithFilterFormatter(logger, logs, level) {
        level = Level.get(level);

        // precheck
        assert.deepEqual(logs.all, []);
        assert.deepEqual(logs.trace, []);
        assert.deepEqual(logs.debug, []);
        assert.deepEqual(logs.info, []);
        assert.deepEqual(logs.warn, []);
        assert.deepEqual(logs.error, []);
        assert.deepEqual(logs.fatal, []);

        logger.setLevel(Level.OFF);
        logger[level.name]("a");   // not logged

        assert.deepEqual(logs.all, []);
        assert.deepEqual(logs.trace, []);
        assert.deepEqual(logs.debug, []);
        assert.deepEqual(logs.info, []);
        assert.deepEqual(logs.warn, []);
        assert.deepEqual(logs.error, []);
        assert.deepEqual(logs.fatal, []);

        logger.setLevel(Level.above(level) || new Level(Level.FATAL.value + 1));
        logger[level.name]("a");    // not logged

        assert.deepEqual(logs.all, []);
        assert.deepEqual(logs.trace, []);
        assert.deepEqual(logs.debug, []);
        assert.deepEqual(logs.info, []);
        assert.deepEqual(logs.warn, []);
        assert.deepEqual(logs.error, []);
        assert.deepEqual(logs.fatal, []);

        logger.setLevel(level);

        // logged
        logger[level.name]("a");

        assert.deepEqual(logs, {
            all: [[level.name + ":a"]],
            trace: [],
            debug: [],
            info: [],
            warn: [],
            error: [],
            fatal: [],
            [level.name]: [[level.name + ":a"]]
        });

        // logged
        logger[level.name]("b", 2);

        assert.deepEqual(logs, {
            all: [[level.name + ":a"], [level.name + ":b", level.name + ":2"]],
            trace: [],
            debug: [],
            info: [],
            warn: [],
            error: [],
            fatal: [],
            [level.name]: [[level.name + ":a"], [level.name + ":b", level.name + ":2"]]
        });


        // not logged
        logger[level.name](1);

        assert.deepEqual(logs, {
            all: [[level.name + ":a"], [level.name + ":b", level.name + ":2"]],
            trace: [],
            debug: [],
            info: [],
            warn: [],
            error: [],
            fatal: [],
            [level.name]: [[level.name + ":a"], [level.name + ":b", level.name + ":2"]]
        });
    }

    function testLogsWithFiletersFormatter(logger, logs, logs2, level) {
        level = Level.get(level);

        // precheck
        assert.deepEqual(logs.all, []);
        assert.deepEqual(logs.trace, []);
        assert.deepEqual(logs.debug, []);
        assert.deepEqual(logs.info, []);
        assert.deepEqual(logs.warn, []);
        assert.deepEqual(logs.error, []);
        assert.deepEqual(logs.fatal, []);
        assert.deepEqual(logs, logs2);

        // not logged
        logger.setLevel(Level.OFF);
        logger[level.name]("a", 1);

        assert.deepEqual(logs.all, []);
        assert.deepEqual(logs.trace, []);
        assert.deepEqual(logs.debug, []);
        assert.deepEqual(logs.info, []);
        assert.deepEqual(logs.warn, []);
        assert.deepEqual(logs.error, []);
        assert.deepEqual(logs.fatal, []);
        assert.deepEqual(logs, logs2);

        // not logged
        logger.setLevel(Level.above(level) || new Level(Level.FATAL.value + 1));
        logger[level.name]("a", 1);

        assert.deepEqual(logs.all, []);
        assert.deepEqual(logs.trace, []);
        assert.deepEqual(logs.debug, []);
        assert.deepEqual(logs.info, []);
        assert.deepEqual(logs.warn, []);
        assert.deepEqual(logs.error, []);
        assert.deepEqual(logs.fatal, []);
        assert.deepEqual(logs, logs2);

        logger.setLevel(level);

        // logged
        logger[level.name]("a", 1);

        assert.deepEqual(logs, {
            all: [[level.name + ":a", level.name + ":1"]],
            trace: [],
            debug: [],
            info: [],
            warn: [],
            error: [],
            fatal: [],
            [level.name]: [[level.name + ":a", level.name + ":1"]]
        });
        assert.deepEqual(logs, logs2);

        // logged
        logger[level.name]("b", 2);

        assert.deepEqual(logs, {
            all: [[level.name + ":a", level.name + ":1"], [level.name + ":b", level.name + ":2"]],
            trace: [],
            debug: [],
            info: [],
            warn: [],
            error: [],
            fatal: [],
            [level.name]: [[level.name + ":a", level.name + ":1"], [level.name + ":b", level.name + ":2"]]
        });
        assert.deepEqual(logs, logs2);


        // not logged
        logger[level.name]("c", true);

        assert.deepEqual(logs, {
            all: [[level.name + ":a", level.name + ":1"], [level.name + ":b", level.name + ":2"]],
            trace: [],
            debug: [],
            info: [],
            warn: [],
            error: [],
            fatal: [],
            [level.name]: [[level.name + ":a", level.name + ":1"], [level.name + ":b", level.name + ":2"]]
        });
        assert.deepEqual(logs, logs2);
    }


    suite("#trace", function () {

        test("no handler", function () {
            logger0.trace();
        });

        test("1 handler, no filter, no formatter", function () {
            testLogs(data1.logger, data1.arg.handlers[0].logs, Level.TRACE);
        });


        test("1 handler, 1 filter, no formatter", function () {
            testLogsWithFilter(data2.logger, data2.arg.handlers[0].logs, Level.TRACE);
        });


        test("1 handler, 1 filter, 1 formatter", function () {
            testLogsWithFilterFormatter(data3.logger, data3.arg.handlers[0].logs, Level.TRACE);
        });


        test("2 handlers, 2 filters, 1 formatter", function () {
            testLogsWithFiletersFormatter(data4.logger, data4.arg.handlers[0].logs, data4.arg.handlers[1].logs, Level.TRACE);
        });

    });


    suite("#debug", function () {

        test("no handler", function () {
            logger0.debug();
        });


        test("1 handler, no filter, no formatter", function () {
            testLogs(data1.logger, data1.arg.handlers[0].logs, Level.DEBUG);
        });


        test("1 handler, 1 filter, no formatter", function () {
            testLogsWithFilter(data2.logger, data2.arg.handlers[0].logs, Level.DEBUG);
        });


        test("1 handler, 1 filter, 1 formatter", function () {
            testLogsWithFilterFormatter(data3.logger, data3.arg.handlers[0].logs, Level.DEBUG);
        });


        test("2 handlers, 2 filters, 1 formatter", function () {
            testLogsWithFiletersFormatter(data4.logger, data4.arg.handlers[0].logs, data4.arg.handlers[1].logs, Level.DEBUG);
        });

    });


    suite("#info", function () {

        test("no handler", function () {
            logger0.info();
        });


        test("1 handler, no filter, no formatter", function () {
            testLogs(data1.logger, data1.arg.handlers[0].logs, Level.INFO);
        });


        test("1 handler, 1 filter, no formatter", function () {
            testLogsWithFilter(data2.logger, data2.arg.handlers[0].logs, Level.INFO);
        });


        test("1 handler, 1 filter, 1 formatter", function () {
            testLogsWithFilterFormatter(data3.logger, data3.arg.handlers[0].logs, Level.INFO);
        });


        test("2 handlers, 2 filters, 1 formatter", function () {
            testLogsWithFiletersFormatter(data4.logger, data4.arg.handlers[0].logs, data4.arg.handlers[1].logs, Level.INFO);
        });

    });


    suite("#warn", function () {

        test("no handler", function () {
            logger0.warn();
        });


        test("1 handler, no filter, no formatter", function () {
            testLogs(data1.logger, data1.arg.handlers[0].logs, Level.WARN);
        });


        test("1 handler, 1 filter, no formatter", function () {
            testLogsWithFilter(data2.logger, data2.arg.handlers[0].logs, Level.WARN);
        });


        test("1 handler, 1 filter, 1 formatter", function () {
            testLogsWithFilterFormatter(data3.logger, data3.arg.handlers[0].logs, Level.WARN);
        });


        test("2 handlers, 2 filters, 1 formatter", function () {
            testLogsWithFiletersFormatter(data4.logger, data4.arg.handlers[0].logs, data4.arg.handlers[1].logs, Level.WARN);
        });

    });


    suite("#error", function () {

        test("no handler", function () {
            logger0.error();
        });


        test("1 handler, no filter, no formatter", function () {
            testLogs(data1.logger, data1.arg.handlers[0].logs, Level.ERROR);
        });


        test("1 handler, 1 filter, no formatter", function () {
            testLogsWithFilter(data2.logger, data2.arg.handlers[0].logs, Level.ERROR);
        });


        test("1 handler, 1 filter, 1 formatter", function () {
            testLogsWithFilterFormatter(data3.logger, data3.arg.handlers[0].logs, Level.ERROR);
        });


        test("2 handlers, 2 filters, 1 formatter", function () {
            testLogsWithFiletersFormatter(data4.logger, data4.arg.handlers[0].logs, data4.arg.handlers[1].logs, Level.ERROR);
        });

    });


    suite("#fatal", function () {

        test("no handler", function () {
            logger0.fatal();
        });


        test("1 handler, no filter, no formatter", function () {
            testLogs(data1.logger, data1.arg.handlers[0].logs, Level.FATAL);
        });


        test("1 handler, 1 filter, no formatter", function () {
            testLogsWithFilter(data2.logger, data2.arg.handlers[0].logs, Level.FATAL);
        });


        test("1 handler, 1 filter, 1 formatter", function () {
            testLogsWithFilterFormatter(data3.logger, data3.arg.handlers[0].logs, Level.FATAL);
        });


        test("2 handlers, 2 filters, 1 formatter", function () {
            testLogsWithFiletersFormatter(data4.logger, data4.arg.handlers[0].logs, data4.arg.handlers[1].logs, Level.FATAL);
        });
    });


    suite("#default logger", function () {
        test("is a Logger instance", function () {
            assert(Logger.getDefault() instanceof Logger);
        });


        test("is a singleton", function () {
            assert(Logger.getDefault() === Logger.getDefault());
        });


        test("static methods", function () {
            logger = Logger.getDefault();

            Logger.setLevel(Level.ALL);

            assert.equal(Logger.log(Level.ALL, 1), true);
            assert.equal(Logger.log(Level.ALL.name, 2), true);
            assert.equal(Logger.log(Level.ALL.value, 3), true);
            assert.equal(Logger.log(Level.ALL.value + 1, 4), true);

            assert.equal(Logger.trace("2", 2), true);
            assert.equal(Logger.debug("3", 3), true);
            assert.equal(Logger.info("4", 4), true);
            assert.equal(Logger.warn("5", 5), true);
            assert.equal(Logger.error("6", 6), true);
            assert.equal(Logger.fatal("7", 7), true);

            assert.equal(Logger.setName("foo"), logger);
            assert.equal(Logger.getName(), logger.getName());

            assert.equal(Logger.setLevel(Level.INFO), logger);
            assert.equal(Logger.getLevel(), logger.getLevel());

            assert.equal(Logger.addFilter(filter1), logger);
            assert.equal(Logger.addFilter(filter2), logger);
            assert.deepEqual(Logger.getAllFilters(), logger.getAllFilters());

            assert.equal(Logger.removeFilter(filter2), logger);
            assert.deepEqual(Logger.getAllFilters(), logger.getAllFilters());

            assert.equal(Logger.clearFilters(), logger);
            assert.deepEqual(Logger.getAllFilters(), logger.getAllFilters());

            assert.deepEqual(Logger.getAllHandlers(), logger.getAllHandlers());

            assert.equal(Logger.addHandler(newHandler()), logger);
            assert.deepEqual(Logger.getAllHandlers(), logger.getAllHandlers());

            assert.equal(Logger.removeHandler(Logger.getAllHandlers()[0]), logger);
            assert.deepEqual(Logger.getAllHandlers(), logger.getAllHandlers());

            assert.equal(Logger.clearHandlers(), logger);
            assert.deepEqual(Logger.getAllHandlers(), logger.getAllHandlers());

            assert.equal(Logger.setFormatter(formatter), logger);
            assert.equal(Logger.getFormatter(), logger.getFormatter());
        });

    });

});