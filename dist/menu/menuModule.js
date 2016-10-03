'use strict';

var _scalejs = require('scalejs.mvvm');

var _scalejs2 = require('scalejs.metadataFactory');

var _menuViewModel = require('./menuViewModel');

var _menuViewModel2 = _interopRequireDefault(_menuViewModel);

var _menuBindings = require('./menuBindings');

var _menuBindings2 = _interopRequireDefault(_menuBindings);

var _menu = require('./menu.html');

var _menu2 = _interopRequireDefault(_menu);

require('./menu.scss');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _scalejs.registerBindings)(_menuBindings2.default);
(0, _scalejs.registerTemplates)(_menu2.default);
(0, _scalejs2.registerViewModels)({
    menu: _menuViewModel2.default
});
//# sourceMappingURL=menuModule.js.map