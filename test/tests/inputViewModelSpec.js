
import { registerViewModels, createViewModel, createViewModels } from 'scalejs.metadataFactory';
import { createMetadataDomStub } from 'utils';
import { merge } from 'scalejs';
import ko from 'knockout';
import _ from 'lodash';
import 'chai';
import 'input/inputModule';
import inputViewModel from 'input/inputViewModel';



let expect = chai.expect,
    domStub,
    testLabel = 'label',
    testValue = 'value'


const node = {
    "type": "input",
    "inputType": "text",
    "label": testLabel,
    "options": {
        "value": testValue
    }
};

describe('inputViewModel test', function () {
    this.timeout(0); //disable timeout for dev

    before(function () {
        registerViewModels({
            input: inputViewModel
        });

        domStub = createMetadataDomStub(node);
    });

    it('renders value and label', function () {
        expect(domStub.node.querySelector('input').value).equals(testValue);
        expect(domStub.node.querySelector('label').innerHTML).equals(testLabel);
    })

    it('updates value from user input', function (done) {
        let input = domStub.node.querySelector('input'),
            subscription = ko.dataFor(input).inputValue.subscribe(function (value) {
                expect(value).equals('new');
                subscription.dispose();
                done();
            });
        input.value = 'new';
        // EG: what is this?
        input.dispatchEvent(new Event('change')); // fire event to notify ko of update
    });

    it('adds inactive attributes for readonly types', function () {
        let testNode = _.merge(node, {
            "options": {
                "readonly": true
            }
        }),
         testStub = createMetadataDomStub(testNode, 'container_readonly'),
         input = testStub.node.querySelector('input');

        expect(input.hasAttribute('readonly')).to.be.true;
        expect(input.hasAttribute('disabled')).to.be.true;
        testStub.dispose();
    });

    it('toggles inactive attributes on readonly updates');

    describe('inputViewModel tests for text types', function () {
        it('does something for text inputs');
    });

    describe('inputViewModel tests for list types', function () {
        it('test for list types');
    });

    describe('inputViewModel tests for select types', function () {
        it('creates the selectViewModel', function () {
            let select = createViewModel(merge(node, {
                inputType: 'select'
            }));
            expect(select).to.have.property('filterValues');
        });
    });

    describe('inputViewModel tests for datepicker types', function () {
        it('test for datepicker types');
    });

    describe('inputViewModel tests for autosize types', function () {
        it('test for autosize types');
    });

    describe('inputViewModel tests for radio types', function () {
        it('test for radio types');
    });

    describe('inputViewModel tests for checkbox types', function () {
        it('test for checkbox types');
    });

    describe('inputViewModel tests for autocomplete types', function () {
        it('creates the autocompleteViewModel', function () {
            let autocompleteViewModel = createViewModel(merge(node, {
                inputType: 'autocomplete'
            }));
            expect(autocompleteViewModel).to.have.property('autocompleteSource');
        });
    });

    describe('validation engine tests', function () {
        it('expression validation', function () {
            let input = createViewModel({
                "type": "input",
                "inputType": "text",
                "options": {
                    "validations": {
                        "expression": {
                            "params": "true === false",
                            "message": "invalid"
                        }
                    }
                }
            });

            expect(input.error()).to.equal('invalid');
        });
    });
});
