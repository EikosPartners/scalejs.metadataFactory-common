import { createViewModel } from 'scalejs.metadataFactory';
import popup from 'scalejs.popup';
import { notify } from 'scalejs.messagebus';
import mustache from 'mustache';

import { registerActions } from '../actionModule';

function popup(options) {
    let context = this,
        onHidePopup, actions, data, modal, merged, message = {};

    actions = (options.actions || []).map(function (action) {
        action.type = 'action';
        return createViewModel.call(context, action);
    });

    data = this && this.data && this.data();
    message.data = data;

    if (data && options.message) {
        if (!Array.isArray(data)) { data = [data] }

        // check for selected items with unique ids in message
        let selectedItems = options.message.match(/{{(selectedItems:[^{}]+)}}/g);
        if (selectedItems) {
            console.warn('Please refactor selected items message rendering out of popupAction', options);

            // replace {{selectedItems:[uniqueID]}} with {{selectedItems}} for mustache rendering key
            options.message = options.message.replace(selectedItems[0], '{{selectedItems}}');

            // create array of unique ids for selected values, ie ["poolNum", "PoolStatusCode"]
            selectedItems = selectedItems.map(function (item) {
                return item.slice(item.indexOf(':') + 1, -2);
            }).join().split(',');

            // add data values to selectedItems key for rendering
            message.selectedItems = data.map(function (datum) {
                return selectedItems.reduce(function (prev, curr) {
                    return prev + datum[curr] + ' ';
                }, '');
            });
        }

        options.message = mustache.render(options.message, message);

    } else if (!options.message) {
        options.message = '';
    }

    if (options.hidePopupAction) {
        onHidePopup = createViewModel.call(context, options.hidePopupAction).action;
    }

    modal =  typeof options.modal === 'undefined' || typeof options.modal === 'boolean' ? options.modal : evaluate(options.modal, this.getValue);
    merged =  merge(options, {
        title: options.title,
        message: options.message,
        template: options.template,
        actions: actions,
        modal: modal,
        options: options.children,
        onHidePopup: onHidePopup,
        context: this
    });

    notify('showPopup',merged);

    if(options.hideDelay) {
        setTimeout(closePopup, options.hideDelay);
    }
}

 function closePopup(){
    popup.hidePopup();
}

registerActions({popup, closePopup});