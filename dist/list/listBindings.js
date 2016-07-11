'use strict';

/*global define */
/*jslint sloppy: true*/
define({
    'list-remove': function listRemove(ctx) {
        // visible is based on either the visible expression on the JSON,
        // or on the showRemoveButton function in the viewmodel
        var parent = ctx.$parents.filter(function (parent) {
            return parent.showRemove; // the parent will have this prop
        })[0],
            visible = this.visible || parent.showRemove() && parent.deleteRows(),

        // account for both contexts, depending on how this list was generated
        click = ctx.$parents[1].remove || ctx.$parents[0].remove;

        return {
            click: click,
            visible: visible
        };
    },
    'list-delete-flag': function listDeleteFlag(ctx) {
        var parent = ctx.$parents.filter(function (parent) {
            return parent.showRemove; // the parent will have this prop
        })[0];

        return {
            click: this.deleteRow,
            visible: this.visible || parent.showRemove() && parent.deleteRows()
        };
    },
    'list-add': function listAdd(ctx) {
        return {
            click: ctx.$parents[1].add
        };
    },
    'list-add-rendered': function listAddRendered() {
        var rendered = this.list.addButtonRendered;

        return {
            visible: rendered()
        };
    }
});
//# sourceMappingURL=listBindings.js.map