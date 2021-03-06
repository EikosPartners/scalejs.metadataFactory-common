import { setRoute } from 'scalejs.navigation';
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

/**
 * Route action to re-route to another page
 *
 * @module route
 *
 * @param {object} node
 *  The configuration object for the route action
 * @param {string} node.type='action'
 *  The type of the node is action
 * @param {string} node.actionType='route'
 *  The actionType of the node is route
 * @param {string} node.text
 *  The text to display on the button
 * @param {object} node.options
 *  The options pertaining to the route action
 * @param {string} node.options.target
 *  The uri to route to
 * @param {object} node.options.data
 *  The data to send along when routing
 * @param {object} node.options.params
 *  Key-value pairs to merge pass along as data when routing
 * @param {string} node.options.paramsKey
 *  The key of the data for the parameters
 *
 * @example
 * {
 *     "type": "action",
 *     "actionType": "route",
 *     "text": "Add User",
 *     "options": {
 *         "target": "add-user"
 *     }
 *  }
 */
function route(options) {
    let data = unwrap(options.data || (this && this.data)),
        target = unwrap(options.target),
        params;

    if (options.params && options.paramsKey) {
        data = merge(data, options[options.paramsKey]);
    }

    params = options.params ? renderParams(options.params, data) : undefined;

    if (options.renderTarget) {
        target = mustache.render(target, data);
    }

    setRoute(target, params);
}

registerActions({ route });