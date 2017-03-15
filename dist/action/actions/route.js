'use strict';

var _scalejs = require('scalejs.navigation');

var _knockout = require('knockout');

var _scalejs2 = require('scalejs');

var _mustache = require('mustache');

var _mustache2 = _interopRequireDefault(_mustache);

var _actionModule = require('../actionModule');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
    var data = (0, _knockout.unwrap)(options.data || this && this.data),
        params = void 0;

    if (options.params && options.paramsKey) {
        data = (0, _scalejs2.merge)(data, options[options.paramsKey]);
    }

    params = options.params ? renderParams(options.params, data) : undefined;

    (0, _scalejs.setRoute)((0, _knockout.unwrap)(options.target), params);
}

(0, _actionModule.registerActions)({ route: route });
//# sourceMappingURL=route.js.map