'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; }; /*global define */


var _jsFormat = require('js-format');

var _jsFormat2 = _interopRequireDefault(_jsFormat);

var _knockout = require('knockout');

require('ko-bindings/slideVisible');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function aggregateValues(node) {
    var value;
    if (node.getValue) {
        value = [].concat(node.getValue());
    } else if (node.mappedChildNodes) {
        value = node.mappedChildNodes.reduce(function (values, childNode) {
            var childValue = aggregateValues(childNode);
            if (childValue) {
                values = values.concat(childValue);
            }
            return values;
        }, []);
    }
    // convert objects to strings
    value = value.map(function (value) {
        if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object') {
            if (value.op) {
                delete value.op;
            } // we don't want to custom operators values in preview
            return value = Object.keys(value).map(function (key) {
                if (Date.parse(value[key])) {
                    return (0, _jsFormat2.default)('MM/DD/YYYY', new Date(value[key]));
                } else {
                    return value[key];
                }
            }).join(' ');
        }
        return value;
    });
    return value;
}
exports.default = {
    'accordion': function accordion(ctx) {
        return {
            accordion: {
                itemsSource: this.sections,
                contentTemplate: 'form_self_template',
                headerPath: 'header',
                openPanel: 1
            }
        };
    },
    'accordion-header': function accordionHeader(ctx) {
        var error = false,
            warning = false;
        if (this.visibleMessages().length) {
            this.visibleMessages().forEach(function (err) {
                if (err.severity == 1) {
                    error = true;
                } else {
                    warning = true;
                }
            });
        }

        return {
            click: this.toggleVisibility,
            css: {
                'fa-caret-down': this.visible(),
                'fa-caret-right': !this.visible(),
                'error': error,
                'warning': warning
            }

        };
    },
    'info': function info(ctx) {
        return {
            visible: ctx.$parent.options.showInfo
        };
    },
    'accordion-expand-all': function accordionExpandAll(ctx) {
        return {
            click: function click() {
                ctx.$parents[1].setAllSectionVisibility(true);
            },
            clickBubble: false
        };
    },
    'accordion-collapse-all': function accordionCollapseAll(ctx) {
        return {
            click: function click() {
                ctx.$parents[1].setAllSectionVisibility(false);
            },
            clickBubble: false
        };
    },
    'accordion-header-preview-text': function accordionHeaderPreviewText(ctx) {
        var accordionChild = ctx.$parents[1].mappedChildNodes[ctx.$index()],
            count = (0, _knockout.computed)(function () {
            var values = aggregateValues(accordionChild);
            return values.length > 0 && values[0] ? values.length : '';
        });

        return {
            text: count
        };
    },
    'accordion-header-text': function accordionHeaderText(ctx) {
        return {
            text: typeof this.header === 'string' ? this.header : this.header.text
        };
    },
    'accordion-header-error-text': function accordionHeaderErrorText(ctx) {
        var text = '',
            errors = 0,
            warnings = 0;
        if (this.visibleMessages().length) {
            text += '(';
            this.visibleMessages().forEach(function (err) {
                if (err.severity == 1) {
                    errors = errors + 1;
                } else {
                    warnings = warnings + 1;
                }
            });
            if (errors) {
                text += errors + ' error';
                if (errors > 1) {
                    text += 's';
                }
                if (warnings) {
                    text += ', ';
                }
            }
            if (warnings) {
                text += warnings + ' warning';
                if (warnings > 1) {
                    text += 's';
                }
            }
            text += ')';
        }

        return {
            text: text
        };
    },
    'accordion-sections': function accordionSections() {
        var visibleSections = this.sections.filter(function (section) {
            return !section.isShown || section.isShown();
        });
        return {
            foreach: visibleSections
        };
    }
};
//# sourceMappingURL=accordionBindings.js.map