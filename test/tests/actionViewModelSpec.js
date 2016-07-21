import { getRegisteredTypes, registerViewModels, createViewModel, createViewModels } from 'scalejs.metadataFactory';
import { getCurrent, setRoute } from 'scalejs.navigation';
import { createMetadataDomStub } from 'utils';
import noticeboard from 'scalejs.noticeboard';
import { receive } from 'scalejs.messagebus';
import { merge } from 'lodash';
import ko from 'knockout';
import 'chai';

import { getRegisteredActions } from 'action/actionModule';

import 'action/actions/event';
import 'action/actions/series';
import 'action/actions/route';
import 'action/actions/ajax';
import 'action/actions/popup/popup';


describe('actionModule test', function () {
    it('registers the action viewModel', function () {
        expect(getRegisteredTypes()).to.include('action');
    });

    it('creates an improper action', function () {
        const node = {
            "type": "action",
            "actionType": "doesntExist"
        },
            action = createViewModel(node);

        action.action();
        expect(getRegisteredTypes()).to.not.include('doesntExist');
    });

    describe('event action tests', function () {
        const node = {
            "type": "action",
            "actionType": "event",
            "options": {
                "target": "eventTest"
            }
        };

        it('registers the event action', function () {
            expect(getRegisteredActions()).to.have.property('event');
        });

        it('event without params', function (done) {
            const action = createViewModel(node);

            const sub = receive('eventTest', function (params) {
                expect(params).to.equal(undefined);
                sub.dispose();
                done();
            });

            action.action();
        });

        it('event with params', function (done) {
            const action = createViewModel(merge({}, node, {
                "options": {
                    "params": {
                        "test": "passing test"
                    }
                }
            }));

            const sub = receive('eventTest', function (params) {
                expect(params.test).to.equal('passing test');
                sub.dispose();
                done();
            });

            action.action();
        });

        it('event with paramsKey', function (done) {
            const action = createViewModel(merge({}, node, {
                "options": {
                    "paramsKey": "foo",
                    "foo": {
                        "test": 'passing test'
                    }
                }
            }));

            const sub = receive('eventTest', function (params) {
                expect(params.test).to.equal('passing test');
                sub.dispose();
                done();
            });

            action.action();
        });

        it('event with both params and paramsKey', function (done) {
            const action = createViewModel(merge({}, node, {
                "options": {
                    "paramsKey": "foo",
                    "params": {
                        "test": "passing test"
                    },
                    "foo": {
                        "test1": 'passing test1',
                    }
                }
            }));

            const sub = receive('eventTest', function (params) {
                expect(params.test).to.equal('passing test');
                expect(params.test1).to.equal('passing test1');
                sub.dispose();
                done();
            });

            action.action();
        });

        it('event with button click', function (done) {
            const action = merge({}, node, {
                "icon": "foo",
                "options": {
                    "params": {
                        "test": "passing test"
                    }
                }
            }),
                sub = receive('eventTest', function (params) {
                    expect(params.test).to.equal('passing test');
                    testAction.dispose();
                    sub.dispose();
                    done();
                }),
                testAction = createMetadataDomStub(action);

            document.querySelector('.action-button-wrapper button').click();
        });

        it('create action button with icon', function (done) {
            const action = merge({}, node, {
                "icon": "foo"
            }),
                testAction = createMetadataDomStub(action);
            expect(document.querySelector('.fa-foo')).to.not.equal(undefined);
            done();

        });

        it('event with immediate action', function (done) {
            const sub = receive('eventTest', function (params) {
                expect(params.test).to.equal('passing test');
                sub.dispose();
                done();
            }),
                action = createViewModel(merge({}, node, {
                    "immediate": true,
                    "options": {
                        "params": {
                            "test": "passing test"
                        }
                    }
                }));
        });

        it('event with validate', function (done) {
            const action = createViewModel(merge({}, node, {
                "validate": "eventValidate",
                "options": {
                    "params": {
                        "test": "passing test"
                    }
                }
            })),
                sub = receive('eventTest', function (params) {
                    expect(params.test).to.equal('passing test');
                    sub.dispose();
                    done();
                }),
                sub1 = receive('eventValidate', function (actionObj) {
                    actionObj.successCallback(actionObj.options);
                    sub1.dispose();
                });

            action.action();
        });
    });

    describe('series action tests', function () {
        const node = {
            "type": "action",
            "actionType": "series",
            "options": {
                "actions": [
                    {
                        "type": "action",
                        "actionType": "event",
                        "options": {
                            "target": "seriesTest",
                            "params": "success "
                        }
                    },
                    {
                        "type": "action",
                        "actionType": "event",
                        "options": {
                            "target": "seriesTest1",
                            "params": "success "
                        }
                    }
                ]
            }
        };

        it('registers the series action', function () {
            expect(getRegisteredActions()).to.have.property('series');
        });

        it('series with 2 events', function (done) {
            const action = createViewModel(node);
            let subs = [];

            subs.push(receive('seriesTest', function (params) {
                expect(params).to.equal('success ');
                subs[0].dispose();
            }));

            subs.push(receive('seriesTest1', function (params) {
                expect(params).to.equal('success ');
                subs[1].dispose();
                done();
            }));

            action.action();
        });
    });

    describe('route action tests', function () {
        const node = {
            "type": "action",
            "actionType": "route",
            "options": {
                "target": "routeTest",
            }
        };

        it('registers the route action', function () {
            expect(getRegisteredActions()).to.have.property('route');
        });

        it('sets route', function () {
            const action = createViewModel(node);

            action.action();
            expect(getCurrent().url).to.equal('routeTest');
            setRoute('');
        });

        it('sets route with params and data', function () {
            const action = createViewModel(merge({}, node, {
                "options": {
                    "params": {
                        "uniqueId": "{{id}}"
                    },
                    "data": {
                        "id": "test"
                    }
                }
            }));

            action.action();
            expect(getCurrent().url).to.equal('routeTest/?uniqueId=test');
            setRoute('');
        });

        it('sets route with params and data and fails', function () {
            const action = createViewModel(merge({}, node, {
                "options": {
                    "params": {
                        "uniqueId": "{{{id}}}"
                    },
                    "data": {
                        "id": '"iminvalid"' //array causes exception we think
                    }
                }
            }));

            action.action();
            //expect {{id}} to not be replaced because of failure
            expect(getCurrent().url).to.equal('routeTest/?uniqueId=%7B%7B%7Bid%7D%7D%7D');
            setRoute('');
        });
    });

    describe('ajax action tests', function () {
        const nodeGET = {
            "type": "action",
            "actionType": "ajax",
            "options": {
                "target": {
                    "uri": "store",
                    "options": {
                        "type": "get"
                    }
                },
                "nextActions": [
                    {
                        "type": "action",
                        "actionType": "event",
                        "options": {
                            "target": "ajaxTest",
                            "params": "success"
                        }
                    }
                ],
                "errorActions": [
                    {
                        "type": "action",
                        "actionType": "event",
                        "options": {
                            "target": "ajaxTestError",
                            "params": "failure"
                        }
                    }
                ]
            }
        },
            nodePOST = {
                "type": "action",
                "actionType": "ajax",
                "options": {
                    "target": {
                        "uri": "test",
                        "options": {
                            "type": "POST"
                        }
                    }
                }
            };

        it('registers the ajax action', function () {
            expect(getRegisteredActions()).to.have.property('ajax');
        });

        it('creates a get ajax action', function (done) {
            const action = createViewModel.call({}, nodeGET),
                sub = receive('ajaxTest', function (params) {
                    expect(params).to.equal('success');
                    sub.dispose();
                    done();
                });
            action.action();
        });

        it('creates an ajax get action and fails', function (done) {
            const action = createViewModel.call({}, merge({}, nodeGET, {
                "options": {
                    "target": {
                        "uri": ""
                    }
                }
            })),
                sub = receive('ajaxTestError', function (params) {
                    expect(params).to.equal('failure');
                    sub.dispose();
                    done();
                });
            action.action();
        });

        it('creates an ajax post action', function (done) {
            const action = createViewModel.call({}, merge({}, nodePOST, {
                "options": {
                    "target": {
                        "data": {
                            "test": "test",
                            "test1": "test1"
                        }
                    },
                    "nextActions": [
                        {
                            "type": "action",
                            "actionType": "event",
                            "options": {
                                "target": "ajaxTest",
                                "paramsKey": "results"
                            }
                        }
                    ]
                }
            })),
                sub = receive('ajaxTest', function (params) {
                    expect(params.Original.test).to.equal('test');
                    expect(params.Original.test1).to.equal('test1');
                    sub.dispose();
                    done();
                });
            action.action();
        });

        it('creats ajax action with data from context', function (done) {
            let data = ko.observable({ test: "test", test1: "test1" });
            const action = createViewModel.call({ data }, merge({}, nodePOST, {
                "options": {
                    "nextActions": [
                        {
                            "type": "action",
                            "actionType": "event",
                            "options": {
                                "target": "ajaxTest",
                                "paramsKey": "results"
                            }
                        }
                    ]
                }
            })),
                sub = receive('ajaxTest', function (params) {
                    expect(params.Original.test).to.equal('test');
                    expect(params.Original.test1).to.equal('test1');
                    sub.dispose();
                    done();
                });

            action.action();
        });

        it('creates ajax action with data from selected keys', function (done) {
            let data = ko.observable({ test: "test", test1: "test1" });
            const action = createViewModel.call({ data }, merge({}, nodePOST, {
                "options": {
                    "sendDataKeys": [
                        "test"
                    ],
                    "nextActions": [
                        {
                            "type": "action",
                            "actionType": "event",
                            "options": {
                                "target": "ajaxTest",
                                "paramsKey": "results"
                            }
                        }
                    ]
                }
            })),
                sub = receive('ajaxTest', function (params) {
                    expect(params.Original.test).to.equal('test');
                    expect(params.Original.test1).to.equal(undefined);
                    sub.dispose();
                    done();
                });

            action.action();
        });

        it('creates ajax action with data from selected keys and remaps key', function (done) {
            let data = ko.observable({ test: "test", test1: "test1" });
            const action = createViewModel.call({ data }, merge({}, nodePOST, {
                "options": {
                    "sendDataKeys": [
                        { "newTest": "test" }
                    ],
                    "nextActions": [
                        {
                            "type": "action",
                            "actionType": "event",
                            "options": {
                                "target": "ajaxTest",
                                "paramsKey": "results"
                            }
                        }
                    ]
                }
            })),
                sub = receive('ajaxTest', function (params) {
                    expect(params.Original.newTest).to.equal('test');
                    expect(params.Original.test1).to.equal(undefined);
                    sub.dispose();
                    done();
                });

            action.action();
        });

        it('creates ajax action with data from selected keys and remaps key with incorrect keys', function (done) {
            let data = ko.observable({ test: "test", test1: "test1" });
            const action = createViewModel.call({ data }, merge({}, nodePOST, {
                "options": {
                    "sendDataKeys": [
                        { "newTest": "test2" }
                    ],
                    "nextActions": [
                        {
                            "type": "action",
                            "actionType": "event",
                            "options": {
                                "target": "ajax.response6",
                                "paramsKey": "results"
                            }
                        }
                    ]
                }
            })),
                sub = receive('ajax.response6', function (params) {
                    expect(params.Original.newTest).to.equal(null);
                    expect(params.Original.test).to.equal(undefined);
                    expect(params.Original.test1).to.equal(undefined);
                    sub.dispose();
                    done();
                });

            action.action();
        });

        it('calls action twice with updated data'); // todo: imp this test to make sure mutations dont occur
        it('sends data from a key - sendDataFromKey', function (done) {
            let data = ko.observable({ test7: "test7", test3: "test3" });
            const action = createViewModel.call({ data }, merge({}, nodePOST, {
                "options": {
                    "sendDataFromKey": "test7",
                    "nextActions": [
                        {
                            "type": "action",
                            "actionType": "event",
                            "options": {
                                "target": "ajaxTest",
                                "paramsKey": "results"
                            }
                        }
                    ]
                }
            })),
                sub = receive('ajaxTest', function (params) {
                    expect(params.Original).equals("test7");
                    sub.dispose();
                    done();
                });

            action.action();
        });

        it('renders ajax url from noticeboard', function (done) {
            const node = {
                "type": "action",
                "actionType": "ajax",
                "options": {
                    "target": {
                        "uri": "test/{{testValue}}"
                    }
                }
            };
            let action = createViewModel.call({}, node);
            noticeboard.setValue('testValue', 'testURI');
            action.action({
                callback: function (err, data) {
                    expect(data).to.deep.equal({
                        "test": "success"
                    });
                    done();
                }
            });
        });

        it('renders ajax url from context', function (done) {
            const node = {
                "type": "action",
                "actionType": "ajax",
                "options": {
                    "target": {
                        "uri": "test/{{testContextValue}}"
                    }
                }
            };
            let contextData = {
                data: {
                    testContextValue: 'testContext'
                }
            },
                action = createViewModel.call(contextData, node);

            action.action.call(contextData, {
                callback: function (err, data) {
                    expect(data).to.deep.equal({
                        "testContext": "success"
                    });
                    done();
                }
            });
        });

    });

    describe('popup action tests', function () {
        const nodeOpen = {
            "type": "action",
            "actionType": "popup",
            "options": {
                "title": "Test Title",
                "classes": "popup-test-class"
            }
        },
            nodeClose = {
                "type": "action",
                "actionType": "closePopup",
                "text": "close"
            };
        it('register the popup and closePopup action', function () {
            expect(getRegisteredActions()).to.have.property('popup');
            expect(getRegisteredActions()).to.have.property('closePopup');
        });

        it('creates and closes the popup', function () {

            const action = createViewModel(merge({}, nodeOpen, { "options": { "message": "Test Message" } })),
                closeAction = createViewModel(nodeClose);

            //open the popup
            action.action();
            expect(document.querySelector('#popup_header h1').innerHTML).to.equal('Test Title');
            expect(document.querySelector('.popup-test-class')).to.exist;

            //close the popup
            closeAction.action();
            expect(document.querySelector('#popup_header h1')).to.equal(null);
        });

        it('creates a popup with a data message and closes the popup', function () {
            let data = ko.observable({ message: "Message" });
            const action = createViewModel.call({ data }, merge({}, nodeOpen, { "options": { "message": "Test {{message}}" } }));

            action.action();
            expect(document.querySelector('.popup-message').innerHTML).to.equal('Test Message');
        });

        it('creates a action popup and completes an event as an actions property', function (done) {

            const action = createViewModel(merge({}, nodeOpen, {
                "options": {
                    "template": "action_popup_template",
                    "message": "Test Message",
                    "actions": [
                        {
                            "type": "action",
                            "actionType": "event",
                            "options": {
                                "target": "actionsTest",
                                "params": {
                                    "test": "passing test"
                                }
                            }
                        }
                    ]
                }
            })),
                sub = receive('actionsTest', function (params) {
                    expect(params.test).to.equal('passing test');
                    sub.dispose();
                    done();
                });
            action.action();
            document.querySelector('.btn.btn-default-primary').click();
        });

        it('creates a action popup and completes an event as an actions property w/ hideAfter', function (done) {

            const action = createViewModel(merge({}, nodeOpen, {
                "options": {
                    "template": "action_popup_template",
                    "message": "Test Message",
                    "hideAfter": true,
                    "actions": [
                        {
                            "type": "action",
                            "actionType": "event",
                            "options": {
                                "target": "actionsTest",
                                "params": {
                                    "test": "passing test"
                                }
                            }
                        }
                    ]
                }
            })),
                sub = receive('actionsTest', function (params) {
                    expect(params.test).to.equal('passing test');
                    sub.dispose();
                    done();
                });

            action.action();
            document.querySelector('.btn.btn-default-primary').click();
        });

        it('tests options.hideDelay', function (done) {
            console.log("inside hide delay");
            const action = createViewModel(merge({}, nodeOpen, {
                "options": {
                    "template": "action_popup_template",
                    "message": "Test Message",
                    "hideDelay": 1,
                    "actions": [
                        {
                            "type": "action",
                            "actionType": "event",
                            "options": {
                                "target": "actionsTest",
                                "params": {
                                    "test": "passing test"
                                }
                            }
                        }
                    ]
                }
            }));

            console.log("THIS IS THE ACTION", action);
            expect(action.options.hideDelay).equals(1);
            action.action();
            document.querySelector('.btn.btn-default-primary').click();
            done();

        });

    });
});
