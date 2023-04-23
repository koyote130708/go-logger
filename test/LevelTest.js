/* global AssertionError */
"use strict";

var assert = require("chai").assert;

var Level = require("../src/Level");

suite("Level", function () {

    suite("#get", function () {

        test("by name", function () {
            assert.equal(Level.get(Level.ALL.name), Level.ALL);
            assert.equal(Level.get(Level.TRACE.name), Level.TRACE);
            assert.equal(Level.get(Level.DEBUG.name), Level.DEBUG);
            assert.equal(Level.get(Level.INFO.name), Level.INFO);
            assert.equal(Level.get(Level.WARN.name), Level.WARN);
            assert.equal(Level.get(Level.ERROR.name), Level.ERROR);
            assert.equal(Level.get(Level.FATAL.name), Level.FATAL);
        });


        test("by value", function () {
            assert.equal(Level.get(Level.ALL.value), Level.ALL);
            assert.equal(Level.get(Level.TRACE.value), Level.TRACE);
            assert.equal(Level.get(Level.DEBUG.value), Level.DEBUG);
            assert.equal(Level.get(Level.INFO.value), Level.INFO);
            assert.equal(Level.get(Level.WARN.value), Level.WARN);
            assert.equal(Level.get(Level.ERROR.value), Level.ERROR);
            assert.equal(Level.get(Level.FATAL.value), Level.FATAL);
        });


        test("by level object", function () {
            assert.equal(Level.get(Level.ALL), Level.ALL);
            assert.equal(Level.get(Level.TRACE), Level.TRACE);
            assert.equal(Level.get(Level.DEBUG), Level.DEBUG);
            assert.equal(Level.get(Level.INFO), Level.INFO);
            assert.equal(Level.get(Level.WARN), Level.WARN);
            assert.equal(Level.get(Level.ERROR), Level.ERROR);
            assert.equal(Level.get(Level.FATAL), Level.FATAL);
        });


        test("non-existent", function () {
            assert.equal(Level.get(123), undefined);
            assert.equal(Level.get("foo"), undefined);
            assert.equal(Level.get(false), undefined);
        });
    });


    suite("#below", function () {
        test("by level object", function () {
            assert.equal(Level.below(Level.OFF), undefined);
            assert.equal(Level.below(Level.ALL), Level.OFF);
            assert.equal(Level.below(Level.TRACE), Level.ALL);
            assert.equal(Level.below(Level.DEBUG), Level.TRACE);
            assert.equal(Level.below(Level.INFO), Level.DEBUG);
            assert.equal(Level.below(Level.WARN), Level.INFO);
            assert.equal(Level.below(Level.ERROR), Level.WARN);
            assert.equal(Level.below(Level.FATAL), Level.ERROR);
        });

        test("by name", function () {
            assert.equal(Level.below(Level.OFF.name), undefined);
            assert.equal(Level.below(Level.ALL.name), Level.OFF);
            assert.equal(Level.below(Level.TRACE.name), Level.ALL);
            assert.equal(Level.below(Level.DEBUG.name), Level.TRACE);
            assert.equal(Level.below(Level.INFO.name), Level.DEBUG);
            assert.equal(Level.below(Level.WARN.name), Level.INFO);
            assert.equal(Level.below(Level.ERROR.name), Level.WARN);
            assert.equal(Level.below(Level.FATAL.name), Level.ERROR);
        });

        test("by value", function () {
            assert.equal(Level.below(Level.OFF.value), undefined);
            assert.equal(Level.below(Level.ALL.value), Level.OFF);
            assert.equal(Level.below(Level.TRACE.value), Level.ALL);
            assert.equal(Level.below(Level.DEBUG.value), Level.TRACE);
            assert.equal(Level.below(Level.INFO.value), Level.DEBUG);
            assert.equal(Level.below(Level.WARN.value), Level.INFO);
            assert.equal(Level.below(Level.ERROR.value), Level.WARN);
            assert.equal(Level.below(Level.FATAL.value), Level.ERROR);
        });

        test("by custom value", function () {
            assert.equal(Level.below(Level.OFF.value + 1), Level.OFF);
            assert.equal(Level.below(Level.ALL.value + 1), Level.ALL);
            assert.equal(Level.below(Level.TRACE.value + 1), Level.TRACE);
            assert.equal(Level.below(Level.DEBUG.value + 1), Level.DEBUG);
            assert.equal(Level.below(Level.INFO.value + 1), Level.INFO);
            assert.equal(Level.below(Level.WARN.value + 1), Level.WARN);
            assert.equal(Level.below(Level.ERROR.value + 1), Level.ERROR);
            assert.equal(Level.below(Level.FATAL.value + 1), Level.FATAL);
        });
    });


    suite("#above", function () {
        test("by level object", function () {
            assert.equal(Level.above(Level.OFF), Level.ALL);
            assert.equal(Level.above(Level.ALL), Level.TRACE);
            assert.equal(Level.above(Level.TRACE), Level.DEBUG);
            assert.equal(Level.above(Level.DEBUG), Level.INFO);
            assert.equal(Level.above(Level.INFO), Level.WARN);
            assert.equal(Level.above(Level.WARN), Level.ERROR);
            assert.equal(Level.above(Level.ERROR), Level.FATAL);
            assert.equal(Level.above(Level.FATAL), undefined);
        });

        test("by name", function () {
            assert.equal(Level.above(Level.OFF.name), Level.ALL);
            assert.equal(Level.above(Level.ALL.name), Level.TRACE);
            assert.equal(Level.above(Level.TRACE.name), Level.DEBUG);
            assert.equal(Level.above(Level.DEBUG.name), Level.INFO);
            assert.equal(Level.above(Level.INFO.name), Level.WARN);
            assert.equal(Level.above(Level.WARN.name), Level.ERROR);
            assert.equal(Level.above(Level.ERROR.name), Level.FATAL);
            assert.equal(Level.above(Level.FATAL.name), undefined);
        });

        test("by value", function () {
            assert.equal(Level.above(Level.OFF.value), Level.ALL);
            assert.equal(Level.above(Level.ALL.value), Level.TRACE);
            assert.equal(Level.above(Level.TRACE.value), Level.DEBUG);
            assert.equal(Level.above(Level.DEBUG.value), Level.INFO);
            assert.equal(Level.above(Level.INFO.value), Level.WARN);
            assert.equal(Level.above(Level.WARN.value), Level.ERROR);
            assert.equal(Level.above(Level.ERROR.value), Level.FATAL);
            assert.equal(Level.above(Level.FATAL.value), undefined);
        });

        test("by custom value", function () {
            assert.equal(Level.above(Level.OFF.value - 1), Level.OFF);
            assert.equal(Level.above(Level.ALL.value - 1), Level.ALL);
            assert.equal(Level.above(Level.TRACE.value - 1), Level.TRACE);
            assert.equal(Level.above(Level.DEBUG.value - 1), Level.DEBUG);
            assert.equal(Level.above(Level.INFO.value - 1), Level.INFO);
            assert.equal(Level.above(Level.WARN.value - 1), Level.WARN);
            assert.equal(Level.above(Level.ERROR.value - 1), Level.ERROR);
            assert.equal(Level.above(Level.FATAL.value - 1), Level.FATAL);
        });
    });

});