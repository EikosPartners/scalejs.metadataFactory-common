'use strict';

var _scalejs = require('scalejs.mvvm');

var _scalejs2 = require('scalejs.metadataFactory');

var _groupViewModel = require('./groupViewModel');

var _groupViewModel2 = _interopRequireDefault(_groupViewModel);

var _group = require('./group.html');

var _group2 = _interopRequireDefault(_group);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _scalejs.registerTemplates)(_group2.default);
(0, _scalejs2.registerViewModels)({
    group: _groupViewModel2.default
});
//# sourceMappingURL=groupModule.js.map