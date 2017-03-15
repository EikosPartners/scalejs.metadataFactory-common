'use strict';

var _actionModule = require('../actionModule');

var _knockout = require('knockout');

var _scalejs = require('scalejs');

var _mustache = require('mustache');

var _mustache2 = _interopRequireDefault(_mustache);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Redirect action to redirect the current page to another
 *
 * @module redirect
 *
 * @param {object} node
 *  The configuration object for the redirect action
 * @param {string} node.type='action'
 *  The type of the node is action
 * @param {string} node.actionType='redirect'
 *  The actionType of the node is redirect
 * @param {string} node.text
 *  The text to display on the button
 * @param {object} node.options
 *  The options pertaining to the redirect action
 * @param {string} node.options.target
 *  The url to redirect to
 * @param {object} node.options.data
 *  The data to mustache render the target url with
 * @param {object} node.options.params
 *  Key-value pairs to merge pass along as data when redirecting
 * @param {string} node.options.paramsKey
 *  The key of the data for the parameters
 *
 * @example
 * {
 *     "type": "action",
 *     "actionType": "redirect",
 *     "text": "Redirect",
 *     "options": {
 *         "target": "https://www.google.com"
 *     }
 * }
 */
function redirect(options) {
    if (!options.target) {
        console.error('Must provide target!');
        return;
    }

    var data = (0, _knockout.unwrap)(options.data || this && this.data),
        url = void 0;

    if (options.params && options.paramsKey) {
        data = (0, _scalejs.merge)(data, options[options.paramsKey]);
    }

    url = _mustache2.default.render(options.target, data);

    window.location.replace(url);
}
(0, _actionModule.registerActions)({ redirect: redirect });
//# sourceMappingURL=redirect.js.map