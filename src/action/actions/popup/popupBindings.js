export default {
    'action-popup-action': function (ctx) {
        const hidePopup = ctx.$parents.filter(parent =>
                parent.hidePopup
            )[0].hidePopup,
            classes = this.classes || '';

        if (ctx.$parent.hideAfter) {
            this.options.hideAfter = ctx.$parent.hideAfter;
        }

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
        };
    }
};