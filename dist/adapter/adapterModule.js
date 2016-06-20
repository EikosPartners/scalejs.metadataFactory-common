'use strict';

var _scalejs = require('scalejs.mvvm');

var _scalejs2 = require('scalejs.metadataFactory');

var _adapterViewModel = require('./adapterViewModel');

var _adapterViewModel2 = _interopRequireDefault(_adapterViewModel);

var _adapter = require('./adapter.html');

var _adapter2 = _interopRequireDefault(_adapter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _scalejs.registerTemplates)(_adapter2.default);
(0, _scalejs2.registerViewModels)({
    adapter: _adapterViewModel2.default
});
//# sourceMappingURL=adapterModule.js.map