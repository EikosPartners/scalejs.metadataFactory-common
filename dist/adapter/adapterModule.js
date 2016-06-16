'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = adapter;

var _scalejs = require('scalejs.sandbox');

var _scalejs2 = _interopRequireDefault(_scalejs);

var _adapterViewModel = require('./adapterViewModel');

var _adapterViewModel2 = _interopRequireDefault(_adapterViewModel);

var _adapter = require('./adapter.html');

var _adapter2 = _interopRequireDefault(_adapter);

var _scalejs3 = require('scalejs.metadataFactory');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*global define */


_scalejs2.default.mvvm.registerTemplates(_adapter2.default);

function adapter() {
    (0, _scalejs3.registerViewModels)({
        adapter: _adapterViewModel2.default
    });
};
//# sourceMappingURL=adapterModule.js.map