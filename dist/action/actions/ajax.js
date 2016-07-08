'use strict';

var _scalejs = require('scalejs.metadataFactory');

var _actionModule = require('../actionModule');

var _scalejs2 = require('scalejs');

var _dataservice = require('dataservice');

var _dataservice2 = _interopRequireDefault(_dataservice);

var _knockout = require('knockout');

var _mustache = require('mustache');

var _mustache2 = _interopRequireDefault(_mustache);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ajax(options, args) {
    var context = this,
        data = context.data && (0, _knockout.unwrap)(context.data),
        target = options.target,
        optionData = options.data || {},
        uri = _mustache2.default.render(options.target.uri, (0, _scalejs2.merge)(data, optionData)),
        contextValue = void 0,
        callback = args && args.callback,
        nextAction = void 0;

    if (target.data) {
        //will skip rest of else if's if we have target.data
        target.data = target.data;
    } else if (options.sendDataFromKey) {
        target.data = data[options.sendDataFromKey];
    } else if (Array.isArray(options.sendDataKeys)) {
        target.data = options.sendDataKeys.reduce(function (o, k) {
            var receiverKey = k,
                supplierKey = k,
                value = void 0;
            if ((0, _scalejs2.is)(k, 'object')) {
                Object.keys(k).forEach(function (key) {
                    receiverKey = key;
                    supplierKey = k[key];
                });
            }

            if (!(0, _scalejs2.has)(data[supplierKey])) {
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
    } else if ((0, _scalejs2.get)(options, 'target.options.type') === 'POST' || (0, _scalejs2.get)(options, 'target.options.type') === 'PUT') {
        target.data = data;
    } else {
        target.data = {};
    }

    nextAction = function nextAction(error, results) {
        var opts = options ? _lodash2.default.cloneDeep(options) : {},
            err = error ? error : null;

        ((err ? opts.errorActions : opts.nextActions) || []).forEach(function (item) {
            if (err && opts.errorActions) {
                opts.errorActions.forEach(function (errorAction) {
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

            item.options = (0, _scalejs2.merge)(response, item.options);
            _scalejs.createViewModel.call(context, item).action();
        });

        if (callback) {
            callback.apply(null, arguments);
        }
    };

    _dataservice2.default.ajax((0, _scalejs2.merge)(target, { uri: uri }), nextAction);
}

(0, _actionModule.registerActions)({ ajax: ajax });
//# sourceMappingURL=ajax.js.map