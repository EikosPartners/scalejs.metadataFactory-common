'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = {
    'action-popup-action': function actionPopupAction(ctx) {
        var hidePopup = ctx.$parents.filter(function (parent) {
            return parent.hidePopup;
        })[0].hidePopup,
            classes = this.classes || '';

        return {
            click: function click() {
                hidePopup();
                this.action();
            },
            text: this.text,
            css: classes
        };
    }
};
//# sourceMappingURL=popupBindings.js.map