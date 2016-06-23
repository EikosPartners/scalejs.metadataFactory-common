import sandbox from 'scalejs.sandbox';
import mustache from 'mustache';
import ko from 'knockout';

import { registerActions } from '../actionModule';

const setRoute = sandbox.navigation.setRoute,
      merge = sandbox.object.merge,
      unwrap = ko.unwrap;

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
        params = options.params ? renderParams(options.params, data) : undefined;

    setRoute(unwrap(options.target), params);
}

registerActions({route});