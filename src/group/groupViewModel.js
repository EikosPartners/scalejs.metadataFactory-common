import { observable } from 'knockout';
import { has, merge } from 'scalejs';
import { createViewModels } from 'scalejs.metadataFactory'

    function createNodeDictionary(mappedChildNodes) {
        var dictionary = {};

        function addToDictionary(node) {
            if(node.id) {
                dictionary[node.id] = node;
            }
            if (!node.getValue) {
                (node.mappedChildNodes || []).forEach(addToDictionary);
            }
        }
        (mappedChildNodes || []).forEach(addToDictionary);

        return dictionary;
    }

    export default function (node) {
        var options = node.options || {},
            dictionary = observable(),
            context = this,
            mappedChildNodes;

        function setValue(values) {
            var value = has(values, 'value') ? values.value : values;
            Object.keys(dictionary()).forEach(function(id) {
                var child = dictionary()[id];
                if(child.setValue && value.hasOwnProperty(child.id)) {
                    child.setValue(value[child.id]);
                }
            });
        }

        function getValue() {
            var ret = Object.keys(dictionary()).reduce(function (obj, id) {
                var child = dictionary()[id];
                if(child.getValue) {
                    obj[child.id] = child.getValue();
                }
                return obj;
            }, {});
            return ret;
        }

        mappedChildNodes = createViewModels.call(this, node.children);

        dictionary(createNodeDictionary(mappedChildNodes));

        return merge(node, {
            mappedChildNodes,
            dictionary,
            setValue,
            getValue,
            context
        });
    };

