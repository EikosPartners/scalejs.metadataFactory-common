import { createViewModel } from 'scalejs.metadataFactory';
import { registerActions } from '../actionModule';
import { get, is, has, merge } from 'scalejs';
import dataservice from 'dataservice';
import { unwrap } from 'knockout';
import mustache from 'mustache';
import _ from 'lodash';

function ajax(options, args) {
    let context = this,
        data = context.data && unwrap(context.data),
        target = _.cloneDeep(options.target), // to prevent mutations to underlying object
        optionData = options.data || {},
        uri = mustache.render(options.target.uri, merge(data, optionData)),
        contextValue,
        callback = args && args.callback,
        nextAction;

    if (target.data) {
         //will skip rest of else if's if we have target.data
        target.data = target.data;
    } else if (options.sendDataFromKey) {
        target.data = data[options.sendDataFromKey];
    } else if (Array.isArray(options.sendDataKeys)) {
        target.data = options.sendDataKeys.reduce(function(o, k) {
            let receiverKey = k, supplierKey = k, value;
            if(is(k, 'object')) {
                Object.keys(k).forEach(function (key) {
                    receiverKey = key;
                    supplierKey = k[key];
                });
            }

            if(!has(data[supplierKey])) {
                console.warn('Data key missing from data', supplierKey);
                o[receiverKey] = null;
                return o;
            }

            value = data[supplierKey];
            if(typeof value === 'string') { value = value.trim(); }
            o[receiverKey] = value;
            return o;
        }, {});
    } else if (get(options, 'target.options.type') === 'POST' || get(options, 'target.options.type') === 'PUT') {
        target.data = data;
    } else {
        target.data = {};
    }

    nextAction =  function (error, results) {
        let opts = options ? _.cloneDeep(options) : {},
            err = error ? error : null;

        ((err ? opts.errorActions : opts.nextActions) || []).forEach(function (item) {
            if (err && opts.errorActions){
                opts.errorActions.forEach(function(errorAction){
                    if (errorAction.options.message && error.message) {
                        errorAction.options.message = error.message;
                    }
                });
            }

            // get the results of the request and push
            let response = {
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

registerActions({ajax});