
import adapterViewModel from 'adapter/adapterViewModel';
import { registerViewModels, createViewModel, createViewModels } from 'scalejs.metadataFactory';
import ko from 'knockout';
import _ from 'lodash';
import 'chai';

var expect = chai.expect,
    adapter;


const node = {
    "type": "adapter",
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
            test_input (node) {
                let value = ko.observable(),
                    error = ko.observable(true);

                // using subscribe pattern
                if (this.data && this.data.subscribe) {
                    this.data.subscribe(data => {
                        value(data[node.id]);
                    });
                }

                return _.merge(node, {
                    getValue() {
                        return value();
                    },
                    setValue(val) {
                        value(val);
                    },
                    error
                });
            },
            test_parent (node) {
                let mappedChildNodes = createViewModels.call(this, node.children || []);

                return _.merge(node, {
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

    it('fetches data from a  single dataSourceEndpoint', function () {
        let testJson = _.merge(node, {
            "dataSourceEndpoint": {
                "uri": "adapter"
            }
        });
        
        let testAdapter = createViewModel(testJson);

        expect(testAdapter.data()).to.deep.equal({
            A: 'updated_a',
            B: 'updated_b'
        });

        //testAdapter.dispose();
    });

    it('fetches data from a  single dataSourceEndpoint', function () {
        let testJson = _.merge(node, {
            "dataSourceEndpoint": {
                "uri": "adapter"
            }
        });
        
        let testAdapter = createViewModel(testJson);

        expect(testAdapter.data()).to.deep.equal({
            A: 'updated_a',
            B: 'updated_b'
        });

        //testAdapter.dispose();
    });
    
    it('[TODO] updates children with data');

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

    it('can lazily load children when data returns');

    it('can be refreshed from an event');

    it('[TODO] properly disposes of subscriptions');
});


