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
        text = node.text || node.options.text,
        createViewModel = core.metadataFactory.createViewModel.bind(this),
        validate = node.validate,
        options = node.options || {},
        actionType = node.actionType,
        actions = {},
        mergedActions = core.object.extend(actions, registeredActions),
        actionFunc = mergedActions[actionType] && mergedActions[actionType].bind(this) || null,
        isShown = observable(true),
        disabled = observable(has(options.disabled) ? options.disabled : false),
        context = this;

    function action(args) {
        if (!actionFunc){
            console.error('actions[actionType] is not defined', node);
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

