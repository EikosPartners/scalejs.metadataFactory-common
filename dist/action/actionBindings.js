'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = {
    'action-button': function actionButton() {
        var _this = this;

        var classes = this.buttonClasses || '';

        if (this.icon) {
            classes += ' fa fa-' + this.icon;
        }

        return {
            click: function click() {
                _this.action();
            },
            css: classes
        };
    }
};
//# sourceMappingURL=actionBindings.js.map