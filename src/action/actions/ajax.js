import { createViewModel } from 'scalejs.metadataFactory';
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
        console.log('Using render params feature in ajax:', options);
        if (options.mergeData) {
            mergeData = target.data;
        }
        target.data = merge(mergeData, renderParams(options.params, renderDataObject));
    }

    nextAction = function (error, results) {
        const opts = options ? _.cloneDeep(options) : {},
            err = error;

        ((err ? opts.errorActions : opts.nextActions) || []).forEach((item) => {
            if (err && opts.errorActions) {
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
                results: results
            };

            item.options = merge(response, item.options);
            createViewModel.call(context, item).action();
        });

        if (callback) {
            callback.apply(null, arguments);
        }
    };

    dataservice.ajax(merge(target, { uri: uri }), nextAction);
}

registerActions({ ajax });