
import adapterViewModel from 'adapter/adapterViewModel';
import { registerViewModels, createViewModel, createViewModels } from 'scalejs.metadataFactory';
import ko from 'knockout';
import _ from 'lodash';
import 'chai';

    var expect = chai.expect,
        adapter;

    describe('adapterViewModel test', function() {
        this.timeout(0); //disable timeout for dev
        
        before(function(done) {
            registerViewModels({
                adapter: adapterViewModel,
                test_input (node) {
                    let value = ko.observable(),
                        mappedChildNodes = createViewModels.call(this, node.children || []);

                    return _.merge(node, {
                        getValue () {
                            return value();
                        },
                        setValue (val) {
                            value(val);
                        },
                        mappedChildNodes
                    });
                }
            });

            let node = {
                "type": "adapter",
                "children": [
                    {
                        "id": "A",
                        "type": "test_input",
                        "children": [
                            {
                                "id": "B",
                                "type": "test_input"
                            }
                        ]
                    }
                ]
            };

            adapter = createViewModel(node);
            done();
        });

        it.skip('maps descedant nodes to view models');

        it.skip('contains dictionary of all child nodes');

        it.skip('fetches data from a  single dataSourceEndpoint');

        it.skip('fetches data from an array of dataSourceEndpoints');

        it.skip('[TODO] updates children with data');

        it('tracks data changes from its children', function(done) {
            let children = ko.unwrap(adapter.mappedChildNodes);
            children[0].setValue('Test');
            expect(adapter.data()['A']).to.equal('Test');
            done();
        });

        it('can lazily load children when data returns');

        it('can be refreshed from an event');

        it('[TODO] properly disposes of subscriptions');
    });


