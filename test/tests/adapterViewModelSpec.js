
import adapterViewModel from 'adapter/adapterViewModel';
import { registerViewModels, createViewModel, createViewModels } from 'scalejs.metadataFactory';
import ko from 'knockout';
import _ from 'lodash';
import 'chai';
import { notify } from 'scalejs.messagebus';
import 'action/actionModule';
import 'action/actions/ajax';
import { merge } from 'scalejs';

let expect = chai.expect,
    adapter;


const node = {
    "type": "adapter",
    "id": "testAdapter",
    "children": [
        {
            "id": "A",
            "type": "test_input"
        },
        {
            "type": "test_parent",
            "children": [
                {
                    "id": "B",
                    "type": "test_input"
                }
            ]
        }
    ],
    "plugins": [
        {
            "type": "errors"
        }
    ]
};

describe('adapterViewModel test', function () {
    this.timeout(0); //disable timeout for dev

    before(function (done) {
        registerViewModels({
            adapter: adapterViewModel,
            test_input(node) {
                let value = ko.observable(),
                    error = ko.observable(true),
                    context = this;

                // using subscribe pattern
                if (this.data && this.data.subscribe) {
                    this.data.subscribe(data => {
                        value(data[node.id]);
                    });
                }

                return merge(node, {
                    context,
                    getValue() {
                        return value();
                    },
                    setValue(val) {
                        value(val);
                    },
                    error
                });
            },
            test_parent(node) {
                let mappedChildNodes = createViewModels.call(this, node.children || []);

                return merge(node, {
                    mappedChildNodes
                });
            },
            errors(node) {
                let dict = this.dictionary(),
                    aggregateErrors = function () {
                        return Object.keys(dict).filter(function (id) {
                            return (dict[id].error) ? dict[id].error() : false;
                        });
                    };
                return aggregateErrors;
            }
        });

        adapter = createViewModel(node);
        done();
    });

    after(function () {
        adapter.dispose();
    });

    it('maps descedant nodes to view models', function () {
        let children = ko.unwrap(adapter.mappedChildNodes);
        expect(children.length).to.equal(2);
        expect(children[0]).to.have.property('getValue');
    });

    it('contains dictionary of all child nodes', function () {
        expect(adapter.context).to.have.property('data');
        expect(adapter.context.data()).to.have.property('A');
        expect(adapter.context.data()).to.have.property('B');
    });

    it('fetches data from a single dataSourceEndpoint', function (done) {
        let testJson = _.merge({}, node, {
            "dataSourceEndpoint": {
                "uri": "adapter"
            }
        });

        let testAdapter = createViewModel(testJson),
            subscription = testAdapter.data.subscribe(data => {
                expect(data).to.deep.equal({
                    A: 'updated_a',
                    B: 'updated_b'
                });
                subscription.dispose();
                testAdapter.dispose();
                done();
            });
    });

    it('fetches data from an array of dataSourceEndpoints', function (done) {
        let testJson = _.merge({}, node, {
            "dataSourceEndpoint": [
                {
                    "uri": "adapter_a",
                    "keyMap": {
                        "resultsKey": "result",
                        "dataKey": "A"
                    }
                },
                {
                    "uri": "adapter_b",
                    "keyMap": {
                        "resultsKey": "result",
                        "dataKey": "B"
                    }
                }
            ]
        });

        let testAdapter = createViewModel(testJson),
            subscription = testAdapter.data.subscribe(data => {
                expect(data).to.deep.equal({
                    A: 'updated_a',
                    B: 'updated_b'
                });
                subscription.dispose();
                testAdapter.dispose();
                done();
            });
    });

    it('tracks data changes from its children', function (done) {
        let children = ko.unwrap(adapter.mappedChildNodes);
        children[0].setValue('Test');
        expect(adapter.data()['A']).to.equal('Test');
        done();
    });

    it('can add plugins and retrieve context data', function (done) {
        let children = ko.unwrap(adapter.mappedChildNodes);
        children[0].setValue('');
        expect(adapter.contextPlugins.errors()[0]).to.equal('A');
        done();
    });

    it('can lazily load children when data returns', function (done) {
        let testJson = _.merge({}, node, {
            "lazy": true,
            "dataSourceEndpoint": [
                {
                    "uri": "adapter_a",
                    "keyMap": {
                        "resultsKey": "result",
                        "dataKey": "A"
                    }
                },
                {
                    "uri": "adapter_b",
                    "keyMap": {
                        "resultsKey": "result",
                        "dataKey": "B"
                    }
                }
            ]
        });

        let testAdapter = createViewModel(testJson);
        expect(testAdapter.mappedChildNodes().length).to.equal(0);
        testAdapter.dispose();
        done();
    });

    it('can be refreshed from an event', function (done) {

        let testJson = _.merge({}, node, {
            "id": "refreshAdapter",
            "dataSourceEndpoint": {
                "uri": "adapter"
            }
        });
        let testAdapter = createViewModel(testJson);

        let assertInitialValue = testAdapter.data.subscribe(data => {
            expect(data).to.deep.equal({
                A: 'updated_a',
                B: 'updated_b'
            });
            assertInitialValue.dispose();
        });

        // change value of child
        let children = ko.unwrap(testAdapter.mappedChildNodes);
        children[0].setValue('Test');
        expect(testAdapter.data()['A']).to.equal('Test');

        let assertFinalValue = testAdapter.data.subscribe(data => {
          expect(data).to.deep.equal({
              A: 'updated_a',
              B: 'updated_b'
          });
          assertFinalValue.dispose();
          testAdapter.dispose();
          done();
        });
        // todo: find out why the other test wasnt disposed
        notify('refreshAdapter.refresh');

    });

    it('properly disposes of subscriptions');

    it('adapter getValue returns correct value of child', function (done) {
      let children = ko.unwrap(adapter.mappedChildNodes);
      children[0].setValue('Test');

      expect(children[0].context.getValue('A')).to.equal('Test');
      done();
    });

    it('adapter getValue returns correct value of child before child is mapped', function (done) {
      // adapterViewModel.js 170: how to test if getValue is only exposed on children, but children cannot be accessed if they are not mapped
      // let testJson = _.merge({}, node, {
      //     "lazy": true,
      //     "dataSourceEndpoint": [
      //         {
      //             "uri": "adapter_a",
      //             "keyMap": {
      //                 "resultsKey": "result",
      //                 "dataKey": "A"
      //             }
      //         },
      //         {
      //             "uri": "adapter_b",
      //             "keyMap": {
      //                 "resultsKey": "result",
      //                 "dataKey": "B"
      //             }
      //         }
      //     ]
      // });
      //
      // let testAdapter = createViewModel(testJson);
      // expect(testAdapter.mappedChildNodes().length).to.equal(0);
      //
      // let children = ko.unwrap(testAdapter.mappedChildNodes);
      //
      // expect(children[0].context.getValue('A')).to.equal('updated_a');
      done();
    });
});
