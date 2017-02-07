import { observable, unwrap } from 'knockout';
import { has, merge } from 'scalejs';
import { createViewModels } from 'scalejs.metadataFactory';

function createNodeDictionary(mappedChildNodes) {
    const dictionary = {};

    function addToDictionary(node) {
        if (node.id) {
            dictionary[node.id] = node;
        }
        if (!node.getValue) {
            (unwrap(node.mappedChildNodes) || []).forEach(addToDictionary);
        }
    }
    (unwrap(mappedChildNodes) || []).forEach(addToDictionary);

    return dictionary;
}

export default function (node) {
    const dictionary = observable(),
        context = this,
        mappedChildNodes = createViewModels.call(this, node.children);

    function setValue(values, opts) {
        const value = has(values, 'value') ? values.value : values;
        Object.keys(dictionary()).forEach((id) => {
            const child = dictionary()[id];
            if (child.setValue && Object.prototype.hasOwnProperty.call(value, child.id)) {
                child.setValue(value[child.id], opts);
            }
        });
    }

    function getValue() {
        const ret = Object.keys(dictionary()).reduce((obj, id) => {
            const child = dictionary()[id];
            if (child.getValue) {
                obj[child.id] = child.getValue();
            }
            return obj;
        }, {});
        return ret;
    }

    dictionary(createNodeDictionary(mappedChildNodes));

    return merge(node, {
        mappedChildNodes,
        dictionary,
        setValue,
        getValue,
        context
    });
}