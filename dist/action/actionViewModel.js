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
function actionViewModel(node) {
    var registeredActions = (0, _actionModule.getRegisteredActions)(),
        originalJson = (0, _lodash.cloneDeep)(node),
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
                },
                actionNode: (0, _lodash.cloneDeep)(originalJson)
            });
        } else {
            actionFunc(options, args);
        }
    }

    if (node.immediate) {
        if ((0, _scalejs2.has)(node.delay)) {
            setTimeout(function () {
                action();
            }, node.delay);
            return;
        }
        action();
        return;
    }

    if (enableUpdates) {
        subs.push((0, _scalejs.receive)(node.id + '.update', function (data) {
            Object.keys(data).forEach(function (key) {
                if (key === 'disabled') {
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