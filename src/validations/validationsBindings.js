export default {
    'validation-show-section': function (ctx) {
        return {
            visible: this.visibleMessages().length
        }
    },
    'validation-message-list': function (ctx) {
        return {
            foreach: this.visibleMessages()
        }
    },
    'validation-show-messages': function (ctx) {
        var visible = this.showValidationMessages(),
            css = visible ? 'fa fa-caret-down' : 'fa fa-caret-right';
        return {
            click: function () {
                visible(!visible);
            },
            css: css
        }
    },
    'validation-severity-css': function (ctx) {
        return {
            css: {
                'fa-icon-error': this.severity === 1, 
                'fa-icon-table-warning': this.severity !== 1
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
