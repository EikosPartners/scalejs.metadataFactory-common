import 'validations/validationsModule';
import { registerViewModels, createViewModel } from 'scalejs.metadataFactory';
import { createMetadataDomStub } from 'utils';
import _ from 'lodash';
import { notify } from 'scalejs.messagebus';
import ko from 'knockout';
import 'setValue/setValueModule';
import 'adapter/adapterModule';
import 'input/inputModule';
import 'action/actionModule';
import 'action/actions/event';
import 'chai';

let expect = chai.expect,
    adapterStub,
    eventAction;

const node = {
    "type": "adapter",
    "id": "adapterId",
    "dataSourceEndpoint": {
        "uri": "setValue"
    },
    "children": [
        {
            "type": "setValue"
        },
        {
            "type": "validations"
        },
        {
            "id": "A",
            "type": "input",
            "inputType": "text",
            "label": "testInputA"
        },
        {
            "id": "B",
            "type": "input",
            "inputType": "text",
            "label": "testInputB",
            "options": {
                "validations": {
                    "required": true
                }
            }
        },
        {
            "type": "input",
            "inputType": "text",
            "label": "Warning Field",
            "id": "WarningField",
            "options": {
                 "validations": {
                     "expression": {
                         "params": "true === false",
                         "message": "Warning Message",
                         "severity": 2
                     }
                 }
             }
        },
        {
            "type": "input",
            "inputType": "text",
            "label": "FocusField",
            "id": "FocusField",
            "options": {
                 "validations": {
                     "expression": {
                         "params": "true === false",
                         "message": "Very Invalid"
                     }
                 }
             }
        }
    ]
};


describe('validationsViewModel test', function () {
    this.timeout(0);

    before(function (done) {
        adapterStub = createMetadataDomStub(node);
        done();
    });

    after(function () {
        adapterStub.dispose();
    })

    it('displays invalid fields in validation box', function (done) {
        let eventAction = createViewModel({
            "type": "action",
            "actionType": "event",
            "options": {
                "target": "adapterId.validate"
            }
        }),
            input = adapterStub.node.querySelectorAll('input')[1],
            subscription = adapterStub.data[0].mappedChildNodes()[0].visibleMessages.subscribe(function (update) {
                expect(update).to.have.length(3);
                expect(adapterStub.node.querySelector('.validation-message-box').style.display).to.not.equal('none');
                subscription.dispose();
                done();
            });

        input.value = '';
        input.dispatchEvent(new Event('change')); // fire event to notify ko of update
        ko.dataFor(input).inputValue.isModified(true); //is there a better way to update this?
        eventAction.action();
    });

    it('focuses on invalid field when clicked', function(done) {
        let invalidFieldVM = createViewModel({
                "type": "input",
                "inputType": "text",
                "label": "FocusField",
                "id": "FocusField",
                "options": {
                     "validations": {
                         "expression": {
                             "params": "true === false",
                             "message": "Very Invalid"
                         }
                     }
                 }
            });

        invalidFieldVM.hasFocus(true);
        invalidFieldVM.inputValue("hi");
        invalidFieldVM.hasFocus(false);


        expect(invalidFieldVM.hasFocus()).equals(false);
        expect(invalidFieldVM.error()).equals('Very Invalid');

        invalidFieldVM.dispose();
        done();
    });

    it('toggles show/hide validation messages',function(done){

        if(adapterStub.node.querySelector(".fa-caret-down")){
            adapterStub.node.querySelector(".fa-caret-down").click();
            expect(adapterStub.data[0].mappedChildNodes()[0].showValidationMessages()).equals(false);
        } 

        if(adapterStub.node.querySelector(".fa-caret-right")){
            adapterStub.node.querySelector(".fa-caret-right").click();
            expect(adapterStub.data[0].mappedChildNodes()[0].showValidationMessages()).equals(true);
        }

        done();
    });

    it('show validation message with Error Severity',function(done){
        console.log(adapterStub.data[0].mappedChildNodes()[4].visibleMessage().severity);
        
        let errorSeverity = adapterStub.data[0].mappedChildNodes()[4].visibleMessage().severity;
        expect(errorSeverity).equals(1);

        done();
    });

    it('show validation message with Warning Severity',function(done){

        let warningSeverity = adapterStub.data[0].mappedChildNodes()[3].visibleMessage().severity;
        expect(warningSeverity).equals(2);

        done();
    });

});


