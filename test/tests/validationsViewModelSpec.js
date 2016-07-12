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
                expect(update).to.have.length(1);
                expect(adapterStub.node.querySelector('.validation-message-box').style.display).to.not.equal('none');
                subscription.dispose();
                done();
            });

        input.value = '';
        input.dispatchEvent(new Event('change')); // fire event to notify ko of update
        ko.dataFor(input).inputValue.isModified(true); //is there a better way to update this?
        eventAction.action();
    });

    it.skip('focuses on invalid field when clicked', function(done) {
        done();
    });

    it.skip('toggle show/hide validation messages',function(done){});
    it.skip('show validation message with Error Severity',function(done){});
    it.skip('show validation message with Warning Severity',function(done){});

});


