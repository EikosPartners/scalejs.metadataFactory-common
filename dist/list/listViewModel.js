'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = listViewModel;

var _scalejs = require('scalejs.sandbox');

var _scalejs2 = _interopRequireDefault(_scalejs);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _knockout = require('knockout');

var _knockout2 = _interopRequireDefault(_knockout);

var _scalejs3 = require('scalejs.metadataFactory');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// todo: revisit comments below
// listViewModel is a component which manages a simple list
// - items - items are what are used to make up the rows in the list
// - options
// -- addRows - if false add button does not appear
// -- deleteRows - if false delete button does not appear
// -- minRequiredRows - initializes list with # of rows and wont let user delete

//TODO: Refactor Session
//- implement "parent passes to children" pattern for labels
//- brainstorm cleaner "itemViewModel" imp.
//- general clean up/renaming/documenting session
// ...add more refactor session goals here!
/**
 *  list is the component to use when wanting to group items into enumerable lists.
 *  There are two types of lists: responsive form lists (default) and table lists (+listAdvanced wrapper)
 *  The underlying data model for a list is an array of objects.
 *
 * @module list
 *
 * @param {object} node
 *  The configuration specs for the component.
 * @param {string} [node.id]
 *  The id of the list becomes the key in the data for all the children of the list.
 *
 */
/*global define, sandbox, _, ko*/
var observable = _scalejs2.default.mvvm.observable,
    observableArray = _scalejs2.default.mvvm.observableArray,
    evaluate = _scalejs2.default.expression.evaluate,
    computed = _scalejs2.default.mvvm.computed,
    merge = _scalejs2.default.object.merge,
    unwrap = _knockout2.default.unwrap,
    has = _scalejs2.default.object.has,
    is = _scalejs2.default.type.is,
    noticeboard = _scalejs2.default.noticeboard.global,
    listItems = {
    DELETE: del,
    DELETE_FLAG: deleteFlag
};

function del(itemDef) {
    var context = this;
    return merge(itemDef, {
        id: undefined,
        template: {
            name: 'list_del_template',
            data: context
        }
    });
}

function deleteFlag(itemDef) {
    var context = this;
    // the id will be the propertu
    // getValue - return if it was deleted or not
    return context.isNew ? del.call(context, itemDef) : merge(context, {
        template: 'list_del_flag_template',
        getValue: function getValue() {
            return context.deleteFlag() ? "T" : "F";
        },
        deleteRow: function deleteRow() {
            context.deleteFlag(true);
            if (itemDef.options && itemDef.options.clearOnDelete) {
                var item = context.itemDictionary()[itemDef.options.clearOnDelete];
                if (item && item.setValue) {
                    item.setValue(0);
                }
            }
        }
    }, itemDef);
}

function listViewModel(node) {
    var keyMap = node.keyMap || {},
        rows = observableArray(),
        options = node.options || {},
        isShown = observable(true),
        context = this,
        readonly = observable(context.readOnly && context.readonly() || false),
        //initialize to the context's state as determined by the form generally
    deleteRows = observable(options.deleteRows !== false),
        minRequiredRows = 0,
        showRemoveButton,

    // addButtonContext = node.addButtonContext,
    mappedChildNodes = observableArray(),
        data = observable(node.data),
        unique = {},
        visibleRows = observableArray(),
        scrolled,
        initialData = _lodash2.default.cloneDeep(node.data) || [];

    function setReadonly(bool) {
        readonly(bool); //sets readonly state of the list
        rows().forEach(function (row) {
            //sets readonly state of each row
            row.readonly(bool);
        });
    }

    // rowViewModel
    // called on each add
    // or when data is set with initial values
    function rowViewModel(initialValues, isNew) {
        var items = observableArray(),
            // observable array to hold the items in the row
        itemDictionary = observable({}),
            // observable dictionary to hold the items and other properties
        rowContext = {
            metadata: context.metadata, // reference to the parent metadata
            rows: rows,
            unique: unique,
            isNew: isNew,
            itemDictionary: itemDictionary,
            editMode: observable(false), //for styling - maybe better if called isActiveRow
            deleteFlag: observable(false)
        },
            row = {},
            // the row itself
        itemViewModels,
            rowReadonly;

        // initialize row readonly as the list's state
        rowContext.readonly = observable(readonly());

        // rowReadonly - string to run thrown expression parser to show/hide rows
        if (is(options.rowReadonly, 'string')) {
            rowReadonly = computed(function () {
                if (rowContext.readonly && rowContext.readonly()) {
                    return true; //if readonly is true on context, then row is readonly
                }
                // else, eval the expression to determine if the row is readonly
                return evaluate(options.rowReadonly, function (id) {
                    var item = itemDictionary()[id];
                    if (item && item.getValue) {
                        return item.getValue();
                    }
                });
            });
        }

        // can be utilized by expression parser to get error for an id
        function error(id) {
            var item = itemDictionary()[id];
            if (item && item.inputValue && item.inputValue.error) {
                return item.inputValue.error();
            }
        }

        // accurately calculates the index of the row in the list
        rowContext.index = computed(function () {
            return rows().indexOf(row);
        });

        // getValueById function for expression parsing
        // todo. refactor this
        rowContext.getValue = function (id) {
            if (id === 'index') {
                return rowContext.index();
            }
            if (id === 'list') {
                return rows();
            }
            if (id === 'row') {
                return rows()[rowContext.index()];
            }
            if (id === 'error') {
                return error;
            }
            // check the item dictionary
            var item = itemDictionary()[id];
            if (item && item.getValue) {
                return item.getValue();
            }

            // if the item doesnt have getValue, return itself
            if (has(item)) {
                return unwrap(item);
            }
            return context.getValue(id);
        };

        itemViewModels = node.items.map(function (_item) {
            var item = _lodash2.default.cloneDeep(_item); // deep clone the item as we might mutate it before passing to createViewModels

            // add readonly computed to the item before passing it to input
            // input will use the already defined observable if it exists
            // but, if the input already has readonly set on it, dont get readonly from row..
            if (rowReadonly && item.input && !has(item.input.readonly)) {
                item.input.readonly = rowReadonly;
            }

            if (item.options && item.options.unique) {
                if (!item.id) {
                    console.error('Cannot set unique on item without id');
                } else if (!unique[item.id]) {
                    //only create once
                    unique[item.id] = observableArray();
                }
            }

            // todo - clean this up?
            if (listItems[item.type]) {
                var ret = listItems[item.type].call(rowContext, item);
                if (item.visible) {
                    ret.visible = computed(function () {
                        return evaluate(item.visible, rowContext.getValue);
                    });
                }
                return ret;
            } else {
                return _scalejs3.createViewModel.call(rowContext, item);
            }
        });

        // if there are initial values, update the children
        if (initialValues) {
            itemViewModels.forEach(function (item) {
                if (initialValues[item.id]) {
                    // allow for JSON default values don't get overwritten by server data that doesn't contain data
                    item.setValue && item.setValue(initialValues[item.id]);
                }
            });
        }

        // update items obsArr
        items(itemViewModels);

        // generate itemDictionary from the itemViewModels
        // also add each item's inputValue directly on the row
        // this is for MemberExpressions to work properly (list[0].Status)
        itemDictionary(itemViewModels.reduce(function (dict, item) {
            if (has(item.id)) {
                dict[item.id] = item;
                row[item.id] = item.inputValue;
            }
            return dict;
        }, merge(initialValues || {}))); // just in case some data doesnt have a column, keep it in the item dict

        // TODO: ItemDict or Row? which one is better?
        // rowVM
        row.items = items;
        row.itemDictionary = itemDictionary;
        row.mappedChildNodes = items;
        row.editMode = rowContext.editMode;
        row.deleteFlag = rowContext.deleteFlag;
        row.readonly = function (bool) {
            items().forEach(function (item) {
                if (item.setReadonly) {
                    item.setReadonly(bool);
                } else if (item.readonly) {
                    item.readonly(bool);
                }
            });
        };

        return row;
    }

    // generates a new row and add to list
    function add(row, isNew) {
        var rowVm = rowViewModel(row, isNew);

        // add remove function to rowVM
        rowVm.remove = function () {
            rowVm.items().forEach(function (item) {
                if (item.dispose) {
                    item.dispose();
                }
            });
            rows.remove(rowVm);
        };

        if (options.push) {
            rows.push(rowVm);
        } else {
            rows.unshift(rowVm);
        }

        if (isNew === true) {
            // auto-focus on the newly added row
            setTimeout(function () {
                // need to wait for clickOff events to stop firing.
                rowVm.editMode(true);
                (rowVm.items() || []).some(function (item) {
                    if (item.rendered() && item.hasFocus) {
                        item.hasFocus(true);
                        return true;
                    }
                });
            });
        }
    }

    // returns the values of the list
    // e.g. [{item1:'Value1',item2:'Value2'}]
    // dontSendIfEmpty - this prevents items from getting sent in the data if that property is empty
    // if array is empty send null
    function getValue() {
        var originalData = data.peek(),
            listData = _lodash2.default.cloneDeep(rows().map(function (row) {
            var originalRowItems = row.itemDictionary.peek();
            return Object.keys(originalRowItems).reduce(function (dataObj, itemKey) {
                var item = row.itemDictionary.peek()[itemKey];

                if (item.getValue) {
                    dataObj[item.id] = item.getValue();
                } else if (has(item) && item.type !== 'DELETE') {
                    dataObj[itemKey] = item;
                }
                return dataObj;
            }, {});
        }).filter(function (obj) {
            return !(options.dontSendIfEmpty && !obj[options.dontSendIfEmpty] && obj[options.dontSendIfEmpty] !== 0);
        }));
        if (options.sendNullIfEmpty && listData.length === 0) {
            listData = null;
        }
        return listData;
    }

    // on initialization if the node already has data defined, add rows
    // else generate the minReqiredRows
    function initialize() {
        //console.time('List init');
        if (data()) {
            rows().forEach(function (row) {
                row.items().forEach(function (item) {
                    item.dispose && item.dispose();
                });
            });
            rows.removeAll();
            data().forEach(function (item) {
                add(item, false);
            });

            //if trackDiffChanges set to true store the original data to noticeboard
            if (node.trackDiffChanges) {
                noticeboard.set(node.id, data());
            }
        } else {
            for (var i = 0; i < minRequiredRows; i++) {
                add(null, true);
            }
        }
        //  console.timeEnd('List init');
    }

    // sets value in list
    // or re-inits if data is empty or invalid
    function setValue(newData) {
        // reverse the data because adding now unshifts the rows.
        if (Array.isArray(newData.value) && !options.push) {
            newData.value.reverse();
        }
        data(newData.value || initialData || []);
        initialize();
    }

    // returns last row
    function lastRow() {
        return rows()[rows().length - 1];
    }

    // sets minrequired rows
    if (node.validations && node.validations.required) {
        minRequiredRows = node.validations.required === true ? 1 : node.validations.required;
    }

    // only show remove button if rows is greater than min req rows
    showRemoveButton = computed(function () {
        return rows().length > minRequiredRows;
    });

    // get data from data parent if exists
    if (context.data && !options.subscribeToData) {
        console.warn('Please make sure you get the Data from form and setValue or set node.subscribeToData to true! Removing data-subscribe as a default', node);
    }
    if (options.subscribeToData && context.data) {
        if (context.data()[node.id]) {
            data(context.data()[node.id]);
        } else {
            context.data.subscribe(function (newData) {
                if (newData[node.id]) {
                    data(newData[node.id]);
                    initialize();
                }
            });
        }
    }

    initialize();

    // will "remove" mapped child nodes if the list is hidden
    // this is required for validations to work properly
    // todo: remove this workaround and implement validation on list itself
    computed(function () {
        if (isShown()) {
            mappedChildNodes(rows().filter(function (row) {
                return !row.deleteFlag();
            }));
        } else {
            mappedChildNodes([]);
        }
    });

    if (node.infinite) {
        rows.subscribe(function (newRows) {
            visibleRows((newRows || []).slice(0, 20));
        });

        scrolled = function scrolled(event) {
            var elem = event.target,
                currentRows = rows();

            if (elem.scrollTop > elem.scrollHeight - elem.offsetHeight - 35) {
                var seed = visibleRows().length;
                for (var i = 0; i < 20; i++) {
                    visibleRows.push(currentRows[seed + i]);

                    if (!currentRows[seed + i]) {
                        // no more rows stahp
                        break;
                    }
                }
            }
        };
    }

    return merge(node, {
        add: add,
        rows: node.infinite ? visibleRows : rows,
        allRows: rows,
        scrolled: scrolled,
        mappedChildNodes: mappedChildNodes,
        isShown: isShown,
        showRemove: showRemoveButton,
        getValue: getValue,
        setValue: setValue,
        readonly: readonly,
        deleteRows: deleteRows,
        lastRow: lastRow,
        setReadonly: setReadonly
    });
};
//# sourceMappingURL=listViewModel.js.map