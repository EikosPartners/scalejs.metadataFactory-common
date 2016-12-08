"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
/* eslint no-unused-vars: ["error", { "args": "none" }]*/

var registry = {};

function register(funcName, func) {
    registry[funcName] = func;
}

function get(funcName) {
    return registry[funcName];
}
exports.default = {
    register: register,
    get: get
};
//# sourceMappingURL=gridRegistry.js.map