import { getRegisteredTypes, createViewModel, createViewModels } from 'scalejs.metadataFactory';
import 'chai';

import 'input/inputModule';
import 'list/listModule';

describe('listModule test', function (done) {
    it('registers the list viewModel', function (done) {
        expect(getRegisteredTypes()).to.include('list');
        done();
    });

    it('creates the listViewModel', function (done) {
        const list = createViewModel({
            "type": "list"
        });
        expect(list).to.have.property('rows');

        done();
    });

    it('tests readonly listViewModel item functionality with isNew', function (done) {
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

        done();
    });

    it('exposes a setReadonly function that toggles all rows readonly', function (done) {
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

      list.add();
      list.setReadonly(true);
      
      list.rows().forEach((row) => {
        row.items().forEach((item) => {
          expect(item.readonly()).to.equal(true);
        });
      });

      done();
    });
});
