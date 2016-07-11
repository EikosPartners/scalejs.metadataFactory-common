import { getRegisteredTypes, registerViewModels, createViewModel, createViewModels } from 'scalejs.metadataFactory';
import { getCurrent, setRoute } from 'scalejs.navigation';
import { createMetadataDomStub } from 'utils';
import { receive } from 'scalejs.messagebus';
import { merge } from 'scalejs';
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

    it('creates an imporper action', function() {
        const node = {
                "type": "action",
                "actionType": "deosntExist"
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
            const action = createViewModel(merge(node, {
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
            const action = createViewModel(merge(node, {
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
            const action = createViewModel(merge(node, {
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

        it('event with button click', function (done){
            const action = merge(node, {
                "icon": "foo",
                "options": {
                    "params": {
                        "test" : "passing test"
                    }
                }
            }),
            sub = receive('eventTest', function(params) {
                expect(params.test).to.equal('passing test');
                testAction.dispose();
                sub.dispose();
                done();
            }),
            testAction = createMetadataDomStub(action);

            document.querySelector('.action-button-wrapper button').click();
        });

        it('create action button with icon', function (done){
            const action = merge(node, {
                "icon": "foo"
            }),
            testAction = createMetadataDomStub(action);
            expect(document.querySelector('.fa-foo')).to.not.equal(undefined);
            done();

        });

        it('event with immediate action', function (done){
            const sub = receive('eventTest', function(params) {
                expect(params.test).to.equal('passing test');
                sub.dispose();
                done();
            }),
            action = createViewModel(merge(node, {
                "immediate": true,
                "options": {
                    "params": {
                        "test" : "passing test"
                    }
                }
            }));
        });

        it('event with validate', function(done){
            const action = createViewModel(merge(node, {
                "validate": "eventValidate",
                "options": {
                    "params": {
                        "test" : "passing test"
                    }
                }
            })),
            sub = receive('eventTest', function(params) {
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
            const action = createViewModel(merge(node,{
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
    });

    describe('ajax action tests', function () {

        it('registers the ajax action', function () {
            expect(getRegisteredActions()).to.have.property('ajax');
        });

        it('creates a get ajax action', function (done) {
            const node = {
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
                                "target": "ajax.response",
                                "params": "success"
                            }
                        }
                    ],
                    "errorActions": [
                        {
                            "type": "action",
                            "actionType": "event",
                            "options": {
                                "target": "ajax.response",
                                "params": "failure"
                            }
                        }
                    ]
                }
            };

            let action = createViewModel.call({}, node);

            receive('ajax.response', function (params) {
                expect(params).to.equal('success');
                done();
                action = null;
            });
            action.action();
        });

        it('creates an ajax get action and fails', function (done) {
            const node = {
                "type": "action",
                "actionType": "ajax",
                "options": {
                    "target": {
                        "uri": "",
                        "options": {
                            "type": "get"
                        }
                    },
                    "nextActions": [
                        {
                            "type": "action",
                            "actionType": "event",
                            "options": {
                                "target": "ajax.response1",
                                "params": "success"
                            }
                        }
                    ],
                    "errorActions": [
                        {
                            "type": "action",
                            "actionType": "event",
                            "options": {
                                "message": "error",
                                "target": "ajax.response1",
                                "params": "failure"
                            }
                        }
                    ]
                }
            };

            let action = createViewModel.call({}, node);

            receive('ajax.response1', function (params) {
                expect(params).to.equal('failure');
                done();
                action = null;
            });
            action.action();
        });

        it('creates an ajax post action', function (done) {
            const node = {
                "type": "action",
                "actionType": "ajax",
                "options": {
                    "target": {
                        "uri": "test",
                        "options": {
                            "type": "POST"
                        },
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
                                "target": "ajax.response2",
                                "paramsKey": "results"
                            }
                        }
                    ]
                }
            };

            receive('ajax.response2', function (params) {
                expect(params.Original.test).to.equal('test');
                expect(params.Original.test1).to.equal('test1');
                done();
                action = null;
            });
            let action = createViewModel.call({}, node);
            action.action();
        });

        it('creats ajax action with data from context', function (done){
            const node = {
                "type": "action",
                "actionType": "ajax",
                "options": {
                    "target": {
                        "uri": "test",
                        "options": {
                            "type": "POST"
                        }
                    },
                    "nextActions": [
                        {
                            "type": "action",
                            "actionType": "event",
                            "options": {
                                "target": "ajax.response3",
                                "paramsKey": "results"
                            }
                        }
                    ]
                }
            };

            let data = ko.observable({test: "test", test1: "test1"});
            let action = createViewModel.call({data}, node);

            receive('ajax.response3', function (params) {
                expect(params.Original.test).to.equal('test');
                expect(params.Original.test1).to.equal('test1');
                done();
                action = null;
            });

            action.action();
        });

        it('creates ajax action with data from selected keys', function (done) {
            const node = {
                "type": "action",
                "actionType": "ajax",
                "options": {
                    "sendDataKeys": [
                        "test"
                    ],
                    "target": {
                        "uri": "test",
                        "options": {
                            "type": "POST"
                        }
                    },
                    "nextActions": [
                        {
                            "type": "action",
                            "actionType": "event",
                            "options": {
                                "target": "ajax.response4",
                                "paramsKey": "results"
                            }
                        }
                    ]
                }
            };

            let data = ko.observable({test: "test", test1: "test1"});
            let action = createViewModel.call({data}, node);

            receive('ajax.response4', function (params) {
                expect(params.Original.test).to.equal('test');
                expect(params.Original.test1).to.equal(undefined);
                done();
                action = null;
            });

            action.action();
        });

        it('creates ajax action with data from selected keys and remaps key', function (done) {
            const node = {
                "type": "action",
                "actionType": "ajax",
                "options": {
                    "sendDataKeys": [
                        { "newTest": "test" }
                    ],
                    "target": {
                        "uri": "test",
                        "options": {
                            "type": "POST"
                        }
                    },
                    "nextActions": [
                        {
                            "type": "action",
                            "actionType": "event",
                            "options": {
                                "target": "ajax.response5",
                                "paramsKey": "results"
                            }
                        }
                    ]
                }
            };

            let data = ko.observable({test: "test", test1: "test1"});
            let action = createViewModel.call({data}, node);

            receive('ajax.response5', function (params) {
                expect(params.Original.newTest).to.equal('test');
                expect(params.Original.test1).to.equal(undefined);
                done();
                action = null;
            });

            action.action();
        });

        it('creates ajax action with data from selected keys and remaps key with incorrect keys', function (done) {
            const node = {
                "type": "action",
                "actionType": "ajax",
                "options": {
                    "sendDataKeys": [
                        { "newTest": "test2" }
                    ],
                    "target": {
                        "uri": "test",
                        "options": {
                            "type": "POST"
                        }
                    },
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
            };

            let data = ko.observable({test: "test", test1: "test1"});
            let action = createViewModel.call({data}, node);

            receive('ajax.response6', function (params) {
                expect(params.Original.newTest).to.equal(null);
                expect(params.Original.test).to.equal(undefined);
                expect(params.Original.test1).to.equal(undefined);
                done();
                action = null;
            });

            action.action();
        });

    });

    describe('popup action tests', function () {

        it('regiseter the popup and closePopup action', function () {
            expect(getRegisteredActions()).to.have.property('popup');
            expect(getRegisteredActions()).to.have.property('closePopup');
        });

        it('creates and closes the popup', function () {
            const node = {
                "type": "action",
                "actionType": "popup",
                "options": {
                    "title": "Test Title",
                    "message": "Test Popup"
                }
            },
                node2 = {
                    "type": "action",
                    "actionType": "closePopup",
                    "text": "close"
                };
            let action = createViewModel(node);
            let closeAction = createViewModel(node2);

            //open the popup
            action.action();
            expect(document.querySelector('#popup_header h1').innerHTML).to.equal('Test Title');

            //close the popup
            closeAction.action();
            expect(document.querySelector('#popup_header h1')).to.equal(null);
        });

        it('creates a popup with a data message and closes the popup', function () {
            const node = {
                "type": "action",
                "actionType": "popup",
                "options": {
                    "title": "Test Title",
                    "message": "Test {{message}}"
                }
            };

            let data = ko.observable({ message: "Message" });
            let action = createViewModel.call({data}, node);
            action.action();
            expect(document.querySelector('.popup-message').innerHTML).to.equal('Test Message');
        });

        it('creates a action popup and completes an event as an actions property', function (done) {
            const node = {
                "type": "action",
                "actionType": "popup",
                "options": {
                    "template": "action_popup_template",
                    "title": "Test",
                    "message": "Test",
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
            };

            let action = createViewModel(node);

            receive('actionsTest', function (params) {
                expect(params.test).to.equal('passing test');
                done();
                action = null;
            });

            action.action();
            document.querySelector('.btn.btn-default-primary').click();
        });

        it('creates a action popup and completes an event as an actions property w/ hideAfter', function (done) {
            const node = {
                "type": "action",
                "actionType": "popup",
                "options": {
                    "template": "action_popup_template",
                    "title": "Test",
                    "message": "Test",
                    "hideAfter": true,
                    "actions": [
                        {
                            "type": "action",
                            "actionType": "event",
                            "options": {
                                "target": "actionsTest1",
                                "params": {
                                    "test": "passing test"
                                }
                            }
                        }
                    ]
                }
            };

            let action = createViewModel(node);

            receive('actionsTest1', function (params) {
                expect(params.test).to.equal('passing test');
                done();
                action = null;
            });

            action.action();
            document.querySelector('.btn.btn-default-primary').click();
        });
    });
});
