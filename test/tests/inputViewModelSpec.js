
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

    //after(function () {
        //domStub.dispose();
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

    it('uses setReadonly to toggle input', function (done) {
            const nodeSetReadOnly = {
                "type": "input",
                "inputType": "text",
                "label": "Set Read Only"
            };
         
         let setReadOnlyStub = createMetadataDomStub(nodeSetReadOnly);
         let input = setReadOnlyStub.node.querySelector('input');

         ko.dataFor(input).setReadonly(true);
         expect(ko.dataFor(input).readonly()).equals(true);

        setReadOnlyStub.dispose();
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

    it('has an inputType of text for the input', function (done) {
            
            let input = domStub.node.querySelector('input'),
                theInputType = ko.dataFor(input).inputType;

            expect(theInputType).equals('text');
            domStub.dispose();
            done();
    });


    describe('inputViewModel tests setValue function', function () {
        it('sets new input value', function(done) {

            const newNode = {
                "type": "input",
                "inputType": "text",
                "label": "New Value",
                "options": {
                    "value": "MOUSE"
                }
            };

            let newDomStub = createMetadataDomStub(newNode);
            let input = newDomStub.node.querySelector('input');

            ko.dataFor(input).setValue("Cat");

            let newValue = ko.dataFor(input).inputValue();
            expect(newValue).equals("Cat");
            newDomStub.dispose();
            done();
        
        });

        it('adds a pattern and input mask', function (done) {
            let inputmaskNode = {
                "type": "input",
                "inputType": "text",
                "label": "Input Mask",
                "options": {
                    "pattern": {
                        "mask": "A{3}"
                    }
                }
            }

            let inputMaskStub = createMetadataDomStub(inputmaskNode);
            let input = inputMaskStub.node.querySelector('input');

            expect(inputMaskStub.data[0].options.pattern.mask).equals('A{3}');
            done();
            inputMaskStub.dispose();

        });
    });

    describe('inputViewModel tests getPattern function', function () {
        it('gets and returns the pattern on an input', function(done) {

            const getPatternNode = {
                "type": "input",
                "inputType": "text",
                "label": "Get Pattern",
                "options": {
                    "pattern": true,
                    "validations": {
                        "pattern": {
                            "params": "^[0-9]$"
                        }
                    }
                }
            };

            let getPatternStub = createMetadataDomStub(getPatternNode);
            let input = getPatternStub.node.querySelector('input');

            expect(getPatternStub.data[0].pattern.alias).equals("Regex");

            getPatternStub.dispose();
            done();
        
        });

        it('adds a pattern and input mask', function (done) {
            let inputmaskNode = {
                "type": "input",
                "inputType": "text",
                "label": "Input Mask",
                "options": {
                    "pattern": {
                        "mask": "A{3}"
                    }
                }
            }

            let inputMaskStub = createMetadataDomStub(inputmaskNode);
            let input = inputMaskStub.node.querySelector('input');
            expect(inputMaskStub.data[0].options.pattern.mask).equals('A{3}');
            done();
            inputMaskStub.dispose();

        });
    });

    describe('inputViewModel tests for select types', function () {

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

        it('creates selectViewModel', function () {    
            let selectViewModel = createViewModel(nodeSelect);
            // console.log("select view model", selectViewModel);
            // expect(selectViewModel).to.have.property('');
        });



        it.skip('has an inputType of select and has values in the dropdown', function (done) {
        //why isn't select working?!?
        //TESTs to make once select is working:
        //looks for the values in the dropdown
        //create select view model

            let testStub = createMetadataDomStub(nodeSelect);
            // expect(testStub.data[0].inputType).equals('select');
            done();
            testStub.dispose();
        });

    });

    describe('inputViewModel tests for datepicker types', function () {
        it('test for datepicker types', function (done) {

            const nodeDatePicker = {
                "type": "input",
                "inputType": "datepicker",
                "label": "Date Picker",
                "options": {
                    "minDate": "currentDate",
                    "maxDate": "currentDate+3yr"
                }
            }


            let testDomStubDP = createMetadataDomStub(nodeDatePicker);
            expect(testDomStubDP.data[0].inputType).equals('datepicker');
            testDomStubDP.dispose();
            done();
        });
        it('tests assigndate for datepicker types', function (done) {

             const nodeDatePicker = {
                "type": "input",
                "inputType": "datepicker",
                "label": "Date Picker",
                "options": {
                    "minDate": "currentDate",
                    "maxDate": "currentDate+3yr"
                }
            };

            let testDomStubDP = createMetadataDomStub(nodeDatePicker);
            let input = testDomStubDP.node.querySelector('input');

            ko.dataFor(input).assignDate("2016-03-01", {days: 14, months: 1});
            expect(ko.dataFor(input).inputValue()).equals("2016-04-15");
            testDomStubDP.dispose();
            done();

        });
    });

    describe('inputViewModel dateformatter function', function () {    
        it.skip('tests dateformatter function', function (done) {

             const nodeDateFormatter = {
                "type": "input",
                "inputType": "text",
                "id": "Date Formatter",
                "label": "Date Formatter",
                "options": {
                    "values": {
                        "textFormatter": "dateFormatter"
                    }
                }
            }

            let input = createViewModel(nodeDateFormatter);
            console.log("FORMATTER INPUT", input);
            console.log("INPUT>FORMAT", input.format);
            // console.log("INPUT FORMAT CALLED", input.format(09/09/9818));

            expect(input.options.values.textFormatter).equals("dateFormatter");

            done();

        });
    });

    describe('inputViewModel tests for autosize types', function () {
        it('test for autosize types', function (done) {

            const autosizeNode = {
                "type": "input",
                "inputType": "autosize",
                "label": "AUTOSIZE",
                "options": {
                    "initial": true,
                    "minRows": 0,
                    "maxHeight": 200,
                    "disabled": true,
                }
            }

            let autosizeDomStub = createMetadataDomStub(autosizeNode);
            expect(autosizeDomStub.data[0].inputType).equals("autosize");
            done();
            autosizeDomStub.dispose();
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

        it('creates autocompleteViewModel', function () {    
            let autocompleteViewModel = createViewModel(_.merge(node, {
                inputType: 'autocomplete'
            }));
            expect(autocompleteViewModel).to.have.property('autocompleteSource');
        });

        it.skip('test for autocomplete types', function (done) {
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

            let testDomStubAuto = createMetadataDomStub(autoCompNode, 'container_new');
            // console.log("AUTOCOMPLETE", testDomStubAuto );

            expect(testDomStubAuto.data[0].inputType).equals('autocomplete');
            expect(testDomStubAuto.data[0].autocompleteSource[0].equals('stressball'));
            done();
        });
    });

    describe('validation engine tests', function () {
         it('tests validations and expressions', function (done) {
             let input = createViewModel({
                 "type": "input",
                 "inputType": "text",
                 "id": "ValidationTest",
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
             done();
         });

         it('tests the required validation and error message', function (done) {
             
             let newInput = createViewModel({
                 "type": "input",
                 "label": "The Node",
                 "inputType": "text",
                 "options": {
                     "validations": {
                         "required": true
                     }
                  }
                });

                let isValidated = newInput.validate();
                expect(newInput.options.validations.required).to.equal(true);
                expect(isValidated).to.equal(true);

                // console.log("Validation INPUT", newInput);
                // console.log("NEWINPUT VISISBlE MESSAGE", newInput.visibleMessage());
                expect(newInput.visibleMessage().message).to.equal('The Node is invalid. This field is required.');

             done();
         });

     });

    describe('inputViewModel tests for checkboxlist types', function () {
            it('tests set checkbox list', function (done) {
                console.log("INSIDE THE CHBXLIST");
                    const checkboxListNode = {
                        "type": "input",
                        "inputType": "checkboxList",
                        "template": "input_checkbox_group_template",
                        "label": "CHECKBOXList",
                        "id": "check box List",
                        "options": {
                            "values": [
                                {
                                    "text": "History",
                                    "value": "History",
                                    "checked": false
                                }
                            ]
                        }
                    }

                let data = [1];

                let setCHBXListStub = createViewModel(checkboxListNode);
                setCHBXListStub.setValue(data);
                console.log(setCHBXListStub.inputValue());
                expect(setCHBXListStub.inputValue()[0]).equals(1);
                done();
                setCHBXListStub.dispose();
            });
        });

});

//dateformatter
//valueexpression