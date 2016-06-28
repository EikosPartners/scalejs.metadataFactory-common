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
    },
    'action-row-dropdown-button': function actionRowDropdownButton(ctx) {
        console.log('context: ', ctx);
    },
    'action-contextvis-button': function actionContextvisButton(ctx) {
        // property to bind visibility to in context.
        // this can be provided with a bang in front and it will parse correctly
        // as the opposite of the context property
        var contextProperty = ctx.$data.contextProperty,
            context = ctx.$data.context;

        return {
            css: ctx.$data.classes,
            visible: (contextProperty[0] === '!' ? !context[contextProperty.slice(1)]() : context[contextProperty]()) && ctx.$data.isShown(),
            clickOff: function clickOff() {
                ctx.$data.options.dropdown && ctx.$data.options.dropdown.showDropdown && ctx.$data.options.dropdown.showDropdown(false);
            }
        };
    },
    'action-popup-action': function actionPopupAction(ctx) {
        var hidePopup = ctx.$parents.filter(function (parent) {
            return parent.hidePopup;
        })[0].hidePopup,
            classes = this.classes || '';

        return {
            click: function click() {
                hidePopup();
                this.action();
            },
            text: this.text,
            css: classes
        };
    },
    'classes-binding': function classesBinding(ctx) {
        var context = this.context,
            classesBinding = this.classesBinding,
            classes = this.classes,
            css;

        if (classesBinding && !context) {
            console.error('You cannot define a classes binding expression without passing context');
        }

        if (classesBinding) {
            css = computed(function () {
                return Object.keys(classesBinding).reduce(function (cls, className) {
                    var applyClass = evaluate(classesBinding[className], function (identifier) {
                        return ko.unwrap(context[identifier]);
                    });
                    if (applyClass) {
                        cls += ' ' + className;
                    }
                    return cls;
                }, classes || '');
            }, this);
        } else {
            css = classes;
        }

        return {
            css: css
        };
    }
};
//# sourceMappingURL=actionBindings.js.map