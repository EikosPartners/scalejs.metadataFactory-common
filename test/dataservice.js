import { get, merge } from 'scalejs';
import _ from 'lodash';
import adapter from 'test/data/adapter_data.json';
import store from 'test/data/store_data.json';
import setValue from 'test/data/adapterSetValue_data.json';

const timeout = 100;

let testData = {},
    o = {};


_.merge(testData, adapter, store, setValue);

function mockAjax(request, callback) {
    setTimeout(() => {
        if (request.uri) {

            if(request.uri === 'error-endpoint'){
                callback({Status: 'Error', message: 'Error'});
            } else if (get(request, 'options.type') === 'POST' || get(request, 'options.type') === 'PUT') {
                callback(null, { Status: 'SUCCESS', Original: request.data });
            } else {
                callback(null, testData[request.uri]);
            }
        } else {
            callback({Status: 'Error', message: 'Error'});
        }
    }, timeout);
}

export default {
    ajax: mockAjax
};

