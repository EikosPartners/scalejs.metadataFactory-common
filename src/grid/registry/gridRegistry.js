/* eslint no-unused-vars: ["error", { "args": "none" }]*/

const registry = {};

function register(funcName, func) {
    registry[funcName] = func;
}

function get(funcName) {
    return registry[funcName];
}
export default{
    register,
    get
};