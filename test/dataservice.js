import _ from 'lodash';
import adapter from 'test/data/adapter_data.json';
import store from 'test/data/store_data.json';
import setValue from 'test/data/adapterSetValue_data.json';

let timeout = 100,
    testData = {},
    o = {};
    
_.merge(testData, adapter, store, setValue);

function mockAjax(request, callback) {
    setTimeout(() => {
        callback(null, testData[request.uri]);
    }, timeout);
}

export default {
    ajax: mockAjax
};

