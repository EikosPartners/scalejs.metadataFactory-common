import ko from 'knockout';

function createMetadataDomStub(md, stubName = 'container') {
    let node = document.createElement('div');
    node.setAttribute('id', stubName);
    node.innerHTML = '<div data-bind="metadataFactory: metadata, metadataSync: true"></div>';
    document.body.appendChild(node);

    let metadata = ko.observable(md);
    ko.applyBindings({ metadata: metadata}, node);
    
    let data = ko.utils.domData.get(node.firstChild, 'metadata'); 

    return {
        node: node,
        data: data,
        dispose: function () {
            ko.cleanNode(node);
            node.parentElement.removeChild(node);
        }
    }
}

export {
    createMetadataDomStub
}