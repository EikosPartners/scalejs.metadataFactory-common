import { getRegisteredTypes, createViewModel, createViewModels } from 'scalejs.metadataFactory';
import 'chai';

import 'listAdvanced/listAdvancedModule';
import 'list/listModule';

describe('listAdvancedModule test', function () {
    it('registers the listAdvanced viewModel', function (done) {
        expect(getRegisteredTypes()).to.include('listAdvanced');
        done();
    });

    it('creates the listAdvancedViewModel', function (done) {
        const list = createViewModel({
            "type": "listAdvanced",
            "list": {
                "type": "list"
            }
        });
        expect(list).to.have.property('rows');
        expect(list).to.have.property('groups');
        done();
    });

    it('creates the listAdvancedViewModel with footer with list-items and standard input types', function (done) {
        const list = createViewModels([
            {
              "type": "listAdvanced",
              "footers": [
                  {
                      "items": [
                          {
                              "type": "EMPTY"
                          },
                          {
                              "type": "ADD"
                          },
                          {
                              "type": "TEXT"
                          },
                          {
                              "type": "input",
                              "inputType": "text"
                          },
                          {
                              "type": "TOTAL"
                          }
                      ]
                  }
              ],
              "list": {
                  "type": "list"
              }
          }
        ])[0];

        expect(list.footers[0].items.length).to.equal(5);
        done();
    });


});
