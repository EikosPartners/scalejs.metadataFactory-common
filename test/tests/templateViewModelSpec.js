import 'chai';
import * as noticeboard from 'scalejs.noticeboard';
import { registerViewModels, createViewModel, createViewModels } from 'scalejs.metadataFactory';
import { registerTemplates, registerBindings } from 'scalejs.mvvm';
import { createMetadataDomStub } from 'utils';
import ko from 'knockout';
import _ from 'lodash';
import 'template/templateModule';
import $ from 'jquery';
//Regirster templates and bindings
import template from './templateTest/templateTest.html';
import templateBindings from './templateTest/templateTestBindings';
import { receive } from 'scalejs.messagebus';

import 'action/actionModule';
import 'action/actions/event';
import 'action/actions/ajax';

let expect = chai.expect,
    domStub;

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

    afterEach(function () {
        domStub.dispose();
    });

    it('was rendered', function (done) {
        const node = {
            "type": "template",
            "template": "template_test_template",
            "classes": "test-class",
            "title": "hello dan"
        };
        domStub = createMetadataDomStub(node);
        expect(domStub.data.length).to.equal(1);
        expect($('.test-title').html()).equals(node.title); // test with jquery
        expect(domStub.node.querySelector('.test-title').innerHTML).equals(node.title);
        done();

    });
    it('was rendered and the  binding was created', function (done) {
        const node = {
            "type": "template",
            "template": "template_test_template",
            "classes": "test-class",
            "title": "hello dan"
        };
        domStub = createMetadataDomStub(node);
        expect(domStub.node.querySelector('.test-class-binding').innerHTML).equals(node.title);
        done();
    });
    it('the template has children', function (done) {
        const node = {
            "type": "template",
            "template": "template_test_children_template",
            "children": [
                {
                    "type": "template",
                    "template": "template_test_one"
                },
                {
                    "type": "template",
                    "template": "template_test_two"
                }
            ]
        };
        domStub = createMetadataDomStub(node);
        expect(domStub.node.querySelector('.test-one').innerHTML).equals("one");
        expect(domStub.node.querySelector('.test-two').innerHTML).equals("two");
        done();
    });

    it('the template has datasource', function (done) {
        const node = {
            "type": "template",
            "template": "template_test_children_template",
            "dataSourceEndpoint": {
                "type": "action",
                "actionType": "ajax",
                "options": {
                    "target": {
                        "uri": "store"
                    }
                }
            }
        };
        domStub = createMetadataDomStub(node);
        let subscription = domStub.data[0].data.subscribe(data => {
            expect(data).to.deep.equal({
                "A": "store_a",
                "B": "store_b"
            });
            subscription.dispose();
            done();
        });
    });
    it('the template has an action', function (done) {
        const node = {
            "type": "template",
            "template": "template_test_children_template",
            "action": {
                "type": "action",
                "actionType": "event",
                "options": {
                    "target": "eventtest",
                    "params": "test"
                }
            }
        };

        let subscription = receive('eventtest', function (change) {
            expect(change).to.equal(node.action.options.params)
            subscription.dispose();
            done();
        });
        domStub = createMetadataDomStub(node);
        domStub.data[0].action.action();
    });
});


