import { createViewModel } from 'scalejs.metadataFactory';
import { registerActions } from '../actionModule';
import { get, is, has, merge } from 'scalejs';
import dataservice from 'dataservice';
import mustache from 'mustache';
import _ from 'lodash';

function ajax(options, args) {
    let data = this.data && this.data(),
        target = options.target,
        optionData = options.data || {},
        uri = mustache.render(options.target.uri, merge(data, optionData)),
        sendAllData = !target.data && !options.sendDataKeys && (get(options, 'target.options.type') === 'POST' || get(options, 'target.options.type') === 'PUT'),
        contextValue,
        context = this,
        callback = args && args.callback,
        nextAction;

    if (sendAllData) {
        target.data = this.data();
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
    } else {
        target.data = target.data || {};
    }

    nextAction =  function (error, results) {
        let opts = options ? _.cloneDeep(options) : {},
            err = error ? results : null; // handle 200ok but still an error

        ((err ? opts.errorActions : opts.nextActions) || []).forEach(function (item) {
            // ROB & DRAISY - overwrite the errorAction's message with message from server
            // todo: revisit and refactor.
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