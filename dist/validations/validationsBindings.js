'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = {
    'validation-show-section': function validationShowSection(ctx) {
        return {
            visible: this.visibleMessages().length
        };
    },
    'validation-message-list': function validationMessageList(ctx) {
        return {
            foreach: this.visibleMessages()
        };
    },
    'validation-show-messages': function validationShowMessages(ctx) {
        var visible = this.showValidationMessages(),
            css = visible ? 'fa fa-caret-down' : 'fa fa-caret-right';
        return {
            click: function click() {
                visible(!visible);
            },
            css: css
        };
    },
    'validation-severity-css': function validationSeverityCss(ctx) {
        return {
            css: {
                'fa-icon-error': this.severity === 1,
                'fa-icon-table-warning': this.severity !== 1
            }
        };
    },
    'validation-message': function validationMessage(ctx) {
        var onClick = this.onClick;
        return {
            css: {
                error: this.severity === 1,
                warning: this.severity === 2,
                validated: this.severity === 3
            },
            click: onClick
        };
    }
};
//# sourceMappingURL=validationsBindings.js.map