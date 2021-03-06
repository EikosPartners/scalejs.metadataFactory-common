import { observable, unwrap, computed } from 'knockout';
import { has, merge } from 'scalejs';
import { createViewModels } from 'scalejs.metadataFactory';
import _ from 'lodash';

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
        mappedChildNodes = createViewModels.call(this, node.children),
        sub = computed(() => dictionary(createNodeDictionary(mappedChildNodes)));
    let currentValue;

    function setValue(values, opts) {
        const value = (has(values, 'value') ? values.value : values) || {},
            originalDict = Object.keys(dictionary());

        currentValue = value;

        Object.keys(dictionary()).forEach((id) => {
            const child = dictionary()[id];
            if (child.setValue && Object.prototype.hasOwnProperty.call(value, child.id)) {
                child.setValue(value[child.id], opts);
            }
        });

        if (!_.isEqual(originalDict, Object.keys(dictionary()))) {
            setValue(values, opts);
        }
    }

    function getValue() {
        const ret = Object.keys(dictionary()).reduce((obj, id) => {
            const child = dictionary()[id];
            if ((child.getValue &&
                (child.rendered() || node.trackChildrenIfHidden !== false || child.trackIfHidden))) {
                obj[child.id] = child.getValue();
            } else {
                delete obj[child.id]; // track if hidden functionality for group..
            }
            return obj;
        }, {});

        if (node.persistData) {
            return merge(currentValue, ret);
        }

        return ret;
    }

    function update(value) {
        console.info('Group only supports udate for value');
        setValue(value);
    }

    return merge(node, {
        mappedChildNodes,
        dictionary,
        setValue,
        getValue,
        context,
        update,
        dispose() {
            sub.dispose();
        }
    });
}