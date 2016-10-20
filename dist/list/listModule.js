'use strict';

var _scalejs = require('scalejs.mvvm');

var _scalejs2 = require('scalejs.metadataFactory');

var _listViewModel = require('./listViewModel');

var _listViewModel2 = _interopRequireDefault(_listViewModel);

var _listBindings = require('./listBindings');

var _listBindings2 = _interopRequireDefault(_listBindings);

var _list = require('./list.html');

var _list2 = _interopRequireDefault(_list);

require('ko-bindings/fontIcon');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _scalejs.registerBindings)(_listBindings2.default);
(0, _scalejs.registerTemplates)(_list2.default);
(0, _scalejs2.registerViewModels)({
    list: _listViewModel2.default
});
//# sourceMappingURL=listModule.js.map