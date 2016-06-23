import ko from 'knockout';

function createMetadataDomStub(md, stubName = 'container') {
    let node = document.createElement('div');
    node.setAttribute('id', stubName);
    node.innerHTML = '<div data-bind="metadataFactory: metadata"></div>';
    document.body.appendChild(node);

    let metadata = ko.observable(md);
    ko.applyBindings({ metadata: metadata}, node);
    var viewModel = ko.dataFor(node); 

    return {
        node: node,
        viewModel: viewModel,
        dispose: function () {
            ko.cleanNode(node);
            node.parentElement.removeChild(node);
        }
    }
}

export {
    createMetadataDomStub
}