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

/**
 * Route action to re-route to another page
 *
 * @module route
 *
 * @param {object} node
 *  The configuration object for the route action
 * @param {string} node.type='action'
 *  The type of the node is action
 * @param {string} node.actionType='route'
 *  The actionType of the node is route
 * @param {string} node.text
 *  The text to display on the button
 * @param {object} node.options
 *  The options pertaining to the route action
 * @param {string} node.options.target
 *  The uri to route to
 * @param {object} node.options.data
 *  The data to send along when routing
 * @param {object} node.options.params
 *  Key-value pairs to merge pass along as data when routing
 * @param {string} node.options.paramsKey
 *  The key of the data for the parameters
 *
 * @example
 * {
 *     "type": "action",
 *     "actionType": "route",
 *     "text": "Add User",
 *     "options": {
 *         "target": "add-user"
 *     }
 *  }
 */
function route(options) {
    var data = (0, _knockout.unwrap)(options.data || this && this.data),
        target = (0, _knockout.unwrap)(options.target),
        params = void 0;

    if (options.params && options.paramsKey) {
        data = (0, _scalejs2.merge)(data, options[options.paramsKey]);
    }

    params = options.params ? renderParams(options.params, data) : undefined;

    if (options.renderTarget) {
        target = _mustache2.default.render(target, data);
    }

    (0, _scalejs.setRoute)(target, params);
}

(0, _actionModule.registerActions)({ route: route });
//# sourceMappingURL=route.js.map