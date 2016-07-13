import { setRoute } from 'scalejs.navigation';
import { unwrap } from 'knockout';
import { merge } from 'scalejs';
import mustache from 'mustache';
import ko from 'knockout';

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

function route(options) {
    let data = unwrap(options.data || (this && this.data)),
        params;
    if (options.params && options.paramsKey) {
        data = merge(data, options[options.paramsKey]);
    }
    params = options.params ? renderParams(options.params, data) : undefined;

    setRoute(unwrap(options.target), params);
}

registerActions({ route });