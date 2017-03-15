import { registerActions } from '../actionModule';
import { unwrap } from 'knockout';
import { merge } from 'scalejs';
import mustache from 'mustache';

/**
 * Redirect action to redirect the current page to another
 *
 * @module redirect
 *
 * @param {object} node
 *  The configuration object for the redirect action
 * @param {string} node.type='action'
 *  The type of the node is action
 * @param {string} node.actionType='redirect'
 *  The actionType of the node is redirect
 * @param {string} node.text
 *  The text to display on the button
 * @param {object} node.options
 *  The options pertaining to the redirect action
 * @param {string} node.options.target
 *  The url to redirect to
 * @param {object} node.options.data
 *  The data to mustache render the target url with
 * @param {object} node.options.params
 *  Key-value pairs to merge pass along as data when redirecting
 * @param {string} node.options.paramsKey
 *  The key of the data for the parameters
 *
 * @example
 * {
 *     "type": "action",
 *     "actionType": "redirect",
 *     "text": "Redirect",
 *     "options": {
 *         "target": "https://www.google.com"
 *     }
 * }
 */
function redirect(options) {
    if (!options.target) {
        console.error('Must provide target!');
        return;
    }

    let data = unwrap(options.data || (this && this.data)),
        url;

    if (options.params && options.paramsKey) {
        data = merge(data, options[options.paramsKey]);
    }

    url = mustache.render(options.target, data);

    window.location.replace(url);
}
registerActions({ redirect });
