import { createViewModel } from 'scalejs.metadataFactory';
import { registerActions } from '../actionModule';
import { getCurrent } from 'scalejs.navigation';
import { get, is, has, merge } from 'scalejs';
import noticeboard  from 'scalejs.noticeboard';
import dataservice from 'dataservice';
import ko from 'knockout';
import mustache from 'mustache';
import _ from 'lodash';

/* format text getValue
    // {{store.x}} or {{dataKey.subkey}}
    evaluate(param, function (id) {
        if(options.data && options.data[id]) {
            return options.data[id];
        }
        return context.getValue(id); //context data and global data (via store)
    });
*/

function ajax(options, args) {
    let context = this,
        data = context.data && ko.unwrap(context.data),
        target = _.cloneDeep(options.target), // to prevent mutations to underlying object
        optionData = options.data || {},
        // todo: replace the mustache render with formatText
        uri = mustache.render(options.target.uri, merge(data, optionData, getCurrent().query, ko.toJS(noticeboard.dictionary()))), //DS: temporary adding noticeboard dict for demo, replace with rendered/getValue interface
        callback = args && args.callback,
        nextAction;

    if (target.data) {
         //will skip rest of else if's if we have target.data
         if (options.dataAndResults) {
             // grabbing results from a previous ajaxAction
             target.data = {
                 data: target.data,
                 results: options.results
             };
         } else {
             target.data = target.data;
         }
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
