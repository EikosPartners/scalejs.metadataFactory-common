export default {
    'action-popup-action': function (ctx) {
        var hidePopup = ctx.$parents.filter(function (parent) {
            return parent.hidePopup
        })[0].hidePopup,
            classes = this.classes || '';

        return {
            click: function () {
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
        }
    }
}