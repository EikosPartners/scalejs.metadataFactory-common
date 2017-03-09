import { notify } from 'scalejs.messagebus';
import { unwrap } from 'knockout';
import { merge } from 'scalejs';
import mustache from 'mustache';

import { registerActions } from '../actionModule';

function renderParams(params, data) {
    let ret = params;
    try {
        ret = JSON.parse(
            mustache.render(JSON.stringify(params), data)
        );
    } catch (ex) {
        console.error('Unable to JSON parse/stringify params', ex);
    }

    return ret;
}


function event(options) {
    let data = unwrap(this && this.data),
        optionData = options.data || {};
    let params = options.params;

    if (options.paramsKey) {
        params = merge(params || {}, options[options.paramsKey]);
    }

    if (options.useOptions) {
        optionData = options;
    }

    if (params && options.renderParams !== false) {
        params = renderParams(params, merge(data, optionData));
    }

    notify(unwrap(options.target), params);
}

registerActions({ event });

