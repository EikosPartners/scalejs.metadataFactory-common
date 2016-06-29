export default {
    'action-popup-action': function (ctx) {
        var hidePopup = ctx.$parents.filter(function (parent) {
            return parent.hidePopup
        })[0].hidePopup,
            classes = this.classes || '';

        return {
            click: function () {
                hidePopup();
                this.action();
            },
            text: this.text,
            css: classes
        }
    }
}