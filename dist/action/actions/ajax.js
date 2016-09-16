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
    var context = this,
        data = context.data && _knockout2.default.unwrap(context.data),
        target = _lodash2.default.cloneDeep(options.target),
        // to prevent mutations to underlying object
    optionData = options.data || {},

    // todo: replace the mustache render with formatText
    uri = _mustache2.default.render(options.target.uri, (0, _scalejs3.merge)(data, optionData, (0, _scalejs2.getCurrent)().query, _knockout2.default.toJS(_scalejs5.default.dictionary()))),
        //DS: temporary adding noticeboard dict for demo, replace with rendered/getValue interface
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