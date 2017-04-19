import { registerTemplates, registerBindings, template } from 'scalejs.mvvm';
import { createViewModel } from 'scalejs.metadataFactory';
import { registerActions } from '../../actionModule';
import { merge } from 'scalejs';
import popup from 'scalejs.popup';
import mustache from 'mustache';
import ko from 'knockout';

import popupBindings from './popupBindings';
import popupTemplates from './popup.html';

const popupRoot = popup.popupRoot;
let initialized = false;

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
    if (!initialized) { init(); }
    const context = this;
    let onHidePopup,
        actions,
        data,
        modal,
        merged;

    actions = (options.actions || []).map((action) => {
        action.type = 'action';
        return createViewModel.call(context, action);
    });

    data = this && ko.unwrap(this.data);

    if (options.message) {
        options.message = mustache.render(options.message, data || {});
    }

    if (options.hidePopupAction) {
        onHidePopup = createViewModel.call(context, options.hidePopupAction).action;
    }

    modal = typeof options.modal === 'undefined' || typeof options.modal === 'boolean' ? options.modal : evaluate(options.modal, this.getValue);

    merged = merge(options, {
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

    popup.onHidePopup(merged.onHidePopup);
    popup.renderPopup(
        template(merged.wrapperTemplate || 'popup_default_wrapper_template', {
            hidePopup: popup.hidePopup,
            title: merged.title || 'Popup',
            modal: merged.modal || false,
            popupClasses: merged.popupClasses,
            classes: merged.classes,
            popupContent: {
                name: merged.template || 'popup_default_region_template',
                data: merge(merged, {
                    hidePopup: popup.hidePopup
                })
            }
        })
    );

    if (options.hideDelay) {
        setTimeout(closePopup, options.hideDelay);
    }
}

function closePopup() {
    popup.hidePopup();
}

function init() {
    initialized = true;
    let popupDiv = document.querySelector('*[data-bind="render: popupRoot"], *[data-bind="render:popupRoot"]');
    if (!popupDiv) {
        let att = document.createAttribute('data-bind');
        att.value = 'render: popupRoot';
        popupDiv = document.createElement('div');
        popupDiv.setAttributeNode(att);
        document.body.insertBefore(popupDiv, document.body.lastChild.nextSibling);
        ko.applyBindings({ popupRoot }, popupDiv);
    }
}

registerBindings(popupBindings);
registerTemplates(popupTemplates);
registerActions({ popup: popupAction, closePopup: closePopup });