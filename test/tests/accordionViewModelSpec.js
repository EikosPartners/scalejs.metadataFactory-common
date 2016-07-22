import { getRegisteredTypes, createViewModel } from 'scalejs.metadataFactory';
import { registerTemplates } from 'scalejs.mvvm';
import { createMetadataDomStub } from 'utils';
import { merge } from 'scalejs';
import ko from 'knockout';
import 'chai';

import template from './templateTest/templateTest.html';
import 'accordion/accordionModule';
import 'template/templateModule';
import 'action/actionModule';
import 'action/actions/event';


describe('accordionModule test', function () {
    before(function () {
        registerTemplates(
            template
        );
    });

    it('registers the accordion viewModel', function () {
        expect(getRegisteredTypes()).to.include('accordion');
    });
    it('registers the template viewModel', function () {
        expect(getRegisteredTypes()).to.include('template');
    });

    describe('create accordions', function () {
        const node = {
            "type": "accordion",
            "sections": [
                "Section 1",
                "section 2"
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

        it('creates visible accordions', function () {
            domStub = createMetadataDomStub(node);
            const sectionOne = document.querySelectorAll('.inner-accordion')[0].style.display,
                  sectionTwo = document.querySelectorAll('.inner-accordion')[1].style.display,
                  sectionOneInner = document.querySelector('.test-one').innerHTML,
                  sectionTwoInner = document.querySelector('.test-two').innerHTML;
            expect(sectionOne).to.equal('');
            expect(sectionTwo).to.equal('');
            expect(sectionOneInner).to.equal('one');
            expect(sectionTwoInner).to.equal('two');
        });

        it('creates closed accordions', function () {
            domStub = createMetadataDomStub(merge(node, {options: {openByDefault: false}}));
            const sectionOne = document.querySelectorAll('.inner-accordion')[0].style.display,
                  sectionTwo = document.querySelectorAll('.inner-accordion')[1].style.display,
                  sectionOneInner = document.querySelector('.test-one').innerHTML,
                  sectionTwoInner = document.querySelector('.test-two').innerHTML;
            expect(sectionOne).to.equal('none');
            expect(sectionTwo).to.equal('none');
            expect(sectionOneInner).to.equal('one');
            expect(sectionTwoInner).to.equal('two');
        });

        it('creates visible accordions and closes them all', function(done) {
            let sectionOne, sectionTwo, sectionOneVis, sectionTwoVis, subs=[];
            const action = createViewModel({
                "type": "action",
                "actionType": "event",
                "options": {
                    "target": "test_accordion.collapseAll"
                }
            });
            domStub = createMetadataDomStub(merge(node, {id: "test_accordion"}));
            sectionOneVis = domStub.data[0].sections[0].visible;
            sectionTwoVis = domStub.data[0].sections[1].visible;
            subs.push(sectionOneVis.subscribe(function(update){
                expect(update).to.equal(false);
                setTimeout(function(){
                    sectionOne = document.querySelectorAll('.inner-accordion')[0].style.display;
                    expect(sectionOne).to.equal('none');
                    subs[0].dispose();
                }, 200);
            }));
            subs.push(sectionTwoVis.subscribe(function(update){
                expect(update).to.equal(false);
                setTimeout(function(){
                    sectionTwo = document.querySelectorAll('.inner-accordion')[1].style.display;
                    expect(sectionTwo).to.equal('none');
                    subs[1].dispose();
                    done();
                }, 200);
            }));

            //check to see accordions are open
            sectionOne = document.querySelectorAll('.inner-accordion')[0].style.display;
            sectionTwo = document.querySelectorAll('.inner-accordion')[1].style.display;
            expect(sectionOne).to.equal('');
            expect(sectionTwo).to.equal('');
            expect(sectionOneVis()).to.equal(true);
            expect(sectionTwoVis()).to.equal(true);

            action.action();
        });

        it('creates closed accordions and opens them all', function(done) {
            let sectionOne, sectionTwo, sectionOneVis, sectionTwoVis, subs=[];
            const action = createViewModel({
                "type": "action",
                "actionType": "event",
                "options": {
                    "target": "test_accordion.expandAll"
                }
            });
            domStub = createMetadataDomStub(merge(node, {id: "test_accordion", options: {openByDefault: false}}));
            sectionOneVis = domStub.data[0].sections[0].visible;
            sectionTwoVis = domStub.data[0].sections[1].visible;
            subs.push(sectionOneVis.subscribe(function(update){
                expect(update).to.equal(true);
                setTimeout(function(){
                    sectionOne = document.querySelectorAll('.inner-accordion')[0].style.display;
                    expect(document.querySelectorAll('.inner-accordion')[0].style.display).to.equal('');
                    subs[0].dispose();
                }, 100);
            }));
            subs.push(sectionTwoVis.subscribe(function(update){
                expect(update).to.equal(true);
                setTimeout(function(){
                    sectionTwo = document.querySelectorAll('.inner-accordion')[1].style.display;
                    expect(document.querySelectorAll('.inner-accordion')[1].style.display).to.equal('');
                    subs[1].dispose();
                    done();
                }, 100);
            }));

            //check to see accordions are open
            sectionOne = document.querySelectorAll('.inner-accordion')[0].style.display;
            sectionTwo = document.querySelectorAll('.inner-accordion')[1].style.display;
            expect(sectionOne).to.equal('none');
            expect(sectionTwo).to.equal('none');
            expect(sectionOneVis()).to.equal(false);
            expect(sectionTwoVis()).to.equal(false);

            action.action();
        });

        it('toggle visibility using click',function(done){
            let headers, sectionOne, sectionTwo, sectionOneVis, sectionTwoVis;
            domStub = createMetadataDomStub(node);
            headers = document.querySelectorAll('header.accordion-header');
            sectionOne = document.querySelectorAll('.inner-accordion')[0].style.display;
            sectionTwo = document.querySelectorAll('.inner-accordion')[1].style.display;
            sectionOneVis = domStub.data[0].sections[0].visible;
            sectionTwoVis = domStub.data[0].sections[1].visible;
            expect(sectionOne).to.equal('');
            expect(sectionTwo).to.equal('');
            expect(sectionOneVis()).to.equal(true);
            expect(sectionTwoVis()).to.equal(true);
            headers[0].click();
            headers[1].click();

            setTimeout(function(){
                sectionOne = document.querySelectorAll('.inner-accordion')[0].style.display;
                sectionTwo = document.querySelectorAll('.inner-accordion')[1].style.display;
                expect(sectionOne).to.equal('none');
                expect(sectionTwo).to.equal('none');
                expect(sectionOneVis()).to.equal(false);
                expect(sectionTwoVis()).to.equal(false);
                done();
            },200);
        });
        it('collapse all test',function(done){
            let close, sectionOne, sectionTwo, sectionOneVis, sectionTwoVis;
            domStub = createMetadataDomStub(merge({}, node, {headerTemplate: "accordion_control_header_template"}));
            close = document.querySelector('.fa.fa-compress.action');
            sectionOne = function() { return document.querySelectorAll('.inner-accordion')[0].style.display; };
            sectionTwo = function() { return document.querySelectorAll('.inner-accordion')[1].style.display; };
            sectionOneVis = domStub.data[0].sections[0].visible;
            sectionTwoVis = domStub.data[0].sections[1].visible;
            expect(sectionOne()).to.equal('');
            expect(sectionTwo()).to.equal('');
            expect(sectionOneVis()).to.equal(true);
            expect(sectionTwoVis()).to.equal(true);

            close.click();

            setTimeout(function(){
                expect(sectionOne()).to.equal('none');
                expect(sectionTwo()).to.equal('none');
                expect(sectionOneVis()).to.equal(false);
                expect(sectionTwoVis()).to.equal(false);
                done();
            }, 200);
        });

        it('expand all test',function(done){
            let close, sectionOne, sectionTwo, sectionOneVis, sectionTwoVis;
            domStub = createMetadataDomStub(merge({}, node, {options: { openByDefault: false }, headerTemplate: "accordion_control_header_template"}));
            open = document.querySelector('.fa.fa-expand.action');
            sectionOne = function() { return document.querySelectorAll('.inner-accordion')[0].style.display; };
            sectionTwo = function() { return document.querySelectorAll('.inner-accordion')[1].style.display; };
            sectionOneVis = domStub.data[0].sections[0].visible;
            sectionTwoVis = domStub.data[0].sections[1].visible;
            expect(sectionOne()).to.equal('none');
            expect(sectionTwo()).to.equal('none');
            expect(sectionOneVis()).to.equal(false);
            expect(sectionTwoVis()).to.equal(false);

            open.click();

            setTimeout(function(){
                expect(sectionOne()).to.equal('');
                expect(sectionTwo()).to.equal('');
                expect(sectionOneVis()).to.equal(true);
                expect(sectionTwoVis()).to.equal(true);
                done();
            }, 100);
        });
    });


});