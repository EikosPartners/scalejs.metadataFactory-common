'use strict';

var _scalejs = require('scalejs.mvvm');

var _scalejs2 = require('scalejs.metadataFactory');

var _tabsViewModel = require('./tabsViewModel');

var _tabsViewModel2 = _interopRequireDefault(_tabsViewModel);

var _tabsBindings = require('./tabsBindings');

var _tabsBindings2 = _interopRequireDefault(_tabsBindings);

var _tabs = require('./tabs.html');

var _tabs2 = _interopRequireDefault(_tabs);

require('./tabs.scss');

require('ko-bindings/fontIcon');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _scalejs.registerBindings)(_tabsBindings2.default);
(0, _scalejs.registerTemplates)(_tabs2.default);
(0, _scalejs2.registerViewModels)({
    tabs: _tabsViewModel2.default
});
//# sourceMappingURL=tabsModule.js.map