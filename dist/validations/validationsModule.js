'use strict';

var _scalejs = require('scalejs.metadataFactory');

var _scalejs2 = require('scalejs.mvvm');

var _validationsViewModel = require('./validationsViewModel');

var _validationsViewModel2 = _interopRequireDefault(_validationsViewModel);

var _validationsBindings = require('./validationsBindings');

var _validationsBindings2 = _interopRequireDefault(_validationsBindings);

var _validations = require('./validations.html');

var _validations2 = _interopRequireDefault(_validations);

require('./validations.scss');

require('ko-bindings/fontIcon');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _scalejs2.registerBindings)(_validationsBindings2.default);
(0, _scalejs2.registerTemplates)(_validations2.default);
(0, _scalejs.registerViewModels)({ validations: _validationsViewModel2.default });
//# sourceMappingURL=validationsModule.js.map