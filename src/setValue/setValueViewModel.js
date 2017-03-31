import ko from 'knockout';
import _ from 'lodash';

export default function setValueViewModel(node) {
    const context = this,
        origData = _.cloneDeep(context.data());

    if (context.data) {
        context.data.subscribe(_setAllValues);
    }

    if (node.initialData) {
        setTimeout(() => {
            _setAllValues(origData);
        });
    }

    function _setAllValues(data) {
        const dict = context.dictionary();
        Object.keys(dict).forEach((n) => {
            _setValue(dict[n], data, node.clear);
        });
    }
    // n is the descendant node we are setting
    // n2 is a childNode of the node we are setting
    function _setValue(n, data, clear) {
        if (n.id && n.setValue && ({}.hasOwnProperty.call(data, n.id) || clear)) {
            n.setValue(data[n.id], { initial: true }); // pass as object with value key?
        }
    }
}