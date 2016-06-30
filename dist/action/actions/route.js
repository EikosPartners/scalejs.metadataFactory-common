'use strict';

var _scalejs = require('scalejs.sandbox');

var _scalejs2 = _interopRequireDefault(_scalejs);

var _mustache = require('mustache');

var _mustache2 = _interopRequireDefault(_mustache);

var _knockout = require('knockout');

var _knockout2 = _interopRequireDefault(_knockout);

var _actionModule = require('../actionModule');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var setRoute = _scalejs2.default.navigation.setRoute,
    merge = _scalejs2.default.object.merge,
    unwrap = _knockout2.default.unwrap;

function renderParams(params, data) {
    var ret = params;
    try {
        ret = JSON.parse(_mustache2.default.render(JSON.stringify(params), data));
    } catch (ex) {
        console.error('Unable to JSON parse/stringify params', ex);
    }
    return ret;
}

function route(options) {
    var data = unwrap(options.data || this && this.data),
        params = options.params ? renderParams(options.params, data) : undefined;

    setRoute(unwrap(options.target), params);
}

(0, _actionModule.registerActions)({ route: route });
//# sourceMappingURL=route.js.map