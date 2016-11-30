import { createViewModel } from 'scalejs.metadataFactory';
import { merge, get } from 'scalejs';
import { receive } from 'scalejs.messagebus';
import ko from 'knockout';
import _ from 'lodash';

export default function (node) {
    const data = node.data,
        options = node.options,
        columns = node.columns,
        context = this,
        pagination = node.pagination,
        endpoint = node.dataSourceEndpoint,
        rows = ko.observableArray(),
        skip = ko.observable(pagination.start || 0),
        limit = ko.observable(pagination.limit || 15),
        search = ko.observable(''),
        filters = ko.observable({}),
        caseInsensitive = ko.observable(true),
        clientSearch = options.clientSearch,
        selectedItem = ko.observable({}),
        gridContext = {
            search,
            filters,
            rows,
            skip,
            clientSearch,
            caseInsensitive,
            getValue: this.getValue,
            parentContext: context
        },
        loaderNoText = '',
        loaderLoading = 'Loading more...',
        loaderDone = 'Loaded all rows',
        loader = {
            text: ko.observable(loaderNoText),
            done: false,
            inProgress: ko.observable(false)
        },
        subs = [];

    let query,
        queryCallback,
        gridHeaderItems = node.gridHeader || [];

    function setupQuery() {
        query = createViewModel({
            type: 'action',
            actionType: 'ajax',
            options: endpoint
        });
    }

    function setupGetResponse() {
        queryCallback = {
            callback: function (err, results) {
                const key = get(endpoint, 'keyMap.resultsKey'),
                    resultData = key ? results[key] : results;
                rows.push(...resultData);
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
        if (isFilter || (!loader.done && !loader.inProgress())) {
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
        gridHeaderItems = gridHeaderItems.map(item => createViewModel.call(gridContext, item));
        // TODO: update to createViewModels after Erica updates mf
        search.extend({ rateLimit: 1000 });
        if (!clientSearch) {
            search.subscribe(() => sendQuery(true));
            filters.subscribe(() => sendQuery(true));
        }
    }

    function setupRefresh() {
        subs.push(receive(`${node.id}.refresh`, () => {
            sendQuery(true);
        }));
    }

    function setupSelection() {
        if (node.selection) {
            selectedItem.subscribe((item) => {
                const action = _.cloneDeep(node.selection),
                    selectionCtx = _.cloneDeep(context);
                selectionCtx.data = item;
                createViewModel.call(selectionCtx, action).action();
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

    return merge(node, {
        rows,
        columns,
        sendQuery,
        loader,
        options,
        gridHeaderItems,
        search,
        filters,
        caseInsensitive,
        selectedItem,
        dispose: function () {
            subs.forEach((sub) => {
                sub.dispose();
            });
        }
    });
}