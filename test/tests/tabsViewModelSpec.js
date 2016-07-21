import { getRegisteredTypes, createViewModel } from 'scalejs.metadataFactory';
import { registerTemplates } from 'scalejs.mvvm';
import { createMetadataDomStub } from 'utils';
import { merge } from 'lodash';
import 'chai';

import template from './templateTest/templateTest.html';
import 'template/templateModule';
import 'tabs/tabsModule';

describe('tabsModule test', function () {
    before(function () {
        registerTemplates(
            template
        );
    });

    it('registers the tab viewModel', function () {
        expect(getRegisteredTypes()).to.include('tabs');
    });

    it('registers the template viewModel', function () {
        expect(getRegisteredTypes()).to.include('template');
    });

    describe('create tabs', function () {
        const node = {
            "type": "tabs",
            "headers": [
                {
                    "text": "Test Tab 1"
                },
                {
                    "text": "Test Tab 2"
                }
            ],
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
        let domStub;

        afterEach(function () {
             domStub.dispose();
        });


        it('creates tabs and checks active tab', function (done) {
            let tabs;
            domStub = createMetadataDomStub(node);
            tabs = domStub.node.querySelector('.tabs').children;

            expect(tabs[0].classList.contains('on')).to.equal(true);
            expect(tabs[1].classList.contains('on')).to.equal(false);

            tabs[1].click();
            expect(tabs[0].classList.contains('on')).to.equal(false);
            expect(tabs[1].classList.contains('on')).to.equal(true);

            done();
        });

        it('creates tabs with first tab that is not visible and checks active tab', function (done) {
            let tabs;
            domStub = createMetadataDomStub(merge({}, node, { headers: [{ "text": "Test Tab 1", "visible": false }, { "text": "Test Tab 2" }] }));
            tabs = domStub.node.querySelector('.tabs').children;

            expect(tabs[0].classList.contains('on')).to.equal(false);
            expect(tabs[1].classList.contains('on')).to.equal(true);

            done();
        });

        it('creates tabs with first tab that is not visible (using expression) and checks active tab', function (done) {
            let tabs;
            domStub = createMetadataDomStub(merge({}, node, { headers: [{ "text": "Test Tab 1", "visible": "1 === 2" }, { "text": "Test Tab 2" }] }));
            tabs = domStub.node.querySelector('.tabs').children;

            expect(tabs[0].classList.contains('on')).to.equal(false);
            expect(tabs[1].classList.contains('on')).to.equal(true);

            done();
        });
    });
});