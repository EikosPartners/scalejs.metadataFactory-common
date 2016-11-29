'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = actionViewModel;

var _scalejs = require('scalejs.messagebus');

var _knockout = require('knockout');

var _scalejs2 = require('scalejs');

var _lodash = require('lodash');

var _actionModule = require('./actionModule');

function actionViewModel(node) {
    var registeredActions = (0, _actionModule.getRegisteredActions)(),
        context = this || {},
        options = node.options || {},
        text = node.text || options.text,
        // TODO: Why are we checking options?
    validate = node.validate,
        actionType = node.actionType,
        actions = {},
        mergedActions = (0, _lodash.extend)(actions, registeredActions),
        actionFunc = mergedActions[actionType] && mergedActions[actionType].bind(context) || null,
        isShown = (0, _knockout.observable)(true),
        disabled = (0, _knockout.observable)((0, _scalejs2.has)(options.disabled) ? options.disabled : false),
        enableUpdates = options.enableUpdates,
        subs = [];

    function action(args) {
        if (!actionFunc) {
            console.error('actionType is not defined', node);
            return;
        }

        if (validate) {
            (0, _scalejs.notify)(validate, {
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

    if (enableUpdates) {
        subs.push((0, _scalejs.receive)(node.id + '.update', function (data) {
            Object.keys(data).forEach(function (key) {
                if (key == 'disabled') {
                    disabled(data[key]);
                }
            });
        }));
    }

    return (0, _scalejs2.merge)(node, {
        isShown: isShown,
        action: action,
        text: text,
        actionType: actionType,
        options: options,
        disabled: disabled,
        context: context,
        dispose: function dispose() {
            subs.forEach(function (sub) {
                sub.dispose();
            });
        }
    });
}
//# sourceMappingURL=actionViewModel.js.map