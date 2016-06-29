'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _scalejs = require('scalejs.sandbox');

var _scalejs2 = _interopRequireDefault(_scalejs);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*global define, sandbox, _ */
/*jslint sloppy: true*/

function sticky(_el) {
    _el.style.transform = "translateY(" + this.scrollTop + "px)";
}

exports.default = {
    'list-advanced-cell': function listAdvancedCell() {
        return {
            css: this.cellClasses,
            attr: {
                colspan: this.colspan || 1
            }
        };
    },
    'list-advanced-row-editable': function listAdvancedRowEditable(ctx) {
        var editMode = this.editMode,
            context = ctx.$parent.context || {},
            readonly = context.readonly ? context.readonly() : false;

        return {
            css: {
                'edit-mode': editMode() && !readonly
            },
            click: function click() {
                editMode(true);
                return true;
            },
            clickOff: {
                excludes: ['ui-autocomplete'],
                handler: function handler() {
                    editMode(false);
                }
            }
        };
    },
    'list-advanced-group-actions': function listAdvancedGroupActions(ctx) {
        var group = ctx.$parent,
            listViewModel = ctx.$parents[1],
            groupActions = _lodash2.default.cloneDeep(listViewModel.groupActions),
            groupActionViewModels;

        if (!groupActions) {
            return;
        }

        groupActionViewModels = _scalejs2.default.metadataFactory.createViewModels.call({
            metadata: [],
            getValue: function getValue(id) {
                if (id === 'group') {
                    return group;
                }
                return listViewModel.context.getValue(id);
            }
        }, groupActions);

        return {
            template: {
                name: 'metadata_items_template',
                data: groupActionViewModels
            }
        };
    },
    'list-advanced-group-row-spacer': function listAdvancedGroupRowSpacer(ctx) {
        var showSpacer = false,
            currentGroupIndex = Number(ctx.$data) - 1;

        showSpacer = Object.keys(ctx.$parent.groups()).map(function (groupKey) {
            return ctx.$parent.groups()[groupKey];
        }).slice(0, currentGroupIndex + 1).reduce(function (previousHasSpacer, group, index) {
            var ret,
                previousGroup = ctx.$parent.groups()[index.toString()];

            if (!previousGroup) {
                return false;
            }

            if ((previousGroup.length + (previousHasSpacer ? 1 : 0)) % 2 !== 0) {
                return true;
            } else {
                return false;
            }
        }, false);

        return {
            if: showSpacer
        };
    }
};
//# sourceMappingURL=listAdvancedBindings.js.map