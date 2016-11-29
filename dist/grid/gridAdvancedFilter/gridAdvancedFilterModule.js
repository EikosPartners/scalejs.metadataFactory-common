'use strict';

var _scalejs = require('scalejs.mvvm');

var _scalejs2 = require('scalejs.metadataFactory');

var _gridAdvancedFilterViewModel = require('./gridAdvancedFilterViewModel');

var _gridAdvancedFilterViewModel2 = _interopRequireDefault(_gridAdvancedFilterViewModel);

var _gridAdvancedFilterBindings = require('./gridAdvancedFilterBindings');

var _gridAdvancedFilterBindings2 = _interopRequireDefault(_gridAdvancedFilterBindings);

var _gridAdvancedFilter = require('./gridAdvancedFilter.html');

var _gridAdvancedFilter2 = _interopRequireDefault(_gridAdvancedFilter);

require('./gridAdvancedFilter.scss');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _scalejs.registerBindings)(_gridAdvancedFilterBindings2.default);
(0, _scalejs.registerTemplates)(_gridAdvancedFilter2.default);
(0, _scalejs2.registerViewModels)({
    gridAdvancedFilter: _gridAdvancedFilterViewModel2.default
});
//# sourceMappingURL=gridAdvancedFilterModule.js.map