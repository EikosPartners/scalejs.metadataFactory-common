import { computed, unwrap, observable, observableArray, pureComputed } from 'knockout';
import { createViewModel as createViewModelUnbound } from 'scalejs.metadataFactory';
import { evaluate } from 'scalejs.expression-jsep';
import { notify } from 'scalejs.messagebus';
import { is, has, merge } from 'scalejs';

    // the list advanced component provides advanced features over the base list
    // - Headers (TBD) and Footers (partially done)
    // - ListItems such as ADD and EMPTY
    // - GroupBy
    let listItems = {
            ADD: add,
            EMPTY: empty,
            TEXT: text,
            TOTAL: total
        };

    // creates the Add ViewModel from the add def
    function add(addDef, list) {
        return merge({
            template: 'list_advanced_add_item_template',
            text: 'Add',
            add: function () {
                var lastRow = list.lastRow(),
                    initialItems = {};

                // autpopulate
                // an array containing the items which should be autopopulated with the last row's values
                if (addDef.autopopulate) {
                    addDef.autopopulate.forEach(function (prop) {
                        var lastProp = lastRow.itemDictionary()[prop];
                        initialItems[prop] = lastProp.getValue();
                    });
                }

                // increment
                // a string indicating which property to incremement upon add
                if (addDef.increment) {
                    (Array.isArray(addDef.increment) ? addDef.increment : [addDef.increment]).forEach(function(prop) {
                        initialItems[prop] = Number(lastRow.itemDictionary()[prop].getValue())+1;
                    });
                }

                // defaults
                // sets the value of an item to a default value
                if (addDef.defaults) {
                    Object.keys(addDef.defaults).forEach(function(key) {
                        initialItems[key] = addDef.defaults[key]
                    });
                }

                // creates new item in list
                list.add(initialItems);
            }
        }, addDef)
    }

    // creates an empty space in table
    function empty(emptyDef, base) {
        return merge({
            template: 'list_advanced_empty_item_template',
            cellClasses: 'empty'
        }, emptyDef);
    }

    function text(textDef, base) {
        return merge({
            template: 'list_advanced_text_item_template'
        }, textDef)
    }

    function total(totalDef, list) {
        // create a input vm
        var totalJson = {
                id: totalDef.id,
                type: 'input',
                inputType: 'text',
                label: 'Total',
                cellClasses: totalDef.cellClasses,
                options: merge({
                    readonly: true
                }, totalDef.options)
            },
            // use input view model for instant formatting/validation
            totalViewModel = createViewModelUnbound.call(this, totalJson),
            total = computed(function () {
                return list.rows().reduce(function (sum, row) {
                    return sum + Number(row[totalDef.field]() || 0) // get the value for field
                }, 0)
            });

        total.subscribe(function (sum) {
            totalViewModel.setValue(sum.toFixed(2));
        });

        // adding totals to the dictionary from the context
        if (totalDef.id) {
            this.dictionary()[totalDef.id] = totalViewModel;
            //this.dictionary.valueHasMutated();
        }

        return totalViewModel;
    }

    export default function (node) {
        var createViewModel = createViewModelUnbound.bind(this),
            context = this,
            itemDictionary = observable({}),
            listViewModel = createViewModel(merge({ id: node.id }, node.list)), // pass along id
            headers = (node.headers || []).map(function (header) {
                return {
                    items: header.items.map(function (item) {
                        if (listItems[item.type]) {
                            return listItems[item.type].call(this, item, listViewModel);
                        }
                    })
                }
            }),
            headerItems = (node.list.items || []).map(function (header) {
                var classes = [];

                if (header.id) {
                    classes.push(header.id);
                }
                if (header.headerClasses) {
                    classes.push(header.headerClasses);
                }
                return {
                    text: header.label,
                    classes: classes.join(' '),
                    hidden: header.hidden
                };
            }),
            footers = (node.footers || []).map(function (footer) {
                var items, visible = true;

                // maps footer item defs
                items = footer.items.map(function (item) {
                    if (listItems[item.type]) {
                        return listItems[item.type].call(context, item, listViewModel);
                    } else {
                        return createViewModelUnbound.call({
                            metadata: context.metadata,
                            getValue: function (id) {
                                var item = itemDictionary()[id];
                                if (item && item.getValue) {
                                    return item.getValue();
                                }
                                return context.getValue(id);
                            }
                        }, item)
                    }
                });

                items.forEach(function (item) {
                    if (item.id) {
                        // add to dictionary for accessibility from expressions
                        itemDictionary()[item.id] = item;
                        itemDictionary.valueHasMutated();
                    }
                })

                // creates expression binding for visible
                if (has(footer.visible)) {
                    visible = is(footer.visible, 'boolean') ? footer.visible : pureComputed(function() {
                        return evaluate(footer.visible, function (id) {
                            if (id === 'list') {
                                return listViewModel.rows() || []
                            }

                            if (id === 'dict') {
                                return itemDictionary();
                            }

                            if (id === 'readonly') {
                                return context.readonly()
                            }

                            var item = itemDictionary()[id];
                            if (item) {
                                return item;
                            }
                            console.log(id);
                            // returning empty string within string as catch all for evaluate function
                            return '""';
                        });
                    });
                }

                return  merge(footer, {
                    items: items,
                    visible: visible
                });
            }),
            groups,
            visibleRows = observableArray(),
            viewmodel,
            showInfinite;

       // Updates rows within the list with additional properties in regards to their group
       // all subscribers are notified
       function updateRowsWithGroupValues(groupDict) {
            Object.keys(groupDict).forEach(function(group) {
                var groupArray = groupDict[group];
                groupArray.forEach(function(row, index) {
                    row.itemDictionary().group = groupArray;
                    row.itemDictionary().groupIndex =index;
                    row.itemDictionary.valueHasMutated();
                })
            });
       }

       // will group the nodes based on groupby prop
       if (node.groupBy) {
           groups = computed(function () {
               var groupDict = {};
               listViewModel.rows().forEach(function(row) {
                   var group = unwrap(row[node.groupBy]);
                   groupDict[group] = groupDict[group] || [];
                   groupDict[group].push(row);
               });
               return groupDict;
           });
           // update rows
           groups.subscribe(updateRowsWithGroupValues);
           updateRowsWithGroupValues(groups());
       }

       if(listViewModel.infinite) {
           //the listViewModel is managing its rows to account for infinite scroll
           //the listAdvanced will show only up to 25 rows and show the infinitely scrolling list in a popup

            visibleRows((listViewModel.allRows() || []).slice(0,20));
            listViewModel.allRows.subscribe(function (newRows) {
                visibleRows((newRows ||[]).slice(0,20));
            });

            showInfinite = function () {
                listViewModel.rows(listViewModel.rows().slice(0,20));
                notify('showPopup', merge(viewmodel, {
                    template: 'listAdvanced_infinite_template',
                    disableHasFocus: true
                }));
            }
       }

        viewmodel = merge(node, {
            setReadonly: listViewModel.setReadonly,
            getValue: listViewModel.getValue,
            setValue: listViewModel.setValue,
            headers: headers,
            headerItems: headerItems,
            footers: footers,
            groups: groups,
            list: listViewModel,
            rows: listViewModel.infinite ? visibleRows : listViewModel.rows,
            showInfinite: showInfinite,
            showRemove: listViewModel.showRemove,
            deleteRows: listViewModel.deleteRows,
            itemDictionary: itemDictionary,
            mappedChildNodes: listViewModel.mappedChildNodes, //for automatic stuff
            context: this //for the bindings to access context
        });
        return viewmodel;
    };
