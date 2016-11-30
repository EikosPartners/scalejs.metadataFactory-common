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
                var key = (0, _scalejs2.get)(endpoint, 'keyMap.resultsKey'),
                    resultData = key ? results[key] : results;
                rows.push.apply(rows, _toConsumableArray(resultData));
                skip(results.skip);
                loader.inProgress(false);
                loader.done = results.skip >= results.total;
                if (loader.done) {
                    loader.text(loaderDone);
                } else {
                    loader.text(loaderNoText);
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
//# sourceMappingURL=gridViewModel.js.map