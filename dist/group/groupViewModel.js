'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (node) {
    var dictionary = (0, _knockout.observable)(),
        context = this,
        mappedChildNodes = _scalejs2.createViewModels.call(this, node.children),
        sub = (0, _knockout.computed)(function () {
        return dictionary(createNodeDictionary(mappedChildNodes));
    });
    var currentValue = void 0;

    function setValue(values, opts) {
        var value = ((0, _scalejs.has)(values, 'value') ? values.value : values) || {},
            originalDict = Object.keys(dictionary());

        currentValue = value;

        Object.keys(dictionary()).forEach(function (id) {
            var child = dictionary()[id];
            if (child.setValue && Object.prototype.hasOwnProperty.call(value, child.id)) {
                child.setValue(value[child.id], opts);
            }
        });

        if (!_lodash2.default.isEqual(originalDict, Object.keys(dictionary()))) {
            setValue(values, opts);
        }
    }

    function getValue() {
        var ret = Object.keys(dictionary()).reduce(function (obj, id) {
            var child = dictionary()[id];
            if (child.getValue && (child.rendered() || node.trackChildrenIfHidden !== false || child.trackIfHidden)) {
                obj[child.id] = child.getValue();
            } else {
                delete obj[child.id]; // track if hidden functionality for group..
            }
            return obj;
        }, {});

        if (node.persistData) {
            return (0, _scalejs.merge)(currentValue, ret);
        }

        return ret;
    }

    function update(value) {
        console.info('Group only supports udate for value');
        setValue(value);
    }

    return (0, _scalejs.merge)(node, {
        mappedChildNodes: mappedChildNodes,
        dictionary: dictionary,
        setValue: setValue,
        getValue: getValue,
        context: context,
        update: update,
        dispose: function dispose() {
            sub.dispose();
        }
    });
};

var _knockout = require('knockout');

var _scalejs = require('scalejs');

var _scalejs2 = require('scalejs.metadataFactory');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createNodeDictionary(mappedChildNodes) {
    var dictionary = {};

    function addToDictionary(node) {
        if (node.id) {
            dictionary[node.id] = node;
        }
        if (!node.getValue) {
            ((0, _knockout.unwrap)(node.mappedChildNodes) || []).forEach(addToDictionary);
        }
    }
    ((0, _knockout.unwrap)(mappedChildNodes) || []).forEach(addToDictionary);

    return dictionary;
}
//# sourceMappingURL=groupViewModel.js.map