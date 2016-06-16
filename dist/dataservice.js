'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var testData = {
    adapter: {
        A: 'updated',
        B: 'updated'
    }
};

function ajax(r, callback) {
    callback(testData[r.uri]);
}

exports.default = {
    ajax: ajax
};