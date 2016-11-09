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

        if (ctx.$parent.hideAfter) {
            this.options.hideAfter = ctx.$parent.hideAfter;
        }

        return {
            click: function click() {
                if (!this.options.hideAfter) {
                    hidePopup();
                    this.action();
                } else {
                    this.action();
                    hidePopup();
                }
            },
            text: this.text,
            css: classes
        };
    }
};
//# sourceMappingURL=popupBindings.js.map