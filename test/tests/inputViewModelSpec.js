
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

    // after(function () {
    //     //domStub.dispose();
    // });

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
        // EG: what is this?
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

    it('toggles inactive attributes on readonly updates', function(done) {
        let testNode = _.merge(node, {
            "options": {
                "readonly": true
            }
        }),
            testStub = createMetadataDomStub(testNode, 'container_readonly'),
            input = testStub.node.querySelector('input');

         let subscription = ko.dataFor(input).readonly.subscribe(function(toggle) {
            expect(toggle).equals(false);
            expect(ko.dataFor(input).readonly()).equals(false);
            subscription.dispose();
         });

        ko.dataFor(input).readonly(false);
        input.dispatchEvent(new Event('change'));
        testStub.dispose();
        done();
    });

    describe('inputViewModel tests for text types', function () {
        it('has an inputType of text for the input', function (done) {
            
            let input = domStub.node.querySelector('input'),
                theInputType = ko.dataFor(input).inputType;

            expect(theInputType).equals('text');
            done();

        });
    });

    describe('inputViewModel tests for list types', function () {
        it.skip('has an inputType of list', function (done) {
            done();
        });

    });

    describe('inputViewModel tests for select types', function () {
        it.skip('has an inputType of select and has values in the dropdown', function (done) {
        //why isn't select working?!?
        //TESTs to make once select is working:
        //looks for the values in the dropdown

        const nodeSelect = {
                    "type": "input",
                    "inputType": "select",
                    "label": "SELECT",
                    "id": "Select",
                    "options": {
                        "values": [
                            {
                                "text": "Option 1",
                                "value": "Option 1"
                            },
                            {
                                "text": "Option 2",
                                "value": "Option 2"
                            }
                        ]
                    }
                }

            let testStub = createMetadataDomStub(nodeSelect);
            // expect(testStub.data[0].inputType).equals('select');
            done();
            testStub.dispose();
            done();
        });

    });

    describe('inputViewModel tests for datepicker types', function () {
        it('test for datepicker types', function (done) {

            const nodeDatePicker = {
                "type": "input",
                "inputType": "datepicker",
                "label": "Date Picker"
            }

            let testDomStubDP = createMetadataDomStub(nodeDatePicker);
            expect(testDomStubDP.data[0].inputType).equals('datepicker');
            done();
            testDomStubDP.dispose();
        });
    });

    describe('inputViewModel tests for autosize types', function () {
        it.skip('test for autosize types', function (done) {
            done();
        });
    });

    describe('inputViewModel tests for radio types', function () {
        it('test for radio types', function (done) {

            const radioNode = {
                    "type": "input",
                    "inputType": "radio",
                    "label": "RADIO",
                    "id": "radiobutton",
                    "options": {
                        "value": "Y",
                        "values": [
                            "This one",
                            "That one"
                        ]
                    }
                }

            let testDomStub = createMetadataDomStub(radioNode);
            expect(testDomStub.node.querySelector('input').value).equals('This one');
            expect(testDomStub.data[0].inputType).equals('radio');
            done();
            testDomStub.dispose();
        });
    });

    describe('inputViewModel tests for checkbox types', function () {
        it('test for checkbox types', function (done) {
                const checkboxNode = {
                    "type": "input",
                    "inputType": "checkbox",
                    "label": "CHECKBOX",
                    "id": "check box",
                    "options": {
                        "text": "Hello",
                        "checked": "true",
                        "unchecked": "false"
                    }
                }

            let testDomStubCB = createMetadataDomStub(checkboxNode);

            expect(testDomStubCB.data[0].inputType).equals('checkbox');
            expect(testDomStubCB.data[0].options.checked).equals('true');
            expect(testDomStubCB.data[0].options.unchecked).equals('false');
            done();
            testDomStubCB.dispose();
        });
    });

    describe('inputViewModel tests for autocomplete types', function () {
        it('test for autocomplete types', function (done) {
            const autoCompNode = {
                  "id": "Autocomplete",
                  "type": "input",
                  "template": "input_autocomplete_template",
                  "inputType": "autocomplete",
                  "label": "Autocomplete",
                  "autocompleteSource": [
                        "stressball",
                        "gumball",
                        "hairball",
                        "tossball"
                    ]     
                }

            let testDomStubAuto = createMetadataDomStub(testDomStubAuto, 'container_new');
            console.log("AUTOCOMPLETE", testDomStubAuto );

            // expect(testDomStubAuto.data[0].inputType).equals('autocomplete');
            // expect(testDomStubAuto.data[0].autocompleteSource[0].equals('stressball'));
            done();
            
            // let autocompleteViewModel = createViewModel(merge(node, {
            //     inputType: 'autocomplete'
            // }));
            // expect(autocompleteViewModel).to.have.property('autocompleteSource');

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
