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

/**
 * Event action to notify an event to all its subscribers
 *
 * @module event
 *
 * @param {object} node
 *  The configuration object for the event action
 * @param {string} node.type='action'
 *  The type of the node is action
 * @param {string} node.actionType='event'
 *  The actionType of the node is event
 * @param {object} node.options
 *  The options pertaining to the event action
 * @param {string} node.options.target
 *  The name of the channel to notify
 * @param {object|array} node.options.params
 *  Key-value pairs to pass along as data with the event that will be mustache rendered
 * @param {string} node.options.paramsKey
 *  The key of the data for the parameters
 * @param {boolean} node.options.useOptions
 *  Boolean to determine whether to use the options as the data to pass along or to use the params
 * @param {object} node.options.data
 *  Data object to pass along with the event
 *
 * @example
 *  {
 *        "type": "action",
 *        "actionType": "event",
 *        "options": {
 *            "target": "my_grid.add",
 *            "params": [
 *                {
 *                    "name": "{{request.name}}",
 *                    "endpoint": "{{request.uri}}",
 *                    "status": "{{status}}"
 *                }
 *            ],
 *            "useOptions": true
 *        }
 *    }
 */
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

