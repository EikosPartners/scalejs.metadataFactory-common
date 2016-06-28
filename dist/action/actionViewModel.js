'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = actionViewModel;

var _scalejs = require('scalejs.core');

var _scalejs2 = _interopRequireDefault(_scalejs);

var _knockout = require('knockout');

var _knockout2 = _interopRequireDefault(_knockout);

var _action = require('./action.html');

var _action2 = _interopRequireDefault(_action);

var _actionBindings = require('./actionBindings.js');

var _actionBindings2 = _interopRequireDefault(_actionBindings);

require('scalejs.mvvm');

var _actionModule = require('./actionModule');

var _scalejs3 = require('scalejs.messagebus');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var merge = _scalejs2.default.object.merge,
    observable = _knockout2.default.observable,
    unwrap = _knockout2.default.unwrap,
    has = _scalejs2.default.object.has; /*global define, ko, core, view, binding */


_scalejs2.default.mvvm.registerTemplates(_action2.default);
_scalejs2.default.mvvm.registerBindings(_actionBindings2.default);

function actionViewModel(node) {
    var registeredActions = (0, _actionModule.getRegisteredActions)(),
        text = node.text || node.options.text,
        createViewModel = _scalejs2.default.metadataFactory.createViewModel.bind(this),
        validate = node.validate,
        options = node.options || {},
        actionType = node.actionType,
        actions = {},
        mergedActions = _scalejs2.default.object.extend(actions, registeredActions),
        actionFunc = mergedActions[actionType] && mergedActions[actionType].bind(this) || null,
        isShown = observable(true),
        disabled = observable(has(options.disabled) ? options.disabled : false),
        context = this;

    function action(args) {
        if (!actionFunc) {
            console.error('actions[actionType] is not defined', node);
            return;
        }

        if (validate) {
            (0, _scalejs3.notify)(validate, {
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
//# sourceMappingURL=actionViewModel.js.map