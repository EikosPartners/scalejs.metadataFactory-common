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

    function setValue(values, opts) {
        var value = ((0, _scalejs.has)(values, 'value') ? values.value : values) || {};
        Object.keys(dictionary()).forEach(function (id) {
            var child = dictionary()[id];
            if (child.setValue && Object.prototype.hasOwnProperty.call(value, child.id)) {
                child.setValue(value[child.id], opts);
            }
        });
    }

    function getValue() {
        var ret = Object.keys(dictionary()).reduce(function (obj, id) {
            var child = dictionary()[id];
            if (child.getValue) {
                obj[child.id] = child.getValue();
            }
            return obj;
        }, {});
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