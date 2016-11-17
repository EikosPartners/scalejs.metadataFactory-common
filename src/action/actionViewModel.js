import { notify, receive } from 'scalejs.messagebus';
import { observable } from 'knockout';
import { merge, has } from 'scalejs';
import { extend } from 'lodash';

import { getRegisteredActions } from './actionModule';

export default function actionViewModel(node) {
    const registeredActions = getRegisteredActions(),
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
        enableUpdates = observable(has(options.enableUpdates) ? options.enableUpdates : false);

    function action(args) {
        if (!actionFunc) {
            console.error('actionType is not defined', node);
            return;
        }

        if (validate) {
            notify(validate, {
                successCallback: function () {
                    actionFunc(options, args);
                }
            });
        } else {
            actionFunc(options, args);
        }
    }

    if (node.immediate) {
        action();
        return;
    }

    if (enableUpdates){
        receive(`${node.id}.update`, (data) => { 
            Object.keys(data).forEach((key) => {
                if(key == 'disabled'){ disabled(data[key]); }
            });
        });
    }

    return merge(node, {
        isShown: isShown,
        action: action,
        text: text,
        actionType: actionType,
        options: options,
        disabled: disabled,
        context: context
    });
}
