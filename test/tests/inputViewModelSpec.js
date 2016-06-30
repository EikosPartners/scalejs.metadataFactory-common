
import { registerViewModels, createViewModel, createViewModels } from 'scalejs.metadataFactory';
import { createMetadataDomStub } from 'utils';
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

    after(function () {
        //domStub.dispose();
    });

    it('renders value and label', function (done) {
        expect(domStub.node.querySelector('input').value).equals(testValue);
        expect(domStub.node.querySelector('label').innerHTML).equals(testLabel);
        done();
    })

    it('updates value from user input', function (done) {
        let input = domStub.node.querySelector('input'),
            subscription = ko.dataFor(input).inputValue.subscribe(function (value) {
                expect(value).equals('new');
                subscription.dispose();
                done();
            });
        input.value = 'new';
        input.dispatchEvent(new Event('change')); // fire event to notify ko of update
    });

    it('adds inactive attributes for readonly types', function (done) {
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
        done();

    });

    it.skip('toggles inactive attributes on readonly updates', function(done) {
        done();
    });

    describe('inputViewModel tests for text types', function () {
        it.skip('does something for text inputs', function (done) {
            done();
        });
    });

    describe('inputViewModel tests for list types', function () {
        it.skip('test for list types', function (done) {
            done();
        });
    });

    describe('inputViewModel tests for select types', function () {
        it.skip('test for select types', function (done) {
            done();
        });
    });

    describe('inputViewModel tests for datepicker types', function () {
        it.skip('test for datepicker types', function (done) {
            done();
        });
    });

    describe('inputViewModel tests for autosize types', function () {
        it.skip('test for autosize types', function (done) {
            done();
        });
    });

    describe('inputViewModel tests for radio types', function () {
        it.skip('test for radio types', function (done) {
            done();
        });
    });

    describe('inputViewModel tests for checkbox types', function () {
        it.skip('test for checkbox types', function (done) {
            done();
        });
    });

    describe('inputViewModel tests for autocomplete types', function () {
        it.skip('test for autocomplete types', function (done) {
            done();
        });
    });
});
