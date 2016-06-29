'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
/*global define */
exports.default = {
    'action-button': function actionButton() {
        var classes = this.buttonClasses || '';

        if (this.icon) {
            classes += ' fa fa-' + this.icon;
        }

        return {
            click: function click() {
                this.action();
            },
            css: classes
        };
    }
};
//# sourceMappingURL=actionBindings.js.map