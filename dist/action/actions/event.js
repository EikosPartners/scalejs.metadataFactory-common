'use strict';

var _scalejs = require('scalejs.messagebus');

var _knockout = require('knockout');

var _knockout2 = _interopRequireDefault(_knockout);

var _scalejs2 = require('scalejs');

var _actionModule = require('../actionModule');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function event(options) {
    var data = (0, _knockout.unwrap)(this && this.data);

    if (options.paramsKey) {
        options.params = (0, _scalejs2.merge)(options.params || {}, options[options.paramsKey]);
    }
    (0, _scalejs.notify)((0, _knockout.unwrap)(options.target), options.params);
}

(0, _actionModule.registerActions)({ event: event });
//# sourceMappingURL=event.js.map