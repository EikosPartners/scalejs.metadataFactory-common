'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = templateViewModel;

var _scalejs = require('scalejs.metadataFactory');

var _scalejs2 = require('scalejs.mvvm');

var _lodash = require('lodash');

var _knockout = require('knockout');

var _scalejs3 = require('scalejs');

function templateViewModel(node) {
    var data = (0, _knockout.observable)(node.hasOwnProperty('data') ? node.data : {}),
        // ability to override initial data
    context = node.options && node.options.createContext ? { metadata: [], data: data } : this,
        createViewModel = _scalejs.createViewModel.bind(context),
        // passes context
    createViewModels = _scalejs.createViewModels.bind(context),
        // passes context        
    registeredTemplates = (0, _scalejs2.getRegisteredTemplates)(),
        dataSourceEndpoint = node.dataSourceEndpoint,
        isShown = (0, _knockout.observable)(node.visible !== false),
        actionNode = (0, _lodash.cloneDeep)(node.action),
        dataLoaded = false,
        mappedChildNodes,
        action;

    function fetchData() {
        if (node.cache && dataLoaded) {
            return;
        }

        createViewModel({
            "type": "action",
            "actionType": "ajax",
            "options": dataSourceEndpoint
        }).action({
            callback: function callback(err, results) {
                if (err) {
                    console.log('ajax request error', err);
                    data(err);
                    return;
                }
                data(results);
                dataLoaded = true;
            }
        });
    }

    if (node.template && !registeredTemplates[node.template]) {
        console.error('Template not registered ', node.template);
        node.template = 'metadata_default_template';
    }

    mappedChildNodes = createViewModels(node.children || []);

    if (actionNode) {
        action = createViewModel(actionNode);
    } else {
        action = { action: function action() {} };
    }

    if (node.dataSourceEndpoint) {

        if (dataSourceEndpoint.type === 'action') {
            console.log('[templateVM] - template has been upgraded to \n            support "options" as a dataSourceEndpoint instead of action', node);
            dataSourceEndpoint = dataSourceEndpoint.options;
        }

        if (!node.lazyLoad) {
            fetchData();
        }
    }

    return (0, _scalejs3.merge)(node, {
        mappedChildNodes: mappedChildNodes,
        fetchData: fetchData,
        action: action,
        data: data,
        isShown: isShown,
        context: this
    });
}
//# sourceMappingURL=templateViewModel.js.map