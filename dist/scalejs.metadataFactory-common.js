'use strict';

require('./accordion/accordionModule');

require('./action/actionModule');

require('./adapter/adapterModule');

require('./input/inputModule');

require('./store/storeModule');

require('./template/templateModule');

require('./list/listModule');

require('./grid/gridModule');

require('./gridTemplates/gridTemplatesModule');

var _scalejs = require('scalejs.mvvm');

var _scalejs2 = _interopRequireDefault(_scalejs);

var _knockout = require('knockout');

var _knockout2 = _interopRequireDefault(_knockout);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

window.ko = _knockout2.default;

_scalejs2.default.init({});
//# sourceMappingURL=scalejs.metadataFactory-common.js.map