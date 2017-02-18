import { notify, receive } from 'scalejs.messagebus';
import { observable } from 'knockout';
import { merge, has } from 'scalejs';
import { extend, cloneDeep } from 'lodash';

import { getRegisteredActions } from './actionModule';

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