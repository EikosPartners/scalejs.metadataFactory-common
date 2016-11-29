'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _scalejs = require('scalejs.messagebus');

exports.default = {
    'grid-advanced-filter-template': function gridAdvancedFilterTemplate() {
        return {
            template: {
                name: 'metadata_item_template',
                data: this.advancedFilter
            },
            visible: this.filterIsVisible
        };
    },
    'grid-advanced-filter-clickOff': function gridAdvancedFilterClickOff() {
        var _this = this;

        var id = this.id;
        return {
            event: {
                keypress: function keypress(data, e) {
                    if (e.keyCode === 13) {
                        e.target.dispatchEvent(new Event('change'));
                        (0, _scalejs.notify)(id + '.filter');
                        return false;
                    }
                    return true;
                }
            },
            clickOff: {
                handler: function handler() {
                    return _this.filterIsVisible(false);
                },
                excludes: ['ui-autocomplete']
            },
            css: this.classes
        };
    },
    'grid-advanced-filter-toggle': function gridAdvancedFilterToggle() {
        var _this2 = this;

        return {
            click: function click() {
                return _this2.filterIsVisible(!_this2.filterIsVisible());
            },
            text: this.filterText
        };
    }
};
//# sourceMappingURL=gridAdvancedFilterBindings.js.map