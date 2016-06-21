
import { registerViewModels, createViewModel, createViewModels } from 'scalejs.metadataFactory';
import { registerTemplates, registerBindings } from 'scalejs.mvvm';
import { createMetadataDomStub } from 'utils';
import Promise from 'bluebird';
import ko from 'knockout';
import _ from 'lodash';
import 'chai';

import inputViewModel from 'input/inputViewModel';
import inputBindings from 'input/inputBindings';
import inputTemplates from 'input/input.html';

function catchRejection(done) {
    return function (err) {
        console.error(err);
        done();
    }
}

function waitsFor(f, c, i) {
    var func = f, // this function returns true when promise is fufilled
        context = c, // optional "this" gets passed to adjust timeout
        intervalTime = i || 10; // optional interval

    return new Promise(function (fufill, reject) {
        var interval = setInterval(function () {
            if (func()) {
                clearTimeout(timeout);
                clearInterval(interval);
                fufill();
            }
        }, intervalTime);

        var timeout = setTimeout(function () {
            clearInterval(interval);
            reject(new Error(context.test.title));
        }, context && context.timeout() || 2000)
    });
}

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
        registerBindings(inputBindings);
        registerTemplates(inputTemplates);

        domStub = createMetadataDomStub(node);

    });

    after(function () {
        domStub.dispose();
    });

    it('renders value and label', function (done) {
        waitsFor(function () {
            return domStub.node.querySelector('input');
        }, this).then(function () {
            expect(domStub.node.querySelector('input').value).equals(testValue);
            expect(domStub.node.querySelector('label').innerHTML).equals(testLabel);
            done();
        }).catch(catchRejection(done));
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
            testStub;

        waitsFor(function () {
            return testStub = createMetadataDomStub(testNode, 'container_readonly');
        }, this).then(function () {
            return waitsFor(function () {
                return testStub.node.querySelector('input');
            }, this).then(function () {
                expect(testStub.node.querySelector('input').hasAttribute('readonly')).to.be.true;
                expect(testStub.node.querySelector('input').hasAttribute('disabled')).to.be.true;
                testStub.dispose();
                done();
            }).catch(catchRejection(done));
        }).catch(catchRejection(done));
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


