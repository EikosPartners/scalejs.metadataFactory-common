'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = actionViewModel;

var _scalejs = require('scalejs.metadataFactory');

var _actionModule = require('./actionModule');

var _knockout = require('knockout');

var _scalejs2 = require('scalejs.messagebus');

var _scalejs3 = require('scalejs');

var _lodash = require('lodash');

function actionViewModel(node) {
    var registeredActions = (0, _actionModule.getRegisteredActions)(),
        context = this,
        text = node.text || node.options.text,
        createViewModel = _scalejs.createViewModel.bind(context),
        validate = node.validate,
        options = node.options || {},
        actionType = node.actionType,
        actions = {},
        mergedActions = (0, _lodash.extend)(actions, registeredActions),
        actionFunc = mergedActions[actionType] && mergedActions[actionType].bind(context) || null,
        isShown = (0, _knockout.observable)(true),
        disabled = (0, _knockout.observable)((0, _scalejs3.has)(options.disabled) ? options.disabled : false);

    function action(args) {

        if (!actionFunc) {
            console.error('actionType is not defined', node);
            return;
        }

        if (validate) {
            (0, _scalejs2.notify)(validate, {
                successCallback: function successCallback() {
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

    return (0, _scalejs3.merge)(node, {
        isShown: isShown,
        action: action,
        text: text,
        actionType: actionType,
        options: options,
        disabled: disabled,
        context: context
    });
};
//# sourceMappingURL=actionViewModel.js.map