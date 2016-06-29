import _ from 'lodash';
import sandbox from 'scalejs.sandbox';
import adapter from 'test/data/adapter_data.json';
import store from 'test/data/store_data.json';
import setValue from 'test/data/adapterSetValue_data.json';

const get = sandbox.object.get,
      timeout = 100;

let testData = {},
    o = {};


_.merge(testData, adapter, store, setValue);

function mockAjax(request, callback) {
    setTimeout(() => {
        if (request.uri) {
            if (get(request, 'options.type') === 'POST' || get(request, 'options.type') === 'PUT') {
                callback(null, { Status: 'SUCCESS' });
            } else {
                callback(null, testData[request.uri]);
            }
        } else {
            callback('Error', { Status: 'ERROR' });
        }
    }, timeout);
}

export default {
    ajax: mockAjax
};

