import { createViewModel, globalMetadata } from 'scalejs.metadataFactory';
import { registerActions } from '../actionModule';
import { getCurrent } from 'scalejs.navigation';
import { get, is, has, merge } from 'scalejs';
import noticeboard  from 'scalejs.noticeboard';
import dataservice from 'dataservice';
import ko from 'knockout';
import mustache from 'mustache';
import _ from 'lodash';

function renderParams(params, data) {
    let ret = params;
    try {
        ret = JSON.parse(
            mustache.render(JSON.stringify(params), data)
        );
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
 * @param {Array} node.options.sendDataKeys
 *  Array of data keys to use, can be objects with key-value pairs
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
    const context = this,
        data = context.data && ko.unwrap(context.data),
        target = _.cloneDeep(options.target), // to prevent mutations to underlying object
        optionData = options.data || {},
        // todo: is dictionary reliable?
        renderDataObject = merge(data, optionData, getCurrent().query,
            ko.toJS(noticeboard.dictionary())),
        uri = mustache.render(options.target.uri, renderDataObject),
        callback = args && args.callback;
    let nextAction;

    if (target.data) {
        // will skip rest of else if's if we have target.data
        target.data = target.data;
    } else if (options.sendDataFromKey) {
        target.data = data[options.sendDataFromKey];
    } else if (Array.isArray(options.sendDataKeys)) {
        target.data = options.sendDataKeys.reduce((o, k) => {
            let receiverKey = k,
                supplierKey = k,
                value;

            if (is(k, 'object')) {
                Object.keys(k).forEach((key) => {
                    receiverKey = key;
                    supplierKey = k[key];
                });
            }

            if (!has(data[supplierKey])) {
                console.warn('Data key missing from data', supplierKey);
                o[receiverKey] = null;
                return o;
            }

            value = data[supplierKey];
            if (typeof value === 'string') { value = value.trim(); }
            o[receiverKey] = value;
            return o;
        }, {});
    } else if (options.dataAndResults) {
        // grabbing results from a previous ajaxAction
        target.data = {
            data: data,
            results: options.results
        };
    } else if (get(options, 'target.options.type') === 'POST' || get(options, 'target.options.type') === 'PUT') {
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
        let mergeData = {};
        // console.log('Using render params feature in ajax:', options);
        if (options.mergeData) {
            mergeData = target.data;
        }
        target.data = merge(mergeData, renderParams(options.params, renderDataObject));
    }

    if (context.adapterLoading) {
        context.adapterLoading(true);
    }

    nextAction = function (error, results) {
        const opts = options ? _.cloneDeep(options) : {},
            err = error,
            keyMap = options.keyMap || { resultsKey: 'results' },
            overrideErrorMessage = (globalMetadata() || {}).ajaxAction_overrideErrorMessage;

        ((err ? opts.errorActions : opts.nextActions) || []).forEach((item) => {
            if (err && opts.errorActions) {
                if (overrideErrorMessage) {
                    error.message = merge(error.message, overrideErrorMessage[error.statusCode] || {});
                }
                opts.errorActions.forEach((errorAction) => {
                    if (errorAction.options.message && error.message) {
                        errorAction.options.message = error.message;
                    }
                });
            }

            // get the results of the request and push
            const response = {
                request: options.target,
                error: error,
                [keyMap.resultsKey]: results,
                status: results ? 200 : error.status,
                statusCode: results ? null : error.statusCode
            };

            item.options = merge(response, item.options);
            createViewModel.call(context, item).action();
        });

        if (context.adapterLoading) {
            context.adapterLoading(false);
        }

        if (callback) {
            callback.apply(null, arguments);
        }
    };

    dataservice.ajax(merge(target, { uri: uri }), nextAction);
}

registerActions({ ajax });