'use strict';

var _globalNavigationViewModel = require('./globalNavigationViewModel.js');

var _globalNavigationViewModel2 = _interopRequireDefault(_globalNavigationViewModel);

var _globalNavigation = require('./globalNavigation.html');

var _globalNavigation2 = _interopRequireDefault(_globalNavigation);

var _globalNavigationBindings = require('./globalNavigationBindings');

var _globalNavigationBindings2 = _interopRequireDefault(_globalNavigationBindings);

var _scalejs = require('scalejs.mvvm');

var _scalejs2 = require('scalejs.metadataFactory');

var _scalejs3 = require('scalejs.navigation');

var _knockout = require('knockout');

var _knockout2 = _interopRequireDefault(_knockout);

var _dataservice = require('dataservice');

var _dataservice2 = _interopRequireDefault(_dataservice);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _scalejs.registerTemplates)(_globalNavigation2.default);
(0, _scalejs.registerBindings)(_globalNavigationBindings2.default);
(0, _scalejs2.registerViewModels)({
    globalNavigation: _globalNavigationViewModel2.default
});
//# sourceMappingURL=globalNavigationModule.js.map