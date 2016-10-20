'use strict';

var _scalejs = require('scalejs.mvvm');

var _scalejs2 = require('scalejs.metadataFactory');

var _accordionViewModel = require('./accordionViewModel');

var _accordionViewModel2 = _interopRequireDefault(_accordionViewModel);

var _accordionBindings = require('./accordionBindings');

var _accordionBindings2 = _interopRequireDefault(_accordionBindings);

var _accordion = require('./accordion.html');

var _accordion2 = _interopRequireDefault(_accordion);

require('ko-bindings/fontIcon');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _scalejs.registerBindings)(_accordionBindings2.default);
(0, _scalejs.registerTemplates)(_accordion2.default);
(0, _scalejs2.registerViewModels)({
    accordion: _accordionViewModel2.default
});
//# sourceMappingURL=accordionModule.js.map