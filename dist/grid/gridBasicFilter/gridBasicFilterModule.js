'use strict';

var _scalejs = require('scalejs.mvvm');

var _scalejs2 = require('scalejs.metadataFactory');

var _gridBasicFilterViewModel = require('./gridBasicFilterViewModel');

var _gridBasicFilterViewModel2 = _interopRequireDefault(_gridBasicFilterViewModel);

var _gridBasicFilterBindings = require('./gridBasicFilterBindings');

var _gridBasicFilterBindings2 = _interopRequireDefault(_gridBasicFilterBindings);

var _gridBasicFilter = require('./gridBasicFilter.html');

var _gridBasicFilter2 = _interopRequireDefault(_gridBasicFilter);

require('./gridBasicFilter.scss');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _scalejs.registerBindings)(_gridBasicFilterBindings2.default);
(0, _scalejs.registerTemplates)(_gridBasicFilter2.default);
(0, _scalejs2.registerViewModels)({
    gridBasicFilter: _gridBasicFilterViewModel2.default
});
//# sourceMappingURL=gridBasicFilterModule.js.map