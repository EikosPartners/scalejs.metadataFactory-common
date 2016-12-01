/* eslint no-unused-vars: ["error", { "argsIgnorePattern": "type|row|meta" }] */
import moment from 'moment';

// sample formatter function
function gridDateFormatter(data, type, row, meta) {
    return moment.utc(data).format('MM/DD/YYYY');
}

export default {
    gridDateFormatter
};