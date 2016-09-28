'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (node) {
    var options = node.options || {},
        dictionary = (0, _knockout.observable)(),
        context = this,
        mappedChildNodes;

    function setValue(values) {
        var value = (0, _scalejs.has)(values, 'value') ? values.value : values;
        Object.keys(dictionary()).forEach(function (id) {
            var child = dictionary()[id];
            if (child.setValue && value.hasOwnProperty(child.id)) {
                child.setValue(value[child.id]);
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

    mappedChildNodes = _scalejs2.createViewModels.call(this, node.children);

    dictionary(createNodeDictionary(mappedChildNodes));

    return (0, _scalejs.merge)(node, {
        mappedChildNodes: mappedChildNodes,
        dictionary: dictionary,
        setValue: setValue,
        getValue: getValue,
        context: context
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
            (node.mappedChildNodes || []).forEach(addToDictionary);
        }
    }
    (mappedChildNodes || []).forEach(addToDictionary);

    return dictionary;
}

;
//# sourceMappingURL=groupViewModel.js.map