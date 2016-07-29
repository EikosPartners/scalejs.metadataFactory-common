'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; }; /*global define */
//todo move out


var _jsFormat = require('js-format');

var _jsFormat2 = _interopRequireDefault(_jsFormat);

var _knockout = require('knockout');

require('ko-bindings/slideVisible');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//todo evaluate if should move to advanced grid?
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
    'accordion-header': function accordionHeader(ctx) {
        return {
            click: this.toggleVisibility,
            //todo this should be an SVG / class
            css: {
                'fa-caret-down': this.visible(),
                'fa-caret-right': !this.visible()
            }

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
    //todo move to advanced grid
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