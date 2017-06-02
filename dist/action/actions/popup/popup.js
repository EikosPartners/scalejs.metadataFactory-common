'use strict';

var _scalejs = require('scalejs.mvvm');

var _scalejs2 = require('scalejs');

var _scalejs3 = require('scalejs.popup');

var _scalejs4 = _interopRequireDefault(_scalejs3);

var _mustache = require('mustache');

var _mustache2 = _interopRequireDefault(_mustache);

var _knockout = require('knockout');

var _knockout2 = _interopRequireDefault(_knockout);

var _scalejs5 = require('scalejs.expression-jsep');

var _scalejs6 = require('scalejs.metadataFactory');

var _actionModule = require('../../actionModule');

var _popupBindings = require('./popupBindings');

var _popupBindings2 = _interopRequireDefault(_popupBindings);

var _popup = require('./popup.html');

var _popup2 = _interopRequireDefault(_popup);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var popupRoot = _scalejs4.default.popupRoot;
var initialized = false;

/**
 * Popup action creates a popup in the window
 *
 * @module popup
 *
 * @param {object} node
 *  The configuration object for the popup action
 * @param {string} node.type
 *  The type of the node is action
 * @param {string} node.actionType
 *  The actionType of the node is popup
 * @param {string} node.text
 *  The text to display on the button
 * @param {string} node.id
 *  The id of the popup
 * @param {string} node.buttonClasses
 *  A string of classes to apply the button
 * @param {object} node.options
 *  The options pertaining to the ajax action
 * @param {string} node.options.template
 *  The template to use to construct the popup
 * @param {string} node.options.title
 *  The title of the popup
 * @param {string} node.options.message
 *  The message to display in the popup
 * @param {object|array} node.options.data
 *  The data to pass to the popup to be mustache rendered
 * @param {boolean} node.options.modal
 *  Boolean to display the popup as a modal or not
 * @param {string} node.options.wrapperTemplate
 *  The template to use as the wrapper for the popup
 * @param {object} node.options.hidePopupAction
 *  The action to perform when the popup is hidden
 * @param {number} node.options.hideDelay
 *  The amount of time before the popup is closed in milliseconds
 *
 * @example
 * {
 *     "type": "action",
 *     "actionType": "popup",
 *     "options": {
 *         "title": "Success",
 *         "template": "action_popup_template",
 *         "message": "Your form has been submitted successfully"
 *     }
 * }
 */
function popupAction(options) {
    if (!initialized) {
        init();
    }
    var context = this;
    var onHidePopup = void 0,
        actions = void 0,
        data = void 0,
        modal = void 0,
        merged = void 0;

    actions = (options.actions || []).map(function (action) {
        action.type = 'action';
        return _scalejs6.createViewModel.call(context, action);
    });

    data = this && _knockout2.default.unwrap(this.data);
    data = (0, _scalejs2.merge)(options, data);

    if (typeof options.message === 'string') {
        options.message = _mustache2.default.render(options.message, data || {});
    }

    if (options.hidePopupAction) {
        onHidePopup = _scalejs6.createViewModel.call(context, options.hidePopupAction).action;
    }

    modal = typeof options.modal === 'undefined' || typeof options.modal === 'boolean' ? options.modal : (0, _scalejs5.evaluate)(options.modal, this.getValue);

    merged = (0, _scalejs2.merge)(options, {
        title: options.title,
        message: options.message,
        template: options.template,
        actions: actions,
        modal: modal,
        options: options.children,
        classes: options.classes,
        onHidePopup: onHidePopup,
        context: this
    });

    _scalejs4.default.onHidePopup(merged.onHidePopup);
    _scalejs4.default.renderPopup((0, _scalejs.template)(merged.wrapperTemplate || 'popup_default_wrapper_template', {
        hidePopup: _scalejs4.default.hidePopup,
        title: merged.title || 'Popup',
        modal: merged.modal || false,
        popupClasses: merged.popupClasses,
        hideClose: merged.hideClose || false,
        classes: merged.classes,
        popupContent: {
            name: merged.template || 'popup_default_region_template',
            data: (0, _scalejs2.merge)(merged, {
                hidePopup: _scalejs4.default.hidePopup
            })
        }
    }));

    if (options.hideDelay) {
        setTimeout(closePopup, options.hideDelay);
    }
}

function closePopup() {
    _scalejs4.default.hidePopup();
}

function init() {
    initialized = true;
    var popupDiv = document.querySelector('*[data-bind="render: popupRoot"], *[data-bind="render:popupRoot"]');
    if (!popupDiv) {
        var att = document.createAttribute('data-bind');
        att.value = 'render: popupRoot';
        popupDiv = document.createElement('div');
        popupDiv.setAttributeNode(att);
        document.body.insertBefore(popupDiv, document.body.lastChild.nextSibling);
        _knockout2.default.applyBindings({ popupRoot: popupRoot }, popupDiv);
    }
}

(0, _scalejs.registerBindings)(_popupBindings2.default);
(0, _scalejs.registerTemplates)(_popup2.default);
(0, _actionModule.registerActions)({ popup: popupAction, closePopup: closePopup });
//# sourceMappingURL=popup.js.map