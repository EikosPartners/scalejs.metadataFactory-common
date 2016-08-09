'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _scalejs = require('scalejs');

var _knockout = require('knockout');

exports.default = {
    'tabs-tab': function tabsTab(ctx) {
        var nextTab,
            nextHeader,
            hasChild,
            isChild,
            isChild = this.tabDef.options && this.tabDef.options.isChild,
            classes = this.tabDef.classes;

        if (ctx.$index() + 1 < ctx.$parent.tabs.length) {
            nextTab = ctx.$parent.tabs[ctx.$index() + 1];
            nextHeader = ctx.$parent.headers[ctx.$index() + 1];
            hasChild = nextHeader.options && nextHeader.options.isChild;
        }

        var css = {
            on: this.isActive,
            childActive: hasChild && nextTab.isActive,
            childTab: isChild
        };

        if (classes) {
            classes.split(' ').forEach(function (className) {
                //add class to css object 
                css[className] = true;
            });
        }
        return {
            visible: !isChild || this.isActive,
            css: css,
            click: this.setActiveTab.bind(null, null)
        };
    },
    'tabs-closeChild': function tabsCloseChild(ctx) {
        var isChild, parentTab;

        isChild = this.tabDef.options && this.tabDef.options.isChild;
        parentTab = isChild ? ctx.$parent.tabs[ctx.$index() - 1] : null;

        return {
            visible: isChild,
            click: parentTab ? parentTab.setActiveTab.bind(null, null) : function () {},
            clickBubble: false
        };
    }
};
//# sourceMappingURL=tabsBindings.js.map