import { getRegisteredTypes, createViewModel, createViewModels } from 'scalejs.metadataFactory';
import 'chai';

import 'input/inputModule';
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
    it('tests readonly listViewModel item functionality with isNew', function () {
        const list = createViewModels([{
            "type": "list",
            "items": [{
                "type": "input",
                "id": "test",
                "inputType": "text",
                "options": {
                    "readonly": "isNew"
                }
            }],
            "data": [
                {
                    "test": "initialValue"
                }
            ]
        }])[0];

        expect(list).to.have.property('rows');
        expect(list.rows()).to.have.length(1);
        expect(list.rows()[0].items()).to.have.length(1);

        list.add(null, true); // add new row

        expect(list.rows()).to.have.length(2);
        expect(list.rows()[0].items()[0].context.getValue('isNew')).to.equal(true);
        expect(list.rows()[0].items()[0].readonly()).to.equal(true);
        
    });
});
