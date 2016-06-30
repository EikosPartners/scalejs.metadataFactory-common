'use strict';

var _scalejs = require('scalejs.sandbox');

var _scalejs2 = _interopRequireDefault(_scalejs);

var _scalejs3 = require('scalejs.messagebus');

var _knockout = require('knockout');

var _knockout2 = _interopRequireDefault(_knockout);

var _actionModule = require('../actionModule');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//imports
var unwrap = _knockout2.default.unwrap,
    merge = _scalejs2.default.object.merge;

function event(options) {
    var data = unwrap(this && this.data);

    // if (options.before) {
    //     invoke(options.before, {}, options.beforeOptions);
    // }

    if (options.paramsKey) {
        options.params = merge(options.params || {}, options[options.paramsKey]);
    }

    (0, _scalejs3.notify)(unwrap(options.target), options.params);

    // if (options.after) {
    //     invoke(options.after, {}, options.afterOptions);
    // }
}

(0, _actionModule.registerActions)({ event: event });
//# sourceMappingURL=event.js.map