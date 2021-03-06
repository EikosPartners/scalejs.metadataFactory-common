'use strict';

var _scalejs = require('scalejs.mvvm');

var _scalejs2 = require('scalejs.metadataFactory');

require('scalejs.inputmask');

require('ko-bindings/datepicker');

require('ko-bindings/autosize');

require('ko-bindings/tokeninput');

require('ko-bindings/fontIcon');

require('pikaday/scss/pikaday.scss');

require('./validation/validationEngine');

var _inputViewModel = require('./inputViewModel');

var _inputViewModel2 = _interopRequireDefault(_inputViewModel);

var _inputBindings = require('./inputBindings');

var _inputBindings2 = _interopRequireDefault(_inputBindings);

var _input = require('./input.html');

var _input2 = _interopRequireDefault(_input);

require('./autocomplete/autocomplete.scss');

require('./input.scss');

require('./input-multiselect.scss');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _scalejs.registerBindings)(_inputBindings2.default);
(0, _scalejs.registerTemplates)(_input2.default);
(0, _scalejs2.registerViewModels)({
    input: _inputViewModel2.default
});
//# sourceMappingURL=inputModule.js.map