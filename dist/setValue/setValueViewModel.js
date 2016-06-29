'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = setValueViewModel;

var _knockout = require('knockout');

var _knockout2 = _interopRequireDefault(_knockout);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function setValueViewModel(node) {
    var context = this;

    if (context.data) {
        context.data.subscribe(function (data) {
            var dict = context.dictionary();
            Object.keys(dict).forEach(function (node) {
                setValue(dict[node], data);
            });
        });
    }

    function setValue(node, data, clear) {
        if (node.id && node.setValue && (data.hasOwnProperty(node.id) || clear)) {
            node.setValue(data[node.id]); //pass as object with value key?
        }
        (_knockout2.default.unwrap(node.mappedChildNodes) || []).forEach(function (node) {
            setValue(node, data, clear);
        });
    }
};
//# sourceMappingURL=setValueViewModel.js.map