import sandbox from 'scalejs.sandbox';
import { getRegisteredTypes, registerViewModels, createViewModel, createViewModels } from 'scalejs.metadataFactory';
import { receive } from 'scalejs.messagebus';
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

    it('registers the event action', function () {
        expect(getRegisteredActions()).to.have.property('event');
    });

    it('event without params', function (done) {
        let node = {
            "type": "action",
            "actionType": "event",
            "options": {
                "target": "eventTest"
            }
        },
            action = createViewModel(node);

        receive('eventTest', function (params) {
            expect(params).to.equal(undefined);
            done();
            action = null;
        });
        action.action();
    });

    it('event with params', function (done) {
        let node = {
            "type": "action",
            "actionType": "event",
            "options": {
                "target": "eventTest1",
                "params": {
                    "test": 'passing test',
                }
            }
        },
            action = createViewModel(node);

        receive('eventTest1', function (params) {
            expect(params.test).to.equal('passing test');
            done();
            action = null;
        });
        action.action();
    });

    it('event with paramsKey', function (done) {
        let node = {
            "type": "action",
            "actionType": "event",
            "options": {
                "target": "eventTest2",
                "paramsKey": "foo",
                "foo": {
                    "test": 'passing test',
                }
            }
        },
            action = createViewModel(node);

        receive('eventTest2', function (params) {
            expect(params.test).to.equal('passing test');
            done();
            action = null;
        });
        action.action();
    });

    it('event with both params and paramsKey', function (done) {
        let node = {
            "type": "action",
            "actionType": "event",
            "options": {
                "target": "eventTest3",
                "paramsKey": "foo",
                "params": {
                    "test": "passing test"
                },
                "foo": {
                    "test1": 'passing test1',
                }
            }
        },
            action = createViewModel(node);

        receive('eventTest3', function (params) {
            expect(params.test).to.equal('passing test');
            expect(params.test1).to.equal('passing test1');
            done();
            action = null;
        });
        action.action();
    });

    it('registers the series action', function () {
        expect(getRegisteredActions()).to.have.property('series');
    });

    it('series with 2 events', function (done) {
        let node = {
            "type": "action",
            "actionType": "series",
            "options": {
                "actions": [
                    {
                        "type": "action",
                        "actionType": "event",
                        "options": {
                            "target": "series.response",
                            "params": "success "
                        }
                    },
                    {
                        "type": "action",
                        "actionType": "event",
                        "options": {
                            "target": "series.response1",
                            "params": "success "
                        }
                    }
                ]
            }
        },
            action = createViewModel(node);

        receive('series.response', function (params) {
            expect('success ').to.equal(params);
        });

        receive('series.response1', function (params) {
            expect('success ').to.equal(params);
            done();
            action = null;
        });

        action.action();
    });

    it('registers the route action', function () {
        expect(getRegisteredActions()).to.have.property('route');
    });

    it('sets route', function () {
        const getCurrent = sandbox.navigation.getCurrent,
            setRoute = sandbox.navigation.setRoute,
            node = {
                "type": "action",
                "actionType": "route",
                "options": {
                    "target": "routeTest",
                }
            };
        let action = createViewModel(node);
        action.action();
        expect(getCurrent().url).to.equal('routeTest');
        setRoute('');
    });

    it('sets route with params', function () {
        const getCurrent = sandbox.navigation.getCurrent,
            setRoute = sandbox.navigation.setRoute,
            node = {
                "type": "action",
                "actionType": "route",
                "options": {
                    "target": "routeTest",
                    "params": {
                        "uniqueId": "{{id}}"
                    },
                    "data": {
                        "id": "test"
                    }
                }
            };
        let action = createViewModel(node);
        action.action();
        expect(getCurrent().url).to.equal('routeTest/?uniqueId=test');
        setRoute('');
    });

    it('registers the ajax action', function () {
        expect(getRegisteredActions()).to.have.property('ajax');
    });

    it('regiseter the popup action', function () {
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
            expect('success').to.equal(params);
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
                            "target": "ajax.response1",
                            "params": "failure"
                        }
                    }
                ]
            }
        };

        let action = createViewModel.call({}, node);

        receive('ajax.response1', function (params) {
            expect('failure').to.equal(params);
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
});
