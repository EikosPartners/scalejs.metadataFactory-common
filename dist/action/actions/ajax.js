'use strict';

var _scalejs = require('scalejs.metadataFactory');

var _actionModule = require('../actionModule');

var _scalejs2 = require('scalejs.navigation');

var _scalejs3 = require('scalejs');

var _scalejs4 = require('scalejs.noticeboard');

var _scalejs5 = _interopRequireDefault(_scalejs4);

var _dataservice = require('dataservice');

var _dataservice2 = _interopRequireDefault(_dataservice);

var _knockout = require('knockout');

var _knockout2 = _interopRequireDefault(_knockout);

var _mustache = require('mustache');

var _mustache2 = _interopRequireDefault(_mustache);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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
 * Ajax action to execute an ajax request
 *
 * @module ajax
 *
 * @param {object} node
 *  The configuration object for the ajax action
 * @param {string} node.type='action'
 *  The type of the node is action
 * @param {string} node.actionType='ajax'
 *  The actionType of the node is ajax
 * @param {string} node.text
 *  The text to display on the button
 * @param {object} node.options
 *  The options pertaining to the ajax action
 * @param {object} node.options.target
 *  The target object for the ajax request
 * @param {string} node.options.target.uri
 *  The uri of the request to be made
 * @param {string} node.options.target.name
 *  The name of the request to be made
 * @param {object} node.options.target.options
 *  The options pertaining to the target
 * @param {object} node.options.target.data
 *  The data to send on the request
 * @param {object} node.options.target.options.headers
 *  Key-value pairs to set as headers on the request
 * @param {string} node.options.target.options.type
 *  The HTTP type of request to make (POST, PUT, etc)
 * @param {string|Array} node.options.sendDataFromKey
 *  The key or array of keys for where the data is stored
 * @param {boolean} node.options.dataAndResults
 *  Boolean value to determine whether to combine data with results from a previous ajax action
 * @param {object} node.options.results
 *  Object of results from a previous ajax action
 * @param {object} node.options.params
 *  Key-value pairs to set as parameters on the request
 * @param {array|object} node.options.keyMap
 *  A mapper object or array of mapper objects to map keys
 * @param {string} node.options.keyMap.resultsKey
 *  Map the results from the ajax call with this key
 * @param {array} node.options.nextActions
 *  An array of action objects to perform after the action is completed successfully
 * @param {array} node.options.errorActions
 *  An array of action objects to perform if the action ends with an error
 * @param {string} node.options.mergeid
 *  The merge id of the action
 *
 * @example
 * {
 *        "type": "action",
 *        "actionType": "ajax",
 *        "text": "SUBMIT",
 *        "options": {
 *            "target": {
 *                "uri": "add-endpoint",
 *                "options": {
 *                    "type": "POST"
 *                }
 *            },
 *            "nextActions": [
 *                {
 *                    "type": "action",
 *                    "actionType": "route",
 *                    "options": {
 *                        "target": "dashboard"
 *                    }
 *                }
 *            ]
 *        }
 *    }
 */
function ajax(options, args) {
    var context = this,
        data = context.data && _knockout2.default.unwrap(context.data),
        target = _lodash2.default.cloneDeep(options.target),
        // to prevent mutations to underlying object
    optionData = options.data || {},

    // todo: is dictionary reliable?
    renderDataObject = (0, _scalejs3.merge)(data, optionData, (0, _scalejs2.getCurrent)().query, _knockout2.default.toJS(_scalejs5.default.dictionary())),
        uri = _mustache2.default.render(options.target.uri, renderDataObject),
        callback = args && args.callback;
    var nextAction = void 0;

    if (target.data) {
        // will skip rest of else if's if we have target.data
        target.data = target.data;
    } else if (options.sendDataFromKey) {
        target.data = data[options.sendDataFromKey];
    } else if (Array.isArray(options.sendDataKeys)) {
        target.data = options.sendDataKeys.reduce(function (o, k) {
            var receiverKey = k,
                supplierKey = k,
                value = void 0;

            if ((0, _scalejs3.is)(k, 'object')) {
                Object.keys(k).forEach(function (key) {
                    receiverKey = key;
                    supplierKey = k[key];
                });
            }

            if (!(0, _scalejs3.has)(data[supplierKey])) {
                console.warn('Data key missing from data', supplierKey);
                o[receiverKey] = null;
                return o;
            }

            value = data[supplierKey];
            if (typeof value === 'string') {
                value = value.trim();
            }
            o[receiverKey] = value;
            return o;
        }, {});
    } else if (options.dataAndResults) {
        // grabbing results from a previous ajaxAction
        target.data = {
            data: data,
            results: options.results
        };
    } else if ((0, _scalejs3.get)(options, 'target.options.type') === 'POST' || (0, _scalejs3.get)(options, 'target.options.type') === 'PUT') {
        target.data = data;
    } else {
        target.data = {};
    }

    if (options.dataAndResults) {
        // grabbing results from a previous ajaxAction
        // combining with data from above
        target.data = {
            data: target.data,
            results: options.results
        };
    }

    if (options.params) {
        // either overwrite the data from above
        // or merge with the data from above
        var mergeData = {};
        // console.log('Using render params feature in ajax:', options);
        if (options.mergeData) {
            mergeData = target.data;
        }
        target.data = (0, _scalejs3.merge)(mergeData, renderParams(options.params, renderDataObject));
    }

    nextAction = function nextAction(error, results) {
        var opts = options ? _lodash2.default.cloneDeep(options) : {},
            err = error,
            keyMap = options.keyMap || { resultsKey: 'results' };

        ((err ? opts.errorActions : opts.nextActions) || []).forEach(function (item) {
            var _response;

            if (err && opts.errorActions) {
                opts.errorActions.forEach(function (errorAction) {
                    if (errorAction.options.message && error.message) {
                        errorAction.options.message = error.message;
                    }
                });
            }

            // get the results of the request and push
            var response = (_response = {
                request: options.target,
                error: error
            }, _defineProperty(_response, keyMap.resultsKey, results), _defineProperty(_response, 'status', results ? 200 : error.status), _response);

            item.options = (0, _scalejs3.merge)(response, item.options);
            _scalejs.createViewModel.call(context, item).action();
        });

        if (callback) {
            callback.apply(null, arguments);
        }
    };

    _dataservice2.default.ajax((0, _scalejs3.merge)(target, { uri: uri }), nextAction);
}

(0, _actionModule.registerActions)({ ajax: ajax });
//# sourceMappingURL=ajax.js.map