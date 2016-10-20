import noticeboard from 'scalejs.noticeboard';
import storeViewModel from 'store/storeViewModel';
import { registerViewModels, createViewModel, createViewModels } from 'scalejs.metadataFactory';
import { notify } from 'scalejs.messagebus';
import _ from 'lodash';
import 'chai';

import 'action/actionModule';
import 'action/actions/event';
import 'action/actions/ajax';

let expect = chai.expect,
    store;

const node = {
    "id": "store",
    "type": "store",
    "storeKey": "storeResult",
    "dataSourceEndpoint": {
        "uri": "store"
    }
};

describe('storeViewModel test', function () {
    this.timeout(0);

    before(function (done) {
        registerViewModels({
            store: storeViewModel
        });

        store = createViewModel(node);
        done();
    });

    after(function () {
        store.dispose();
    })

    it('saves single object from endpoint to store', function (done) {
        let subscription = noticeboard.subscribe('storeResult', function (value) {
            if (value) {
                expect(value).to.deep.equal({
                    "A": "store_a",
                    "B": "store_b"
                });
                done();
                subscription.dispose();
            }
        });
    });
    it('tests when there is an endpoint error', function (done) {
        let testJson = _.merge(node, {
            "keyMap": {
                "resultsKey": "results"
            },
            "storeKey": "storeResultKeyError",
            "dataSourceEndpoint": {
                "uri": "error-endpoint"
            }
        }),
            testStore = createViewModel(testJson),
            subscription = noticeboard.subscribe('storeResultKeyError', function (value) {
                if (value) {
                    expect(value).to.deep.equal(
                        { Status: 'Error', message: 'Error' }
                    );
                    subscription.dispose();
                    testStore.dispose();
                    done();

                }
            });

    });
    it('refresh the store', function (done) {
        let key = 'storeResult';

        // take the content of the noticeboard, change the value
        noticeboard.setValue(key, undefined);

        let refreshSubscription = noticeboard.subscribe(key, function (value) {
            if (value) {
                expect(value).to.deep.equal({
                    "A": "store_a",
                    "B": "store_b"
                });
                refreshSubscription.dispose();
                done();
            }

        });
        // refresh the data and it should revert back to original values
        notify('store.refresh');


    });

    it('saves objects from endpoint with keymap', function (done) {
        let testJson = _.merge(node, {
            "keyMap": {
                "resultsKey": "results"
            },
            "storeKey": "storeResultKey",
            "dataSourceEndpoint": {
                "uri": "store_B"
            }
        }),
            testStore = createViewModel(testJson),
            subscription = noticeboard.subscribe('storeResultKey', function (value) {
                if (value) {
                    expect(value).to.deep.equal([
                        {
                            "A_result": "store_a"
                        },
                        {
                            "B_result": "store_a"
                        }
                    ]);
                    done();
                    subscription.dispose();
                }
            });
        testStore.dispose();

    });

    it('maps arrays to dictionaries with mapped key', function (done) {
        let testJson = _.merge(node, {
            "keyMap": {
                "resultsKey": "lookup"
            },
            "storeKey": "MappedLookupTest",
            "options": {
                "mapArrayToDictionaryWithKey": "A",
            },
            "dataSourceEndpoint": {
                "uri": "storeLookup"
            }
        }),
            testStore = createViewModel(testJson),
            subscription = noticeboard.subscribe('MappedLookupTest', function (value) {
                if (value) {
                    expect(value).to.deep.equal({
                        "store_a": {
                            "A": "store_a",
                            "B": "store_b"
                        },
                        "store_a_2": {
                            "A": "store_a_2",
                            "B": "store_b_2"
                        },
                        "store_a_3": {
                            "A": "store_a_3"
                        }
                    });
                    subscription.dispose();
                    testStore.dispose();
                    done();
                }
            });
    });

    it('maps arrays to dictionaries with a resultsValueKey', function (done) {
        let testJson = _.merge(node, {
            "keyMap": {
                "resultsKey": "lookup",
                "resultsValueKey": "value"
            },
            "storeKey": "MappedResultsKeyTest",
            "options": {
                "mapArrayToDictionaryWithKey": "key"
            },
            "dataSourceEndpoint": {
                "uri": "storeLookup2"
            }
        }),
            testStore = createViewModel(testJson),

            subscription = noticeboard.subscribe('MappedResultsKeyTest', function (value) {
                if (value) {
                    expect(value).to.deep.equal({
                        "store_a": "store_b",
                        "store_a_2": "store_b_2"
                    })
                    subscription.dispose();
                    testStore.dispose();
                    done();
                }
            });

    });

    it('maps and aggregates array values to dictionary', function (done) {
        let testJson = _.merge(node, {
            "keyMap": {
                "resultsKey": "lookup"
            },
            "storeKey": "AggregateMappedLookupTest",
            "options": {
                "mapArrayToDictionaryWithKey": "key",
                "aggregateMappedItems": true
            },
            "dataSourceEndpoint": {
                "uri": "storeAggregateLookup"
            }
        }),
            testStore = createViewModel(testJson),

            subscription = noticeboard.subscribe('AggregateMappedLookupTest', function (value) {
                if (value) {
                    expect(value).to.deep.equal({
                        "store_a": [
                            {
                                "key": "store_a",
                                "value": "store_b"
                            },
                            {
                                "key": "store_a",
                                "value": "new store_a"
                            }
                        ],
                        "store_a_2": [
                            {
                                "key": "store_a_2",
                                "value": "store_b_2"
                            },
                            {
                                "key": "store_a_2",
                                "value": "new store_b_2"
                            }
                        ]
                    });
                    subscription.dispose();
                    testStore.dispose();
                    done();
                }
            });

    });

    it('returns early if storekey isnt specified', function (done) {
        // including this test for code coverage.
        let testJson = {
            "type": "store",
            "dataSourceEndpoint": {
                "uri": "store"
            }
        };
        createViewModel(testJson);
        done();
    });


    it('returns early if dateSourceEndpoint isnt specified', function (done) {
        let testJson = {
            "type": "store",
            "keyMap": {
                "resultsKey": "result"
            },
            "storeKey": "storeTest"
        };
        createViewModel(testJson);
        expect(noticeboard.getValue('endpointTest')).to.not.exist;
        done();
    });

});


