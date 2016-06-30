import { registerViewModels, createViewModel, createViewModels } from 'scalejs.metadataFactory';
import _ from 'lodash';
import 'input/inputModule';
import 'setValue/setValueModule';
import 'adapter/adapterModule';
import 'chai';

let expect = chai.expect,
    adapterWithValue;

const node = {
    "type": "adapter",
    "dataSourceEndpoint": {
        "uri": "setValue"
    },
    "children": [
        {
            "type": "setValue"
        },
        {
            "id": "A",
            "type": "input"
        },
        {
            "id": "B",
            "type": "input"
        },
        {
            "type": "test_parent",
            "children": [
                {
                    "id": "C",
                    "type": "input"
                }
            ]
        }
    ]
};

describe('setValueViewModel test', function () {
    this.timeout(0);

    before(function (done) {
        registerViewModels({
            test_parent(node) {
                let mappedChildNodes = createViewModels.call(this, node.children || []);
                return _.merge(node, {
                    mappedChildNodes
                });
            },
        });

        adapterWithValue = createViewModel(node);
        done();
    });

    after(function () {
        adapterWithValue.dispose();
    })

    it('sets the value for all adapter child nodes', function (done) {
        function testInputValues(children, done) {
            children.forEach(function (child) {
                if (child.inputValue) {
                    let subscription = child.inputValue.subscribe(update => {
                        expect(update).to.equal(values[count]);
                        count ++;
                        subscription.dispose();
                        if (length === count + 1) {
                            done();
                        }
                    });
                } else {
                    testInputValues(child.mappedChildNodes, done)
                }
            })
        }

        let values = ["value_a", "value_b", "value_c"],
            children = adapterWithValue.mappedChildNodes(),
            count = 0,
            length = children.length;
        testInputValues(children, done);
    });
});