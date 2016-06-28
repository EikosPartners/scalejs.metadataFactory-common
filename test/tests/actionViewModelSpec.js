import sandbox from 'scalejs.sandbox';
import { getRegisteredTypes, registerViewModels, createViewModel, createViewModels } from 'scalejs.metadataFactory';
import { receive } from 'scalejs.messagebus';
import 'chai';

import { getRegisteredActions } from 'action/actionModule';

import 'action/actions/event';
import 'action/actions/series';
import 'action/actions/route';
import 'action/actions/ajax';

describe('actionModule test', function () {
    it('registers the action viewModel', function () {
        expect(getRegisteredTypes()).to.include('action');
    });

    it('registers the event action', function (){
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

    it('registers the series action', function (){
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

        receive('series.response', function(params) {
            expect('success ').to.equal(params);
        });

        receive('series.response1', function(params) {
            expect('success ').to.equal(params);
            done();
            action = null;
        });

        action.action();
    });

    it('registers the route action', function (){
        expect(getRegisteredActions()).to.have.property('route');
    });

    it('sets route', function(){
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

    it('sets route with params', function(){
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

    it('registers the ajax action', function (){
        expect(getRegisteredActions()).to.have.property('ajax');
    });
});
