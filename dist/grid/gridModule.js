'use strict';

var _scalejs = require('scalejs.mvvm');

var _scalejs2 = require('scalejs.metadataFactory');

var _gridViewModel = require('./gridViewModel');

var _gridViewModel2 = _interopRequireDefault(_gridViewModel);

var _gridBindings = require('./gridBindings');

var _gridBindings2 = _interopRequireDefault(_gridBindings);

var _grid = require('./grid.html');

var _grid2 = _interopRequireDefault(_grid);

require('./grid.scss');

require('./dataTables.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _scalejs.registerBindings)(_gridBindings2.default);

// TODO: find out if this should go here or not

(0, _scalejs.registerTemplates)(_grid2.default);
(0, _scalejs2.registerViewModels)({
    grid: _gridViewModel2.default
});
//# sourceMappingURL=gridModule.js.map