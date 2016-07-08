import ko from 'knockout';

export default function setValueViewModel(node) {
    let context = this;

    if (context.data) {
        context.data.subscribe(data => {
            let dict = context.dictionary();
            Object.keys(dict).forEach(function (node) {
                _setValue(dict[node], data);
            })
        })
    }

    function _setValue(node, data, clear) {
        if (node.id && node.setValue && (data.hasOwnProperty(node.id) || clear)) {
            node.setValue(data[node.id]); //pass as object with value key?
        }
        (ko.unwrap(node.mappedChildNodes) || []).forEach(function (node) {
            _setValue(node, data, clear);
        });
    }
};
