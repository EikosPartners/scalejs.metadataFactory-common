/*global define */
export default {
    'action-button': function () {
        var classes = this.buttonClasses || '';

        if (this.icon) {
            classes += ' fa fa-' + this.icon;
        }

        return {
            click: function() {
                this.action();
            },
            css: classes
        }
    },
    'action-row-dropdown-button': function (ctx) {
        console.log('context: ', ctx);
    },
    'action-contextvis-button': function ( ctx ) {
      // property to bind visibility to in context.
      // this can be provided with a bang in front and it will parse correctly
      // as the opposite of the context property
      var contextProperty = ctx.$data.contextProperty,
          context = ctx.$data.context;

      return {
          css: ctx.$data.classes,
          visible: (contextProperty[0] === '!' ? !context[contextProperty.slice(1)]() : context[contextProperty]()) && ctx.$data.isShown(),
          clickOff: function () {
              ctx.$data.options.dropdown && ctx.$data.options.dropdown.showDropdown && ctx.$data.options.dropdown.showDropdown(false);
          }
      }
    },
    'action-popup-action': function ( ctx ) {
        var hidePopup = ctx.$parents.filter(function(parent) {
            return parent.hidePopup
        })[0].hidePopup,
            classes = this.classes || '';

        return {
            click: function (){
                hidePopup();
                this.action();
            },
            text: this.text,
            css: classes
        }
    },
    'classes-binding': function (ctx) {
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
                    var applyClass = evaluate(classesBinding[className], function(identifier) {
                        return ko.unwrap(context[identifier]);
                    });
                    if (applyClass) {
                        cls += ' ' + className
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
}
