'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = setValueViewModel;

var _knockout = require('knockout');

var _knockout2 = _interopRequireDefault(_knockout);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function setValueViewModel(node) {
    var context = this,
        origData = _lodash2.default.cloneDeep(context.data());

    if (context.data) {
        context.data.subscribe(_setAllValues);
    }

    if (node.initialData) {
        setTimeout(function () {
            _setAllValues(origData);
        });
    }

    function _setAllValues(data) {
        var dict = context.dictionary();
        Object.keys(dict).forEach(function (n) {
            _setValue(dict[n], data, node.clear);
        });
    }
    // n is the descendant node we are setting
    // n2 is a childNode of the node we are setting
    function _setValue(n, data, clear) {
        if (n.id && n.setValue && (_lodash2.default.has(data, n.id) || clear)) {
            n.setValue(_lodash2.default.get(data, n.id), { initial: true }); // pass as object with value key?
        }
    }
}
//# sourceMappingURL=setValueViewModel.js.map