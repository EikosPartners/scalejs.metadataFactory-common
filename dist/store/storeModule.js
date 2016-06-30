'use strict';

var _scalejs = require('scalejs.mvvm');

var _scalejs2 = require('scalejs.metadataFactory');

var _storeViewModel = require('./storeViewModel');

var _storeViewModel2 = _interopRequireDefault(_storeViewModel);

var _store = require('./store.html');

var _store2 = _interopRequireDefault(_store);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _scalejs.registerTemplates)(_store2.default);
(0, _scalejs2.registerViewModels)({
    store: _storeViewModel2.default
});
//# sourceMappingURL=storeModule.js.map