'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// sample formatter function
function gridDateFormatter(data, type, row, meta) {
    return _moment2.default.utc(data).format('MM/DD/YYYY');
} /* eslint no-unused-vars: ["error", { "argsIgnorePattern": "type|row|meta" }] */
exports.default = {
    gridDateFormatter: gridDateFormatter
};
//# sourceMappingURL=gridRegistry.js.map