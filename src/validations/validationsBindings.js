export default {
    'validation-show-section': function (ctx) {
        return {
            visible: this.visibleMessages().length
        }
    },
    'validation-message-list': function (ctx) {
        return {
            visible: this.showValidationMessages,
            foreach: this.visibleMessages()
        }
    },
    'validation-show-messages': function (ctx) {
        var visible = this.showValidationMessages(),
            icon = visible ? 'caret-down' : 'caret-right';
        return {
            click: function () {
                this.showValidationMessages(!visible);
            },
            fontIcon: icon
        }
    },
    'validation-severity-css': function (ctx) {
        return {
            fontIcon: {
                'icon-error': this.severity === 1, 
                'icon-table-warning': this.severity !== 1
            }
        }
    },
    'validation-message': function (ctx) {
        var onClick = this.onClick;
        return {
            css: {
               error: this.severity === 1, 
               warning: this.severity === 2, 
               validated: this.severity === 3 
            },
            click: onClick
        }
    }
};
