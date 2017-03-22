'use strict';

var _scalejs = require('scalejs.mvvm');

var _scalejs2 = require('scalejs.metadataFactory');

var _renderViewModel = require('./renderViewModel');

var _renderViewModel2 = _interopRequireDefault(_renderViewModel);

var _render = require('./render.html');

var _render2 = _interopRequireDefault(_render);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _scalejs.registerTemplates)(_render2.default);
(0, _scalejs2.registerViewModels)({
    render: _renderViewModel2.default
});
//# sourceMappingURL=renderModule.js.map