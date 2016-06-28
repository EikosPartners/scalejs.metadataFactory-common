/*global define, ko, core, view, binding */
import core from 'scalejs.core';
import ko from 'knockout';
import view from './action.html';
import binding from './actionBindings.js';
import 'scalejs.mvvm';
import { getRegisteredActions } from './actionModule';
import { notify } from 'scalejs.messagebus';

let merge = core.object.merge,
    observable = ko.observable,
    unwrap = ko.unwrap,
    has = core.object.has;

core.mvvm.registerTemplates(view);
core.mvvm.registerBindings(binding);

export default function actionViewModel(node) {
    let registeredActions = getRegisteredActions(),
        context = this,        
        text = node.text || node.options.text,
        createViewModel = core.metadataFactory.createViewModel.bind(context),
        validate = node.validate,
        options = node.options || {},
        actionType = node.actionType,
        actions = {},
        mergedActions = core.object.extend(actions, registeredActions),
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

