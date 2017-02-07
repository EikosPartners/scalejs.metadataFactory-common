/* global define */
import moment from 'moment';
import { computed, unwrap } from 'knockout';
import { has } from 'scalejs';
import 'ko-bindings/slideVisible';

    // todo evaluate if should move to advanced grid?
function aggregateValues(node) {
    let value;
    if (node.getValue) {
        value = [].concat(node.getValue());
    } else if (node.mappedChildNodes) {
        value = unwrap(node.mappedChildNodes).reduce((values, childNode) => {
            const childValue = aggregateValues(childNode);
            if (childValue) {
                return values.concat(childValue);
            }
            return values;
        }, []);
    }
        // convert objects to strings
    value = value.map((v) => {
        if (!has(v)) {
            return '';
        }
        if (typeof v === 'object') {
            if (v.op) { delete v.op; } // we don't want to custom operators values in preview
            return Object.keys(v).map((key) => {
                if (Date.parse(v[key])) {
                    return moment.utc(v[key]).format('MM/DD/YYYY');
                }
                return v[key];
            }).join(' ');
        }
        return v;
    });
    return value;
}

export default {
    'accordion-header': function () {
        return {
            click: this.toggleVisibility,
                // todo this should be an SVG / class
            css: {
                'fa-caret-down': this.visible(),
                'fa-caret-right': !this.visible()
            }

        };
    },
    'accordion-expand-all': function (ctx) {
        return {
            fontIcon: 'expand-all',
            click: function () {
                ctx.$parents[1].setAllSectionVisibility(true);
            },
            clickBubble: false
        };
    },
    'accordion-collapse-all': function (ctx) {
        return {
            fontIcon: 'collapse-all',
            click: function () {
                ctx.$parents[1].setAllSectionVisibility(false);
            },
            clickBubble: false
        };
    },
        // todo move to advanced grid
    'accordion-header-preview-text': function (ctx) {
        const accordionChild = unwrap(ctx.$parents[1].mappedChildNodes)[ctx.$index()],
            count = computed(() => {
                const values = aggregateValues(accordionChild);
                return values.length > 0 && values[0] ? values.length : '';
            });

        return {
            text: count
        };
    },
    'accordion-header-text': function () {
        return {
            text: typeof this.header === 'string' ? this.header : this.header.text
        };
    },
    'accordion-sections': function () {
        const visibleSections = this.sections
            .filter(section => !section.isShown || section.isShown());
        return {
            foreach: visibleSections
        };
    }
};