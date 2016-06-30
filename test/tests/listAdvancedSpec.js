import { getRegisteredTypes, createViewModel } from 'scalejs.metadataFactory';
import 'chai';

import 'listAdvanced/listAdvancedModule';
import 'list/listModule';

describe('listAdvancedModule test', function () {
    it('registers the listAdvanced viewModel', function () {
        expect(getRegisteredTypes()).to.include('listAdvanced');
    });

    it('creates the listAdvancedViewModel', function () {
        const list = createViewModel({
            "type": "listAdvanced",
            "list": {
                "type": "list"
            }
        });
        expect(list).to.have.property('rows');
        expect(list).to.have.property('groups');
    })    
});
