'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (node) {
    var context = _lodash2.default.cloneDeep(this),
        mappedChildNodes = (0, _knockout.observableArray)(),
        render = (0, _scalejs2.receive)(node.id + '.render', function (options) {
        var children = options.data;
        if (options.keyMap) {
            children = (0, _scalejs3.get)(options, options.keyMap.resultsKey);
        }
        children = Array.isArray(children) ? children : [children];

        if (mappedChildNodes()) {
            dispose(mappedChildNodes());
        }
        mappedChildNodes(_scalejs.createViewModels.call(context, children));
    });

    function dispose(nodes) {
        nodes.forEach(function (n) {
            n.dispose && n.dispose();
            dispose((0, _knockout.unwrap)(n.mappedChildNodes) || []);
        });
    }

    return (0, _scalejs3.merge)(node, {
        mappedChildNodes: mappedChildNodes,
        dispose: function dispose() {
            render.dispose();
        }
    });
};

var _scalejs = require('scalejs.metadataFactory');

var _knockout = require('knockout');

var _scalejs2 = require('scalejs.messagebus');

var _scalejs3 = require('scalejs');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
//# sourceMappingURL=renderViewModel.js.map