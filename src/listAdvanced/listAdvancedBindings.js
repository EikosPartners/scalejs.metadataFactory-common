/*global define, sandbox, _ */
/*jslint sloppy: true*/
import sandbox from 'scalejs.sandbox';
import _ from 'lodash';
    function sticky( _el ){
        _el.style.transform = "translateY("+this.scrollTop+"px)";
    }

    export default {
        'list-advanced-cell': function () {
            return {
                css: this.cellClasses,
                attr: {
                    colspan: this.colspan || 1
                }
            };
        },
        'list-advanced-group': function (ctx) {
            var group = ctx.$parent.groups()[this],
                selectedGroup = ctx.$parent.selectedGroup;

            return {
                click: function () {
                    selectedGroup(group);
                },
                css: {
                    selected: selectedGroup() === group
                }
            };
        },
        'list-advanced-row-editable': function (ctx) {
            var editMode = this.editMode,
                context = ctx.$parent.context || {},
                readonly = context.readonly ? context.readonly() : false;

            return {
                css: {
                    'edit-mode': editMode() && !readonly
                },
                click: function () {
                    editMode(true);
                    return true;
                },
                clickOff: {
                    excludes: ['ui-autocomplete'],
                    handler: function () {
                        editMode(false);
                    }
                }
            }
        },
        'list-advanced-group-actions': function (ctx) {
            var group = ctx.$parent,
                listViewModel = ctx.$parents[1],
                groupActions = _.cloneDeep(listViewModel.groupActions),
                groupActionViewModels;

            if (!groupActions) {
                return;
            }

            groupActionViewModels = sandbox.metadataFactory.createViewModels.call({
                metadata: [],
                getValue: function (id) {
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
        'list-advanced-group-row-spacer': function (ctx) {
            var showSpacer = false,
                currentGroupIndex = Number(ctx.$data) - 1;
            
            showSpacer = Object.keys(ctx.$parent.groups())
                .map(function (groupKey) {
                    return ctx.$parent.groups()[groupKey];
                })
                .slice(0, currentGroupIndex +1)
                .reduce(function (previousHasSpacer, group, index) {
                    var ret, 
                        previousGroup = ctx.$parent.groups()[index.toString()];
                        
                    if(!previousGroup) {
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

