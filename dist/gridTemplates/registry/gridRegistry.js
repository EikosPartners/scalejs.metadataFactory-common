'use strict';

var _gridRegistry = require('../../grid/registry/gridRegistry');

var _gridRegistry2 = _interopRequireDefault(_gridRegistry);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint no-unused-vars: ["error", { "args": "none" }]*/
// import registry from 'scalejs.metadatafactory-common/dist/grid/registry/gridRegistry';
function gridUpperCase(data, type, row, meta) {
    return data.toUpperCase();
}

function gridDateFormatter(data, type, row, meta) {
    var date = '';
    if (data) {
        date = _moment2.default.utc(data).format('DD MMM YYYY') || '';
    }
    return date;
}

_gridRegistry2.default.register('gridDateFormatter', gridDateFormatter);
_gridRegistry2.default.register('gridUpperCase', gridUpperCase);
//# sourceMappingURL=gridRegistry.js.map