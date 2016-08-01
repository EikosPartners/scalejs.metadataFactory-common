'use strict';

var _scalejs = require('scalejs.mvvm');

var _scalejs2 = require('scalejs.metadataFactory');

require('./validation/validationEngine');

require('scalejs.inputmask');

var _autocompleteViewModel = require('./autocomplete/autocompleteViewModel');

var _autocompleteViewModel2 = _interopRequireDefault(_autocompleteViewModel);

var _selectViewModel = require('./select/selectViewModel');

var _selectViewModel2 = _interopRequireDefault(_selectViewModel);

var _inputViewModel = require('./inputViewModel');

var _inputViewModel2 = _interopRequireDefault(_inputViewModel);

var _inputBindings = require('./inputBindings');

var _inputBindings2 = _interopRequireDefault(_inputBindings);

var _input = require('./input.html');

var _input2 = _interopRequireDefault(_input);

require('ko-bindings/datepicker.js');

require('ko-bindings/autosize');

require('pikaday/scss/pikaday.scss');

require('./input.scss');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _scalejs.registerBindings)(_inputBindings2.default);
(0, _scalejs.registerTemplates)(_input2.default);
(0, _scalejs2.registerViewModels)({
    input: _inputViewModel2.default
});
//# sourceMappingURL=inputModule.js.map