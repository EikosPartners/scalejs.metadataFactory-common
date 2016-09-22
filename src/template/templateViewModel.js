import { createViewModel as createViewModelUnbound,
    createViewModels as createViewModelsUnbound } from 'scalejs.metadataFactory'
import { getRegisteredTemplates } from 'scalejs.mvvm'
import { cloneDeep } from 'lodash';
import { observable } from 'knockout';
import { merge } from 'scalejs';

export default function templateViewModel(node) {
    var data = observable(node.hasOwnProperty('data') ? node.data : {}), // ability to override initial data
        context = node.options && node.options.createContext ? { metadata: [], data: data } : this,
        createViewModel = createViewModelUnbound.bind(context), // passes context
        createViewModels = createViewModelsUnbound.bind(context), // passes context        
        registeredTemplates = getRegisteredTemplates(),
        dataSourceEndpoint = node.dataSourceEndpoint,
        isShown = observable(node.visible !== false),
        actionNode = cloneDeep(node.action),        
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
            callback: function (err, results) {
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
        action = { action: function () { } };
    }

    if (node.dataSourceEndpoint) {
        
        if (dataSourceEndpoint.type === 'action') {
        console.log(`[templateVM] - template has been upgraded to 
            support "options" as a dataSourceEndpoint instead of action`, node);
            dataSourceEndpoint = dataSourceEndpoint.options;
        }

        if (!node.lazyLoad) {
            fetchData();
        }
    }

    return merge(node, {
        mappedChildNodes: mappedChildNodes,
        fetchData: fetchData,
        action: action,
        data: data,
        isShown: isShown,
        context: this
    });
}
