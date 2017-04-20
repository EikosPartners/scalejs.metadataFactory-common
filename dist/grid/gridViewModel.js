'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (node) {
    var data = node.data,
        options = node.options,
        columns = node.columns,
        context = this,
        pagination = node.pagination,
        endpoint = node.dataSourceEndpoint,
        rows = _knockout2.default.observableArray(),
        skip = _knockout2.default.observable(pagination.start || 0),
        limit = _knockout2.default.observable(pagination.limit || 15),
        search = _knockout2.default.observable(''),
        filters = _knockout2.default.observable({}),
        caseInsensitive = _knockout2.default.observable(true),
        clientSearch = options.clientSearch,
        selectedItem = _knockout2.default.observable({}),
        gridContext = {
        search: search,
        filters: filters,
        rows: rows,
        skip: skip,
        clientSearch: clientSearch,
        caseInsensitive: caseInsensitive,
        getValue: this.getValue,
        parentContext: context
    },
        loaderNoText = '',
        loaderLoading = 'Loading more...',
        loaderDone = 'Loaded all rows',
        loader = {
        text: _knockout2.default.observable(loaderNoText),
        done: false,
        inProgress: _knockout2.default.observable(false)
    },
        subs = [];

    var query = void 0,
        queryCallback = void 0,
        gridHeaderItems = node.gridHeader || [];

    function setupQuery() {
        query = (0, _scalejs.createViewModel)({
            type: 'action',
            actionType: 'ajax',
            options: endpoint
        });
    }

    function setupGetResponse() {
        queryCallback = {
            callback: function callback(err, results) {
                if (!err) {
                    var key = (0, _scalejs2.get)(endpoint, 'keyMap.resultsKey'),
                        resultData = key && results ? results[key] : results;
                    rows.push.apply(rows, _toConsumableArray(resultData));
                    skip(results.skip);
                    loader.inProgress(false);
                    loader.done = results.skip >= results.total;
                    if (loader.done) {
                        loader.text(loaderDone);
                    } else {
                        loader.text(loaderNoText);
                    }
                } else {
                    console.error('Error in grid query callback: ' + (err.message || ''));
                }
            }
        };
    }

    function sendQuery(isFilter) {
        if (isFilter || !loader.done && !loader.inProgress()) {
            if (isFilter) {
                skip(0);
                rows.removeAll();
            }
            query.options.target.data = {
                skip: skip(),
                limit: limit()
            };
            // data is in target.data, so it will be sent as is
            if (!clientSearch) {
                query.options.target.data.search = search();
                query.options.target.data.filters = filters();
            }
            loader.inProgress(true);
            loader.text(loaderLoading);
            query.action(queryCallback);

            // TODO: call a resetfilter function to update skip/row observs in here
        }
    }

    function setupGridHeader() {
        gridHeaderItems = gridHeaderItems.map(function (item) {
            return _scalejs.createViewModel.call(gridContext, item);
        });
        // TODO: update to createViewModels after Erica updates mf
        search.extend({ rateLimit: 1000 });
        if (!clientSearch) {
            search.subscribe(function () {
                return sendQuery(true);
            });
            filters.subscribe(function () {
                return sendQuery(true);
            });
        }
    }

    function setupRefresh() {
        subs.push((0, _scalejs3.receive)(node.id + '.refresh', function () {
            sendQuery(true);
        }));
    }

    function setupSelection() {
        if (node.selection) {
            selectedItem.subscribe(function (item) {
                var action = _lodash2.default.cloneDeep(node.selection),
                    selectionCtx = _lodash2.default.cloneDeep(context);
                selectionCtx.data = item;
                _scalejs.createViewModel.call(selectionCtx, action).action();
            });
        }
    }

    function setupData() {
        if (endpoint) {
            setupQuery();
            setupGetResponse();
            sendQuery();
            setupRefresh();
        } else if (data) {
            rows(data);
        }
    }

    function addRow(row) {
        rows.push.apply(rows, _toConsumableArray(row));
    }

    // Set up a receiver to push rows to the grid.
    subs.push((0, _scalejs3.receive)(node.id + '.add', function (row) {
        addRow(row);
    }));

    setupData();
    setupSelection();
    setupGridHeader();

    return (0, _scalejs2.merge)(node, {
        rows: rows,
        columns: columns,
        sendQuery: sendQuery,
        loader: loader,
        options: options,
        gridHeaderItems: gridHeaderItems,
        search: search,
        filters: filters,
        caseInsensitive: caseInsensitive,
        selectedItem: selectedItem,
        dispose: function dispose() {
            subs.forEach(function (sub) {
                sub.dispose();
            });
        }
    });
};

var _scalejs = require('scalejs.metadataFactory');

var _scalejs2 = require('scalejs');

var _scalejs3 = require('scalejs.messagebus');

var _knockout = require('knockout');

var _knockout2 = _interopRequireDefault(_knockout);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/**
 * Grid component to display a grid of data
 *
 * @module grid
 *
 * @param {object} node
 *  The configuration object for the grid
 * @param {object} node.data
 *  Initial data to populate the grid with
 * @param {string} node.id
 *  The id of the grid
 * @param {string} node.classes
 *  The classes to apply to the grid
 * @param {string} node.gridHeaderClasses
 *  The classes to apply to the grid header
 * @param {array} node.gridHeader
 *  An array of PJSON components to use as the grid header
 * @param {object} node.dataSourceEndpoint
 *  Configuration object for the grid's data source
 * @param {object} node.dataSourceEndpoint.target
 *  Configuration object for the target of the grid's data source
 * @param {string} node.dataSourceEndpoint.target.uri
 *  The uri endpoint for the grid's data source
 * @param {object} node.dataSourceEndpoint.target.dataMapFunctions
 *  An object of functions to run on the data
 * @param {string} node.dataSourceEndpoint.target.dataMapFunctions.before
 *  Function to run before the data is added to the grid?
 * @param {string} node.dataSourceEndpoint.target.dataMapFunctions.after
 *  Function to run after the data is added to the grid?
 * @param {object|array} node.dataSourceEndpoint.keyMap
 *  A mapper object or array of mapper objects to map keys
 * @param {object} node.pagination
 *  An object to specify pagination for the grid
 * @param {number} node.pagination.start=0
 *  The number of which page to start the grid at
 * @param {number} node.pagination.limit=15
 *  The max number of grid items to show on each page
 * @param {array} node.columns
 *  An array of objects to build the columns
 * @param {object} node.selection
 *  A PJSON action to use when a row is selected
 * @param {object} node.options
 *  The options pertaining to the grid
 * @param {boolean} node.options.infinite
 *  Boolean to specify whether to show infinite items on the grid
 * @param {boolean} node.options.fixedHeader
 *  Boolean to specify if the grid header should be fixed or not
 * @param {object} node.options.footer
 *  Configuration object for the grid footer
 * @param {boolean} node.options.footer.hideOnDone
 *  Boolean to hide the footer once the grid is loaded or not
 * @param {string} node.options.footer.loadingText
 *  A string to show while the grid is loading
 * @param {string} node.options.footer.doneText
 *  A string to show when the grid has finished loading.
 * @param {object} node.options.hasChildren
 *  Configuration object for a grid row's child
 * @param {string} node.options.hasChildren.showIcon
 *  The class to apply to the show child button
 * @param {string} node.options.hasChildren.hideIcon
 *  The class to apply to the hide child button
 * @param {string} node.options.hasChildren.template
 *  The template to apply to the child row
 * @param {boolean} node.options.hasChildren.onRowSelect
 *  Boolean to determine whether to show/hide the child on selecting the row or via a button
 * @param {boolean} node.options.hasChildren.accordion
 *  Boolean to determine if only one child should be shown at a time
 * @param {boolean} node.options.clientSearch
 *  Boolean on whether to search/sort client side
 * @param {boolean|expression} node.options.gridDisplay
 *  Boolean or expression on whether to display the grid
 * @param {boolean} node.options.queryOnSearch
 *  Boolean to query on search or do it client side
 * @param {string} node.options.scrollElement
 *  The element on which the scrolling for the grid should be done
 *
 * @example
 * {
 *      "type": "grid",
 *      "id": "my_grid_id",
 *      "classes": "grid-container",
 *      "gridHeaderClasses": "grid-header",
 *      "options": {
 *          "infinite": true,
 *          "fixedHeader": true,
 *          "footer": {
 *              "hideOnDone": true,
 *              "loadingText": "Loading...",
 *              "doneText": "Loaded all rows."
 *          },
 *          "hasChildren": {
 *              "showIcon": "icon-open",
 *              "hideIcon": "icon-close",
 *              "template": "grid_child_template",
 *              "onRowSelect": true,
 *              "accordion": true,
 *          },
 *      }
 *      "dataSourceEndpoint": {
 *         "target": {
 *              "uri": "endpoint"
 *         },
 *         "keyMap": {
 *             "resultsKey": "data"
 *         }
 *      },
 *      "pagination": {
 *          "start": 0,
 *          "limit": 30
 *      },
 *      "columns": [
 *          {
 *              "data": "colData",
 *              "title": "Column Data Title"
 *          }
 *      ]
 * }
 */
//# sourceMappingURL=gridViewModel.js.map