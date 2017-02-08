'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; /* global define */


var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _knockout = require('knockout');

var _scalejs = require('scalejs');

require('ko-bindings/slideVisible');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// todo evaluate if should move to advanced grid?
function aggregateValues(node) {
    var value = void 0;
    if (node.getValue) {
        value = [].concat(node.getValue());
    } else if (node.mappedChildNodes) {
        value = (0, _knockout.unwrap)(node.mappedChildNodes).reduce(function (values, childNode) {
            var childValue = aggregateValues(childNode);
            if (childValue) {
                return values.concat(childValue);
            }
            return values;
        }, []);
    }
    // convert objects to strings
    value = value.map(function (v) {
        if (!(0, _scalejs.has)(v)) {
            return '';
        }
        if ((typeof v === 'undefined' ? 'undefined' : _typeof(v)) === 'object') {
            if (v.op) {
                delete v.op;
            } // we don't want to custom operators values in preview
            return Object.keys(v).map(function (key) {
                if (Date.parse(v[key])) {
                    return _moment2.default.utc(v[key]).format('MM/DD/YYYY');
                }
                return v[key];
            }).join(' ');
        }
        return v;
    });
    return value;
}

exports.default = {
    'accordion-header': function accordionHeader() {
        return {
            click: this.toggleVisibility,
            // todo this should be an SVG / class
            css: {
                'fa-caret-down': this.visible(),
                'fa-caret-right': !this.visible()
            }

        };
    },
    'accordion-expand-all': function accordionExpandAll(ctx) {
        return {
            fontIcon: 'expand-all',
            click: function click() {
                ctx.$parents[1].setAllSectionVisibility(true);
            },
            clickBubble: false
        };
    },
    'accordion-collapse-all': function accordionCollapseAll(ctx) {
        return {
            fontIcon: 'collapse-all',
            click: function click() {
                ctx.$parents[1].setAllSectionVisibility(false);
            },
            clickBubble: false
        };
    },
    // todo move to advanced grid
    'accordion-header-preview-text': function accordionHeaderPreviewText(ctx) {
        var accordionChild = (0, _knockout.unwrap)(ctx.$parents[1].mappedChildNodes)[ctx.$index()],
            count = (0, _knockout.computed)(function () {
            var values = aggregateValues(accordionChild);
            return values.length > 0 && values[0] ? values.length : '';
        });

        return {
            text: count
        };
    },
    'accordion-header-text': function accordionHeaderText() {
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