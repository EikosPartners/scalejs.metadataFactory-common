'use strict';

var _scalejs = require('scalejs.sandbox');

var _scalejs2 = _interopRequireDefault(_scalejs);

var _scalejs3 = require('scalejs.mvvm');

var _mustache = require('mustache');

var _mustache2 = _interopRequireDefault(_mustache);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _dataservice = require('dataservice');

var _dataservice2 = _interopRequireDefault(_dataservice);

var _actionModule = require('../actionModule');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var has = _scalejs2.default.object.has,
    is = _scalejs2.default.type.is;

function ajax(options, args) {
    var data = this.data && this.data(),
        target = options.target,
        paramData = options.data || {},
        uri = _mustache2.default.render(options.target.uri, merge(data, paramData, getCurrent().query, state)),
        contextValue = void 0,
        context = this,
        callback = args && args.callback,
        nextAction = void 0;

    target.data = target.data || {};
    // if(target.data === undefined) {
    //     target.data = {};
    // }

    if (options.sendAllData) {
        target.data = this.data();
    } else if (options.keyMap) {
        target.data[options.keyMap.dataId] = this.data()[options.keyMap.dataId];
    }

    if (options.contextId) {
        contextValue = has(this[options.contextId]) ? this[options.contextId] : this.getValue && this.getValue(options.contextId);
        target.data[options.contextId] = contextValue;
    }

    if (options.submittedData) {
        //todo: what is this?
        target.data = options.params;
    } else if (options.params) {
        target.data = renderParams(options.params, merge(data, paramData));
    }

    if (Array.isArray(options.sendDataKeys)) {
        target.data = options.sendDataKeys.reduce(function (o, k) {
            var receiverKey = k,
                supplierKey = k;
            if (is(k, 'object')) {
                Object.keys(k).forEach(function (key) {
                    receiverKey = key;
                    supplierKey = k[key];
                });
            }
            if (!has(data[supplierKey])) {
                console.warn('Data key missing from data', supplierKey);
                o[receiverKey] = null;
                return o;
            }
            var value = data[supplierKey];
            if (typeof value === 'string') {
                value = value.trim();
            }
            o[receiverKey] = value;
            return o;
        }, {});
    }

    nextAction = function nextAction(error, results) {
        var opts = options ? _lodash2.default.cloneDeep(options) : {},
            err = error || (results && (results.Status === 'FAILURE' || results.Status === 'FAILED') ? results : null); // handle 200ok but still an error

        ((err ? opts.errorActions : opts.nextActions) || []).forEach(function (item) {
            // ROB & DRAISY - overwrite the errorAction's message with message from server
            // todo: revisit and refactor.
            if (err && opts.errorActions) {
                opts.errorActions.forEach(function (errorAction) {
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
            var response = {
                request: options.target,
                error: error,
                results: results
            };

            item.options = merge(response, item.options);
            var createViewModel = _scalejs2.default.metadataFactory.createViewModel.bind(context);
            createViewModel(item).action();
        });

        if (callback) {
            callback.apply(null, arguments);
        }
    };

    _dataservice2.default.ajax(merge(target, { uri: uri }), nextAction);
}

(0, _actionModule.registerActions)({ ajax: ajax });
//# sourceMappingURL=ajax.js.map