import { registerTemplates, registerBindings, template } from 'scalejs.mvvm';
import { createViewModel } from 'scalejs.metadataFactory';
import { registerActions } from '../../actionModule';
import { notify } from 'scalejs.messagebus';
import { merge } from 'scalejs';
import popup from 'scalejs.popup';
import mustache from 'mustache';
import ko from 'knockout'

import popupBindings from './popupBindings';
import popupTemplates from './popup.html';

let popupRoot = popup.popupRoot;
let initialized = false

function popupAction(options) {
    if (!initialized) { init(); }
    let context = this,
        message = {},
        onHidePopup, actions, data, modal, merged;

    actions = (options.actions || []).map(function (action) {
        action.type = 'action';
        return createViewModel.call(context, action);
    });

    data = this && this.data && this.data();

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
        ko.applyBindings({popupRoot}, popupDiv);
    }
    
}

registerBindings(popupBindings);
registerTemplates(popupTemplates);
registerActions({ popup: popupAction, closePopup: closePopup });