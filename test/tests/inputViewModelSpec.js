
import { registerViewModels, createViewModel, createViewModels } from 'scalejs.metadataFactory';
import { createMetadataDomStub } from 'utils';
import { merge } from 'scalejs';
import ko from 'knockout';
import _ from 'lodash';
import 'chai';
import 'input/inputModule';
import inputViewModel from 'input/inputViewModel';
import noticeboard from 'scalejs.noticeboard';



let expect = chai.expect,
    domStub,
    testLabel = 'label',
    testValue = 'value'

const node = {
    "type": "input",
    "inputType": "text",
    "id": "Original Node",
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
        console.log("THE THIS", this);
        expect(domStub.node.querySelector('input').value).equals(testValue);
        expect(domStub.node.querySelector('label').innerHTML).equals(testLabel);
        done();
    });

    it('has an inputType of text for the input', function (done) {
            
            let input = domStub.node.querySelector('input'),
                theInputType = ko.dataFor(input).inputType;

            expect(theInputType).equals('text');
            done();
    });

    it('updates value from user input', function (done) {

            const updateValueNode = {
                "type": "input",
                "inputType": "text",
                "label": testLabel,
                "options": {
                    "value": testValue
                }
            };

            let updateValueDomStub = createMetadataDomStub(updateValueNode);
            let input = updateValueDomStub.node.querySelector('input'),
                subscription = ko.dataFor(input).inputValue.subscribe(function (value) {
                    expect(value).equals('new');
                    subscription.dispose();
                    done();
                    updateValueDomStub.dispose();
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

    describe('inputViewModel tests setValue function', function () {
        it('sets new input value', function(done) {

            const newNode = {
                "type": "input",
                "inputType": "text",
                "label": "New Value",
                "options": {
                    "value": "MOUSE"
                }
            }

            let newDomStub = createMetadataDomStub(newNode);
            let input = newDomStub.node.querySelector('input');

            ko.dataFor(input).setValue("Cat");

            let newValue = ko.dataFor(input).inputValue();
            expect(newValue).equals("Cat");
            newDomStub.dispose();
            done();
        
        });
    });

    describe('inputViewModel inputmask and pattern', function () {
        it('adds a pattern and input mask', function (done) {
            const inputmaskNode = {
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
            inputMaskStub.dispose();
            done();

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
    });

    describe('inputViewModel tests percent pattern function', function () {
        it('has a pattern.alias of percent', function(done) {

            const aliasPercentNode = {
                "type": "input",
                "inputType": "text",
                "label": "Percent Alias Pattern",
                "id": "PercentAliasPattern",
                "options": {
                    "value": 3,
                    "pattern": {
                        "alias": "percent"
                    }
                }
            };

            let aliasPercentStub = createMetadataDomStub(aliasPercentNode);
            let aliasValue = aliasPercentStub.node.querySelector('input');

            ko.dataFor(aliasValue).setValue(2);
            expect(aliasValue.value).equals('2.000');
            aliasPercentStub.dispose();
            done();
        
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

        it('creates selectViewModel', function (done) {
            let selectViewModel = createViewModel(nodeSelect);
            expect(selectViewModel).to.have.property('filterValues'); // selectViewModel adds 3 properties to inputViewModel one being filterValues
            done();
        });

        it('has an inputType of select and has values in the dropdown', function (done) {

            let testStub = createMetadataDomStub(nodeSelect);
            expect(testStub.data[0].inputType).to.equal('select');

            expect(testStub.data[0].values().length).to.equal(3);

            testStub.dispose();
            done();
        });

        it('select setValue correctly sets inputValue', function (done) {

            let selectViewModel = createViewModel(nodeSelect);
            selectViewModel.setValue("Option 2");

            expect(selectViewModel.inputValue()).to.equal('Option 2');

            done();
        });

        it('select setValue adds value to options if not previously there', function (done) {

            let selectViewModel = createViewModel(nodeSelect);
            selectViewModel.setValue("Option 3");

            let foundIndex = _.find(selectViewModel.values(), function (obj) {
              return obj.value === "Option 3";
            });

            expect(foundIndex).to.not.equal(-1);

            done();
        });

        it('sets values from option array provided', function (done) {
          // should create adapter with select children
          // potentially provide array into adapter or store
          noticeboard.set("test", [
            {
              "key": "store_a",
              "value": "store_b"
            },
            {
              "key": "store_a_2",
              "value": "store_b_2"
            },
            {
              "key": "store_a_2",
              "value": "new store_b_2"
            }
          ]);

          let selectJSON = _.assign({}, nodeSelect, {
              "options": {
                  "values": {
                      "fromArray": "store.test",
                      "textKey": "key",
                      "valueKey": "value"
                  }
              }
          });
          let selectViewModel = createViewModels([selectJSON])[0];

          expect(selectViewModel.values()).to.deep.equal([
            {
              "text": "",
              "value": ""
            },
            {
              "text": "store_a",
              "value": "store_b",
              "original": {
                "key": "store_a",
                "value": "store_b"
              }
            },
            {
              "text": "store_a_2",
              "value": "store_b_2",
              "original": {
                "key": "store_a_2",
                "value": "store_b_2"
              }
            },
            {
              "text": "store_a_2",
              "value": "new store_b_2",
              "original": {
                "key": "store_a_2",
                "value": "new store_b_2"
              }
            }
          ]);

          done();
        });

        it('filters values', function (done) {
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

          let selectJSON = _.assign({}, nodeSelect, {
              "options": {
                  "values": {
                      "fromArray": "store.test",
                      "textKey": "key",
                      "valueKey": "value"
                  }
              }
          });
          let selectViewModel = createViewModels([selectJSON])[0];
          selectViewModel.filterValues(["store_b"])
          expect(selectViewModel.values()).to.deep.equal([
            {
              "text": "store_a",
              "value": "store_b",
              "original": {
                "key": "store_a",
                "value": "store_b"
              }
            }
          ]);

          done();
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
            expect(ko.dataFor(input).inputValue()).equals("04/15/2016");
            testDomStubDP.dispose();
            done();

        });
    });

    describe('inputViewModel dateformatter function', function () {    
        it('tests dateformatter function', function (done) {

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

            let testDomStubFormatter = createMetadataDomStub(nodeDateFormatter);
            let input = testDomStubFormatter.node.querySelector('input');

            expect(ko.dataFor(input).format("2019-02-02")).equals('02/02/2019');
            testDomStubFormatter.dispose();
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
            autosizeDomStub.dispose();
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
            testDomStub.dispose();
            done();
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
            testDomStubCB.dispose();
            done();
        });
    });


    describe('inputViewModel tests for autocomplete types', function () {

        const autoCompNode = {
          "id": "Autocomplete",
          "type": "input",
          "inputType": "autocomplete",
          "template": "input_autocomplete_template",
          "label": "Autocomplete"
        }

        it('creates autocompleteViewModel', function () {
            let autocompleteJson = _.merge({}, autoCompNode,
              {
                  "autocompleteSource": [
                      "stressball",
                      "gumball",
                      "hairball"
                  ]
              });

            let autocompleteViewModel = createViewModel(autocompleteJson);

            // what properties do we test here? all that are expected to be on viewmodel?
            expect(autocompleteViewModel).to.have.property('autocompleteSource');
            expect(autocompleteViewModel).to.have.property('setReadonly');

        });

        it.skip('test for autocomplete types', function (done) {

            let testDomStubAuto = createMetadataDomStub(autoCompNode, 'container_new');
            // console.log("AUTOCOMPLETE", testDomStubAuto );

            expect(testDomStubAuto.data[0].inputType).equals('autocomplete');
            expect(testDomStubAuto.data[0].autocompleteSource()[0].equals('stressball'));
            done();
        });

        it('can get data from endpoint defined in node', function (done) {
            let autocompleteJson = _.merge({}, autoCompNode,
              {
                  "dataSourceEndpoint": {
                      "uri": "storeAggregateLookup"
                  },
                  "keyMap": {
                      "dataKey": "lookup",
                      "textKey": "key",
                      "valueKey": "value"
                  }
              });

            let autocompleteViewModel = createViewModel(autocompleteJson);

            let subscription = autocompleteViewModel.autocompleteSource.subscribe((newVal) => {
                expect(newVal.length).to.equal(4);
                subscription.dispose();
                done();
            });
        });

        it.skip('can source values from store', function (done) {
            noticeboard.set("test", [
              {
                "key": "store_a",
                "value": "store_b"
              },
              {
                "key": "store_a_2",
                "value": "store_b_2"
              },
              {
                "key": "store_a_2",
                "value": "new store_b_2"
              }
            ]);
            let JSON = [
              _.merge({}, autoCompNode, {
                  "autocompleteSource": {
                      "fromArray": "store.test"
                  },
                  "keyMap": {
                      "dataKey": "test",
                      "textKey": "key",
                      "valueKey": "value"
                  }
              })
            ];
            let viewModels = createViewModels(JSON);
            expect(viewModels[0].autocompleteSource()).to.deep.equal([
              {
                "label": "store_a",
                "value": "store_b",
                "original": {
                  "key": "store_a",
                  "value": "store_b"
                }
              },
              {
                "label": "store_a_2",
                "value": "store_b_2",
                "original": {
                  "key": "store_a_2",
                  "value": "store_b_2"
                }
              },
              {
                "label": "store_a_2",
                "value": "new store_b_2",
                "original": {
                  "key": "store_a_2",
                  "value": "new store_b_2"
                }
              }
            ]);
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
                setCHBXListStub.dispose();
                done();
            });
    });

//Validation and ValueExpression nodes context not getting set
//debug
    describe('validation engine tests', function () {
         it('tests validations and expressions', function (done) {

             const validationNode = {
                 "type": "input",
                 "inputType": "text",
                 "label": "Validation test 1",
                 "id": "ValidationTestNode1",
                 "options": {
                     "validations": {
                         "expression": {
                             "params": "true === false",
                             "message": "invalid"
                         }
                     }
                 }
             }

             let validationInput = createViewModel(validationNode);
             expect(validationInput.error()).to.equal('invalid');
             validationInput.dispose();
             done();
         });

         it('tests the required validation and error message', function (done) {
             
             let newInputNode = {
                 "type": "input",
                 "id": "ValidationTestNode2",
                 "label": "Required Validation Node",
                 "inputType": "text",
                 "options": {
                     "validations": {
                         "required": true
                     }
                  }
                }

                let newInput = createViewModel(newInputNode);

                let isValidated = newInput.validate();
                expect(newInput.options.validations.required).to.equal(true);
                expect(isValidated).to.equal(true);

                // console.log("Validation INPUT", newInput);
                // console.log("NEWINPUT VISISBlE MESSAGE", newInput.visibleMessage());
                expect(newInput.visibleMessage().message).to.equal('Required Validation Node is invalid. This field is required.');
                newInput.dispose();
                done();
         });
     });

    describe('inputViewModel tests for value expressions', function () {
        //Figure out why the there is no context when node has valueExpression and validations
        it('tests for value expression', function (done) {
            console.log("INSIDE THE VALUE EXPRESSION TEST");
            let valExpNode = {
             "type": "input",                 
             "inputType": "text",
             "label": "VALUE EXPRESSION NODE",
             "id": "TheValueExpressionID",
             "options": {
                "valueExpression": "_.indexOf([1,2,3], 2)"
             }
            }

            let valExpDomStub = createMetadataDomStub(valExpNode);
            let theInputValue = valExpDomStub.node.querySelector('input').value;
            expect(theInputValue).equals('1');

            valExpDomStub.dispose();
            done();

        });
    });

});
