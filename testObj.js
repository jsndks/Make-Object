#! /usr/bin/env node

var MODULE = (function () {
    var testMethod = function() {
        this.init();
    };

    testMethod.prototype.init = function() {
        console.log('init');
    };

    return new testMethod;
}());