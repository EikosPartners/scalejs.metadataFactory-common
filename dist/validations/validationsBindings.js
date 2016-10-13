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
            visible: this.showValidationMessages,
            foreach: this.visibleMessages()
        };
    },
    'validation-show-messages': function validationShowMessages(ctx) {
        var visible = this.showValidationMessages(),
            icon = visible ? 'caret-down' : 'caret-right';
        return {
            click: function click() {
                this.showValidationMessages(!visible);
            },
            fontIcon: icon
        };
    },
    'validation-severity-css': function validationSeverityCss(ctx) {
        return {
            fontIcon: {
                'icon-error': this.severity === 1,
                'icon-table-warning': this.severity !== 1
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