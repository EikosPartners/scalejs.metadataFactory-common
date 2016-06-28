import sandbox from 'scalejs.sandbox';
import { createViewModel } from 'scalejs.mvvm';
import mustache from 'mustache';
import _ from 'lodash';
import dataservice from 'dataservice';

import { registerActions } from '../actionModule';

const has = sandbox.object.has,
      merge = _.merge,
      is = sandbox.type.is;

function ajax(options, args) {
    let data = this.data && this.data(),
        target = options.target,
        optionData = options.data || {},
        uri = mustache.render(options.target.uri, merge(data, optionData)),
        contextValue,
        context = this,
        callback = args && args.callback,
        nextAction;

    target.data = target.data || {};
    // if(target.data === undefined) {
    //     target.data = {};
    // }

    if (options.sendAllData) {
        target.data = this.data();
    } else if (options.keyMap) {
        target.data[options.keyMap.dataId] = this.data()[options.keyMap.dataId];
    }

    if(options.contextId) {
        contextValue = has(this[options.contextId]) ? this[options.contextId] : this.getValue && this.getValue(options.contextId);
        target.data[options.contextId] = contextValue;
    }

    if(options.submittedData) { //todo: what is this?
        target.data = options.params;
    } else if (options.params) {
        target.data = renderParams(options.params, merge(data, paramData));
    }

    if (Array.isArray(options.sendDataKeys)) {
        target.data = options.sendDataKeys.reduce(function(o, k) {
            let receiverKey = k, supplierKey = k;
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
            let value = data[supplierKey];
            if(typeof value === 'string') { value = value.trim(); }
            o[receiverKey] = value;
            return o;
        }, {});
    }

    nextAction =  function (error, results) {
        let opts = options ? _.cloneDeep(options) : {},
            err = error || (results && (results.Status === 'FAILURE' || results.Status === 'FAILED') ? results : null); // handle 200ok but still an error

        ((err ? opts.errorActions : opts.nextActions) || []).forEach(function (item) {
            // ROB & DRAISY - overwrite the errorAction's message with message from server
            // todo: revisit and refactor.
            if (err && opts.errorActions){
                opts.errorActions.forEach(function(errorAction){
                    // handle OperationException
                    if (errorAction.options.message && get(error, 'OperationException.ErrorMessage')) {
                        errorAction.options.message = get(error, 'OperationException.ErrorMessage');
                    }
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
            let createViewModel = sandbox.metadataFactory.createViewModel.bind(context);
            createViewModel(item).action();
        });

        if (callback) {
            callback.apply(null, arguments);
        }
    };

    dataservice.ajax(merge(target, { uri: uri }), nextAction);
}

registerActions({ajax});