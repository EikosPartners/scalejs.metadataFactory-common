/* eslint no-unused-vars: ["error", { "args": "none" }]*/
// import registry from 'scalejs.metadatafactory-common/dist/grid/registry/gridRegistry';
import registry from '../../grid/registry/gridRegistry';
import moment from 'moment';

function gridUpperCase(data, type, row, meta) {
    return data.toUpperCase();
}

function gridDateFormatter(data, type, row, meta) {
    let date = '';
    if (data) {
        date = moment.utc(data).format('DD MMM YYYY') || '';
    }
    return date;
}

registry.register('gridDateFormatter', gridDateFormatter);
registry.register('gridUpperCase', gridUpperCase);