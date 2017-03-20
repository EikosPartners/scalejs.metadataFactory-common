import { notify, receive } from 'scalejs.messagebus';
import { observable } from 'knockout';
import { merge, has } from 'scalejs';
import { extend, cloneDeep } from 'lodash';

import { getRegisteredActions } from './actionModule';

/** Action: a component to create an action
 * @module action
 *
 * @param {object} node
 *  The configuration object for the module
 * @param {string} node.type='action'
 *  The type of the node is action
 * @param {string} node.actionType
 *  The type of action to create
 * @param {string} node.text
 *  The text to display on the button
 * @param {boolean} node.immediate
 *  Boolean to determine whether to run the action immediately or not
 * @param {number} node.delay
 *  How long to delay the action in milliseconds
 * @param {string} node.validate
 *  The id of an element to validate
 * @param {boolean|string} [node.rendered=true]
 *  Boolean or expression to render the action (or not)
 * @param {object} node.options
 *  The options pertaining to your specific actionType
 * @param {boolean|string} node.options.disabled
 *  Boolean or expression to disable the button or not
 */
export default function actionViewModel(node) {
    const registeredActions = getRegisteredActions(),
        originalJson = cloneDeep(node),
        context = this || {},
        options = node.options || {},
        text = node.text || options.text, // TODO: Why are we checking options?
        validate = node.validate,
        actionType = node.actionType,
        actions = {},
        mergedActions = extend(actions, registeredActions),
        actionFunc = (mergedActions[actionType] && mergedActions[actionType].bind(context)) || null,
        isShown = observable(true),
        disabled = observable(has(options.disabled) ? options.disabled : false),
        enableUpdates = options.enableUpdates,
        subs = [];

    function action(args) {
        if (!actionFunc) {
            console.error('actionType is not defined', node);
            return;
        }

        if (validate) {
            notify(validate, {
                successCallback: function () {
                    actionFunc(options, args);
                },
                actionNode: cloneDeep(originalJson)
            });
        } else {
            actionFunc(options, args);
        }
    }

    if (node.immediate) {
        if (has(node.delay)) {
            setTimeout(() => {
                action();
            }, node.delay);
            return;
        }
        action();
        return;
    }

    if (enableUpdates) {
        subs.push(receive(`${node.id}.update`, (data) => {
            Object.keys(data).forEach((key) => {
                if (key === 'disabled') { disabled(data[key]); }
            });
        }));
    }

    return merge(node, {
        isShown: isShown,
        action: action,
        text: text,
        actionType: actionType,
        options: options,
        disabled: disabled,
        context: context,
        dispose: function () {
            subs.forEach((sub) => {
                sub.dispose();
            });
        }
    });
}