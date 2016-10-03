import { createViewModel as createViewModelUnbound } from 'scalejs.metadataFactory';
import { getRegisteredActions } from './actionModule';
import { observable, unwrap } from 'knockout';
import { notify } from 'scalejs.messagebus';
import { merge, has } from 'scalejs';
import { extend } from 'lodash';

export default function actionViewModel(node) {
    let registeredActions = getRegisteredActions(),
        context = this || {},      
        options = node.options || {},
        text = node.text || options.text, // TODO: Options are meant for specific types. Why are we checking options?
        createViewModel = createViewModelUnbound.bind(context),
        validate = node.validate,
        actionType = node.actionType,
        actions = {},
        mergedActions = extend(actions, registeredActions),
        actionFunc = mergedActions[actionType] && mergedActions[actionType].bind(context) || null ,
        isShown = observable(true),
        disabled = observable(has(options.disabled) ? options.disabled : false);


    function action(args) {

        if (!actionFunc){
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

    return merge(node, {
        isShown: isShown,
        action: action,
        text: text,
        actionType: actionType,
        options: options,
        disabled: disabled,
        context: context
    });

};
