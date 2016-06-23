import 'chai';
import { registerViewModels, createViewModel, createViewModels } from 'scalejs.metadataFactory';
import { registerTemplates, registerBindings } from 'scalejs.mvvm';
import { createMetadataDomStub } from 'utils';
import ko from 'knockout';
import _ from 'lodash';
import 'template/templateModule';

//Regirster templates and bindings
import template from './templateTest/templateTest.html';
import templateBindings from './templateTest/templateTestBindings';


let expect = chai.expect,
    domStub,
    testLabel = 'label',
    testValue = 'value'

describe('templateViewModel test', function () {
    this.timeout(0); //disable timeout for dev

    before(function () {
        registerBindings(
            templateBindings
        );
        registerTemplates(
            template
        );
    });

    after(function () {
        //domStub.dispose();
    });

    it('test the template is created', function(){
        const node = {
            "type": "template",
            "template": "template_test_template",
            "title": "hello dan"
        };
        domStub = createMetadataDomStub(node);
        expect(domStub.data.length).to.equal(1);
        /* waitsFor(function () {
            return 
        }, this).then(function () {
            expect(domStub.node.querySelector('test-title').value).equals(testValue);
            expect(domStub.node.querySelector('label').innerHTML).equals(testLabel);
            done();
        }).catch(catchRejection(done));
        */
    });

});


