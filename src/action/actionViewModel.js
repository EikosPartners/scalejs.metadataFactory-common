import { notify, receive } from 'scalejs.messagebus';
import { observable, computed } from 'knockout';
import { merge, has, get } from 'scalejs';
import { extend, cloneDeep } from 'lodash';
import { evaluate } from 'scalejs.expression-jsep';

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
    
    let disabledComputed = null;

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
                actionNode: cloneDeep(originalJson),
                context: context
            });
        } else if (node.onlyIf) {
            const only = evaluate(node.onlyIf, (identifier) => {
                // worried about collisions, we should keep the getValue function consistent as possible
                if (identifier === 'results') {
                    return options.results;
                }
                if (identifier === 'options') {
                    return options;
                }
                return context.getValue(identifier);
            });
            if (only) {
                actionFunc(options, args);
            }
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

    if (node.disabledExpression) {
        disabledComputed = computed(() => evaluate(node.disabledExpression, context.getValue))
            .extend({ deferred: true });
        disabled(disabledComputed());
        disabledComputed.subscribe((val) => {
            disabled(val);
        });
        subs.push(disabledComputed);
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