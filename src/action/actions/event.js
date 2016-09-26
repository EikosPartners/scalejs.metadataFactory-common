import { notify } from 'scalejs.messagebus';
import { unwrap } from 'knockout';
import { merge } from 'scalejs';
import ko from 'knockout';
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
        params = options.params;

    if (options.paramsKey) {
        params = merge(options.params || {}, options[options.paramsKey]);
    }

    if (params) {
        params = renderParams(options.params, data);
    }
    
    notify(unwrap(options.target), params);
}

registerActions({ event });

