export default {
    'action-button': function () {
        let classes = this.buttonClasses || '';

        if (this.icon) {
            classes += ` fa fa-${this.icon}`;
        }

        return {
            click: () => {
                this.action();
            },
            css: classes,
            attr: {
                'data-id': this.id
            }
        };
    }
};
