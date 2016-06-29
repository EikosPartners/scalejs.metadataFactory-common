'use strict';

var _scalejs = require('scalejs.mvvm');

var _scalejs2 = require('scalejs.metadataFactory');

var _listAdvancedViewModel = require('./listAdvancedViewModel');

var _listAdvancedViewModel2 = _interopRequireDefault(_listAdvancedViewModel);

var _listAdvancedBindings = require('./listAdvancedBindings');

var _listAdvancedBindings2 = _interopRequireDefault(_listAdvancedBindings);

var _listAdvanced = require('./listAdvanced.html');

var _listAdvanced2 = _interopRequireDefault(_listAdvanced);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _scalejs.registerBindings)(_listAdvancedBindings2.default);
(0, _scalejs.registerTemplates)(_listAdvanced2.default);
(0, _scalejs2.registerViewModels)({
    listAdvanced: _listAdvancedViewModel2.default
});
//# sourceMappingURL=listAdvancedModule.js.map