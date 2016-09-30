/*global define */
import format from 'js-format'; //todo move out
import { computed } from 'knockout';
import { has } from 'scalejs';
import 'ko-bindings/slideVisible';

    //todo evaluate if should move to advanced grid?
    function aggregateValues(node) {
        var value;
        if (node.getValue) {
            value = [].concat(node.getValue());
        } else if (node.mappedChildNodes) {
            value = node.mappedChildNodes.reduce(function (values, childNode) {
                var childValue = aggregateValues(childNode);
                if(childValue) {
                    values = values.concat(childValue);
                }
                return values;
            }, [])
        }
        // convert objects to strings
        value = value.map(function(value) {
            if (!has(value)) { value = '' }
            if(typeof value === 'object') {
                if (value.op) { delete value.op; } // we don't want to custom operators values in preview
                return value = Object.keys(value).map(function(key) {
                    if (Date.parse(value[key])) {
                        return format('MM/DD/YYYY', new Date(value[key]));
                    } else {
                        return value[key];
                    }
                }).join(' ');
            }
            return value;
        });
        return value;
    }
    
    export default {
        'accordion-header': function (ctx) {
            return {
                click: this.toggleVisibility,
                //todo this should be an SVG / class
                css: {
                    'fa-caret-down': this.visible(),
                    'fa-caret-right': !this.visible()
                }

            }
        },
        'accordion-expand-all': function(ctx) {
            return {
                click: function () {
                    ctx.$parents[1].setAllSectionVisibility(true);
                },
                clickBubble: false
            }
        },
        'accordion-collapse-all': function(ctx) {
            return {
                click: function () {
                    ctx.$parents[1].setAllSectionVisibility(false);
                },
                clickBubble: false
            }
        },
        //todo move to advanced grid
        'accordion-header-preview-text': function(ctx) {
            var accordionChild = ctx.$parents[1].mappedChildNodes[ctx.$index()],
                count = computed(function () {
                    var values = aggregateValues(accordionChild);
                    return values.length > 0  && values[0] ? values.length : '';
                });

            return {
                text: count
            };
        },
        'accordion-header-text': function (ctx) {
            return {
                text: typeof this.header === 'string' ? this.header : this.header.text
            }
        },
        'accordion-sections': function () {
            var visibleSections = this.sections.filter(function(section) {
                return !section.isShown || section.isShown();
            });
            return {
                foreach: visibleSections
            }
        }
    }

