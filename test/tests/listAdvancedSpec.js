import { getRegisteredTypes, createViewModel, createViewModels } from 'scalejs.metadataFactory';
import 'chai';
import noticeboard from 'scalejs.noticeboard';
import 'listAdvanced/listAdvancedModule';
import 'list/listModule';
import 'input/inputModule';

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

    it('list with unique autocomplete removes values from options as they are chosen', function (done) {
      noticeboard.set("test", [
        {
          "key": "store_a",
          "value": "store_b"
        },
        {
          "key": "store_a_2",
          "value": "store_b_2"
        }
      ]);

      const listJSON = {
          "type": "listAdvanced",
          "id": "testAdvancedList",
          "list": {
              "type": "list",
              "label": "test",
              "items": [
                  {
                      "id": "testInput",
                      "type": "input",
                      "inputType": "autocomplete",
                      "autocompleteSource": {
                          "fromArray": "store.test"
                      },
                      "keyMap": {
                          "textKey": "key",
                          "valueKey": "value"
                      },
                      "options": {
                          "unique": true
                      }
                  },
                  {
                      "type": "DELETE_FLAG",
                      "visible": "!readonly",
                      "id": "DeleteIndicator"
                  }
              ]
          }
      };

      let listViewModel = createViewModels([listJSON])[0];

      listViewModel.setValue([{ testInput: "store_b" }]);
      listViewModel.list.add();

      expect(listViewModel.rows()[0].items()[0].autocompleteSource()).to.deep.equal([
        {
          label: "store_a_2",
          value: "store_b_2",
          original: {
            key: "store_a_2",
            value: "store_b_2"
          }
        }
      ]);

      done();
    });

});
