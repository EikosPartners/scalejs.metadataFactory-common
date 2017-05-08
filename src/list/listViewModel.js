import { observable, observableArray, computed, unwrap } from 'knockout';
import { createViewModel } from 'scalejs.metadataFactory';
import { evaluate } from 'scalejs.expression-jsep';
import noticeboard from 'scalejs.noticeboard';
import { merge, has, is } from 'scalejs';
import _ from 'lodash';
import ko from 'knockout';

// todo: revisit comments below
// listViewModel is a component which manages a simple list
// - items - items are what are used to make up the rows in the list
// - options
// -- addRows - if false add button does not appear
// -- deleteRows - if false delete button does not appear
// -- minRequiredRows - initializes list with # of rows and wont let user delete

// TODO: Refactor Session
// - implement "parent passes to children" pattern for labels
// - brainstorm cleaner "itemViewModel" imp.
// - general clean up/renaming/documenting session
// ...add more refactor session goals here!
/**
 *  list is the component to use when wanting to group items into enumerable lists.
 *  There are two types of lists:
 * responsive form lists (default) and table lists (+listAdvanced wrapper)
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
const listItems = {
    DELETE: del,
    DELETE_FLAG: deleteFlag
};

function del(itemDef) {
    const context = this,
        clonedItem = _.cloneDeep(itemDef);

    delete clonedItem.template; // prevent scalejs merge issue

    return merge(clonedItem, {
        id: undefined,
        template: {
            name: itemDef.template || 'list_del_template',
            data: context
        }
    });
}

function deleteFlag(itemDef) {
    const context = this;
    // the id will be the propertu
    // getValue - return if it was deleted or not
    return context.isNew ? del.call(context, itemDef) : merge(context, {
        template: 'list_del_flag_template',
        getValue: function () {
            return context.deleteFlag() ? 'T' : 'F';
        },
        deleteRow: function () {
            context.deleteFlag(true);
            if (itemDef.options && itemDef.options.clearOnDelete) {
                const item = context.itemDictionary()[itemDef.options.clearOnDelete];
                if (item && item.setValue) {
                    item.setValue(0);
                }
            }
        }
    }, itemDef);
}


export default function listViewModel(node) {
    const rows = observableArray(),
        options = node.options || {},
        isShown = observable(true),
        context = this || {},
        // initialize to the context's state as determined by the form generally
        readonly = observable((context.readonly && context.readonly()) || false),
        deleteRows = observable(options.deleteRows !== false),
        // addButtonContext = node.addButtonContext,
        mappedChildNodes = observableArray(),
        data = observable(node.data),
        unique = {},
        visibleRows = observableArray(),
        initialData = _.cloneDeep(node.data) || [],
        addButtonRendered = is(node.addButtonRendered, 'string') ?
            computed(evaluate.bind(null, node.addButtonRendered, context.getValue))
            : observable(node.addButtonRendered !== false);
    let initial = node.nodeDataAsInitial !== false,
        minRequiredRows = 0,
        showRemoveButton = null,
        sub = null,
        scrolled,
        onlyIf;

    function setReadonly(bool) {
        readonly(bool); // sets readonly state of the list
        rows().forEach((row) => { // sets readonly state of each row
            row.readonly(bool);
        });
    }

    // rowViewModel
    // called on each add
    // or when data is set with initial values
    function rowViewModel(initialValues, isNew, initialOverride) {
        const items = observableArray(), // observable array to hold the items in the row
            // observable dictionary to hold the items and other properties
            itemDictionary = observable({}),
            rowContext = {
                metadata: context.metadata, // reference to the parent metadata
                rows: rows,
                unique: unique,
                isNew: isNew,
                itemDictionary: itemDictionary,
                editMode: observable(false), // for styling - maybe better if called isActiveRow
                deleteFlag: observable(false),
                data: computed(() => {
                    const dict = itemDictionary();
                    return merge(initialValues || {}, Object.keys(dict).reduce((d, id) => {
                        const item = dict[id];
                        if (item && item.getValue) {
                            d[id] = item.getValue();
                        } else {
                            d[id] = item;
                        }
                        return d;
                    }, {}));
                })
            },
            row = {}; // the row itself
        let prop,
            itemViewModels = null,
            rowReadonly;

        // initialize row readonly as the list's state
        rowContext.readonly = observable(readonly());

        // rowReadonly - string to run thrown expression parser to show/hide rows
        if (is(options.rowReadonly, 'string')) {
            rowReadonly = computed(() => {
                if (rowContext.readonly && rowContext.readonly()) {
                    return true; // if readonly is true on context, then row is readonly
                }
                // else, eval the expression to determine if the row is readonly
                return evaluate(options.rowReadonly, (id) => {
                    const item = itemDictionary()[id];
                    if (item && item.getValue) {
                        return item.getValue();
                    }
                });
            });
        }

        // can be utilized by expression parser to get error for an id
        function error(id) {
            const item = itemDictionary()[id];
            if (item && item.inputValue && item.inputValue.error) {
                return item.inputValue.error();
            }
        }

        // accurately calculates the index of the row in the list
        rowContext.index = computed(() => rows().indexOf(row));

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
            if (id === 'parent') {
                return context.data();
            }
            // check the item dictionary
            const item = itemDictionary()[id];
            if (item && item.getValue) {
                return item.getValue();
            }

            // if the item doesnt have getValue, return itself
            if (has(item)) {
                return unwrap(item);
            }

            prop = rowContext[id];

            if (has(prop)) {
                return unwrap(prop);
            }

            return context.getValue(id);
        };


        itemViewModels = node.items.map((_item) => {
            // deep clone the item as we might mutate it before passing to createViewModels
            const item = _.cloneDeep(_item);

            // add readonly computed to the item before passing it to input
            // input will use the already defined observable if it exists
            // but, if the input already has readonly set on it, dont get readonly from row..
            if (rowReadonly && item.input && !has(item.input.readonly)) {
                item.input.readonly = rowReadonly;
            }

            if (item.options && item.options.unique) {
                if (!item.id) {
                    console.error('Cannot set unique on item without id');
                } else if (!unique[item.id]) { // only create once
                    unique[item.id] = observableArray();
                }
            }

            // todo - clean this up?
            if (listItems[item.type]) {
                const ret = listItems[item.type].call(rowContext, item);
                if (item.visible) {
                    ret.visible = computed(() => evaluate(item.visible, rowContext.getValue));
                }
                return ret;
            }
            if (options.optimize && initialValues) {
                item.options = item.options || {};
                item.options.value = initialValues[item.id];
            }
            return createViewModel.call(rowContext, item);
        });

        // if there are initial values, update the children
        if (initialValues && !options.optimize) {
            itemViewModels.forEach((item) => {
                // allow for JSON default values don't get overwritten
                // by server data that doesn't contain data
                if (initialValues[item.id]) {
                    item.setValue && item.setValue(initialValues[item.id], { initial: initialOverride !== false });
                }
            });
        }

        // update items obsArr
        items(itemViewModels);

        // generate itemDictionary from the itemViewModels
        // also add each item's inputValue directly on the row
        // this is for MemberExpressions to work properly (list[0].Status)
        itemDictionary(itemViewModels.reduce((dict, item) => {
            if (has(item.id)) {
                dict[item.id] = item;
                row[item.id] = item.inputValue;
            }
            return dict;
        }, merge(initialValues || {})));
        // just in case some data doesnt have a column, keep it in the item dict

        // TODO: ItemDict or Row? which one is better?
        // rowVM
        row.items = items;
        row.itemDictionary = itemDictionary;
        row.mappedChildNodes = items;
        row.editMode = rowContext.editMode;
        row.deleteFlag = rowContext.deleteFlag;
        row.readonly = function (bool) {
            items().forEach((item) => {
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
    function add(row, isNew, initialOverride) {
        const rowVm = rowViewModel(row, isNew, initialOverride);

        // add remove function to rowVM
        rowVm.remove = function () {
            rowVm.items().forEach((item) => {
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


        if (isNew === true && options.focusNew !== false) {
            // auto-focus on the newly added row
            setTimeout(() => {
                // need to wait for clickOff events to stop firing.
                rowVm.editMode(true);
                (rowVm.items() || []).some((item) => {
                    if (item.rendered() && item.hasFocus) {
                        item.hasFocus(true);
                        return true;
                    }
                    return false;
                });
            });
        }
    }

    // returns the values of the list
    // e.g. [{item1:'Value1',item2:'Value2'}]
    // dontSendIfEmpty - this prevents items from getting
    // sent in the data if that property is empty
    // if array is empty send null
    function getValue() {
        let listData = _.cloneDeep(rows().map((row) => {
            const originalRowItems = row.itemDictionary.peek();
            return Object.keys(originalRowItems).reduce((dataObj, itemKey) => {
                const item = row.itemDictionary.peek()[itemKey];

                if (item && item.getValue) {
                    dataObj[item.id] = item.getValue();
                } else if (has(item) && item.type !== 'DELETE') {
                    dataObj[itemKey] = item;
                }
                return dataObj;
            }, {});
        }).filter(obj => !(options.dontSendIfEmpty &&
            (!obj[options.dontSendIfEmpty] && obj[options.dontSendIfEmpty] !== 0))));
        if (options.sendNullIfEmpty && listData.length === 0) {
            listData = null;
        }
        return listData;
    }

    // on initialization if the node already has data defined, add rows
    // else generate the minReqiredRows
    function initialize() {
        // console.time('List init');
        if (options.optimize) {
            ko.options.deferUpdates = true;
        }
        rows().forEach((row) => {
            row.items().forEach((item) => {
                item.dispose && item.dispose();
            });
        });
        rows.removeAll();
        if (data() && Array.isArray(data()) && data().length > 0) {
            data().forEach((item) => {
                add(item, false, initial);
            });

            // if trackDiffChanges set to true store the original data to noticeboard
            if (node.trackDiffChanges) {
                noticeboard.set(node.id, data());
            }
        } else {
            for (let i = rows().length; i < minRequiredRows; i++) {
                add(null, true, initial);
            }
        }
        initial = undefined;
        if (options.optimize) {
            ko.options.deferUpdates = false;
        }
        //  console.timeEnd('List init');
    }

    // sets value in list
    // or re-inits if data is empty or invalid
    function setValue(newData) {
        if ((newData === null ||
            (Array.isArray(newData) && newData.length === 0)) && getValue() === null) {
            return; // new data is same as current one (empty array)
        }
        // reverse the data because adding now unshifts the rows.
        if (Array.isArray(newData) && !options.push) {
            newData.reverse();
        }
        data(newData || (initialData || []));
        initialize();
    }

    function update(value) {
        console.info('List only supports udate for value');
        setValue(value);
    }

    // returns last row
    function lastRow() {
        return rows()[rows().length - 1];
    }

    // sets minrequired rows
    if (node.validations && node.validations.required) {
        const minRows = node.validations.required.params || node.validations.required;
        minRequiredRows = minRows === true ? 1 : minRows;

        if (node.validations.required.onlyIf) {
            onlyIf = node.validations.required.onlyIf;
        }
    } else if (node.data) {
        minRequiredRows = node.data.length;
    }

    // only show remove button if rows is greater than min req rows
    showRemoveButton = computed(() => {
        let isRequired = true;
        if (onlyIf) {
            isRequired = evaluate(onlyIf, context.getValue);
        }
        return !isRequired ||
            rows().filter(r => !r.deleteFlag || !r.deleteFlag()).length > minRequiredRows;
    });

    // get data from data parent if exists
    if (context.data && !options.subscribeToData) {
        console.warn('Please make sure you get the Data from setValue or set node.subscribeToData to true! Removing data-subscribe as a default', node);
    }
    if (options.subscribeToData && context.data) {
        if (context.data()[node.id]) {
            data(context.data()[node.id]);
        } else {
            context.data.subscribe((newData) => {
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
    sub = computed(() => {
        let rendered = true;
        if (node.rendered) {
            rendered = evaluate(node.rendered, context.getValue);
        }
        if (isShown() && rendered) {
            mappedChildNodes(rows().filter(row => !row.deleteFlag()));
        } else {
            mappedChildNodes([]);
        }
    });

    if (node.infinite) {
        rows.subscribe((newRows) => {
            visibleRows((newRows || []).slice(0, 20));
        });

        scrolled = function (event) {
            const elem = event.target,
                currentRows = rows();

            if (elem.scrollTop > (elem.scrollHeight - elem.offsetHeight - 35)) {
                const seed = visibleRows().length;
                for (let i = 0; i < 20; i++) {
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
        options: options,
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
        setReadonly: setReadonly,
        addButtonRendered: addButtonRendered,
        update: update,
        dispose() {
            sub.dispose();
        }
    });
}