'use strict';

var _scalejs = require('scalejs.messagebus');

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
 * Event action to notify an event to all its subscribers
 *
 * @module event
 *
 * @param {object} node
 *  The configuration object for the event action
 * @param {string} node.type='event'
 *  The type of the node is event
 * @param {string} node.actionType='event'
 *  The actionType of the node is event
 * @param {object} node.options
 *  The options pertaining to the event action
 * @param {string} node.options.target
 *  The name of the channel to notify
 * @param {object|array} node.options.params
 *  Key-value pairs to pass along as data with the event that will be mustache rendered
 * @param {boolean} node.options.useOptions
 *  Boolean to determine whether to use the options as the data to pass along
 * @param {object} node.options.data
 *  Data object to pass along with the event
 *
 * @example
 *  {
 *        "type": "action",
 *        "actionType": "event",
 *        "options": {
 *            "target": "my_grid.add",
 *            "params": [
 *                {
 *                    "name": "{{request.name}}",
 *                    "endpoint": "{{request.uri}}",
 *                    "status": "{{status}}"
 *                }
 *            ],
 *            "useOptions": true
 *        }
 *    }
 */
function event(options) {
    var data = (0, _knockout.unwrap)(this && this.data),
        optionData = options.data || {};
    var params = options.params;

    if (options.paramsKey) {
        params = (0, _scalejs2.merge)(params || {}, options[options.paramsKey]);
    }

    if (options.useOptions) {
        optionData = options;
    }

    if (params && options.renderParams !== false) {
        params = renderParams(params, (0, _scalejs2.merge)(data, optionData));
    }

    (0, _scalejs.notify)((0, _knockout.unwrap)(options.target), params);
}

(0, _actionModule.registerActions)({ event: event });
//# sourceMappingURL=event.js.map