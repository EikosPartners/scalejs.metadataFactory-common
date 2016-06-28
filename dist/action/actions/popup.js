'use strict';

var _scalejs = require('scalejs.metadataFactory');

var _scalejs2 = require('scalejs.popup');

var _scalejs3 = _interopRequireDefault(_scalejs2);

var _scalejs4 = require('scalejs.messagebus');

var _mustache = require('mustache');

var _mustache2 = _interopRequireDefault(_mustache);

var _actionModule = require('../actionModule');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function popupAction(options) {
    var context = this,
        onHidePopup = void 0,
        actions = void 0,
        data = void 0,
        modal = void 0,
        merged = void 0,
        message = {};

    actions = (options.actions || []).map(function (action) {
        action.type = 'action';
        return _scalejs.createViewModel.call(context, action);
    });

    data = this && this.data && this.data();
    message.data = data;

    if (data && options.message) {
        (function () {
            if (!Array.isArray(data)) {
                data = [data];
            }

            // check for selected items with unique ids in message
            var selectedItems = options.message.match(/{{(selectedItems:[^{}]+)}}/g);
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

            options.message = _mustache2.default.render(options.message, message);
        })();
    } else if (!options.message) {
        options.message = '';
    }

    if (options.hidePopupAction) {
        onHidePopup = _scalejs.createViewModel.call(context, options.hidePopupAction).action;
    }

    modal = typeof options.modal === 'undefined' || typeof options.modal === 'boolean' ? options.modal : evaluate(options.modal, this.getValue);
    merged = merge(options, {
        title: options.title,
        message: options.message,
        template: options.template,
        actions: actions,
        modal: modal,
        options: options.children,
        onHidePopup: onHidePopup,
        context: this
    });

    (0, _scalejs4.notify)('showPopup', merged);

    if (options.hideDelay) {
        setTimeout(closePopup, options.hideDelay);
    }
}

function closePopup() {
    _scalejs3.default.hidePopup();
}

(0, _actionModule.registerActions)({ popup: popupAction, closePopup: closePopup });
//# sourceMappingURL=popup.js.map