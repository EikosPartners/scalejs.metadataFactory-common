import { getRegisteredTypes, createViewModel } from 'scalejs.metadataFactory';
import 'chai';

import 'list/listModule';

describe('listModule test', function () {
    it('registers the list viewModel', function () {
        expect(getRegisteredTypes()).to.include('list');
    });

    it('creates the listViewModel', function () {
        const list = createViewModel({
            "type": "list"
        });
        expect(list).to.have.property('rows');
    })
});
