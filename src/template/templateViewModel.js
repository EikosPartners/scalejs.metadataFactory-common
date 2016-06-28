import { createViewModel as createViewModelUnbound,
        createViewModels as createViewModelsUnbound } from 'scalejs.metadataFactory'
import { getRegisteredTemplates } from 'scalejs.mvvm'
import _ from 'lodash';
import ko from 'knockout';


export default function templateViewModel(node) {
    var observable = ko.observable,
        merge = _.merge,
        data = observable(node.data || {}),
        context = node.options && node.options.createContext ? { metadata: [], data: data } : this,
        createViewModel = createViewModelUnbound.bind(context), // passes context
        createViewModels = createViewModelsUnbound.bind(context), // passes context
        // properties
        isShown = observable(node.visible !== false),
        //visible = observable(),
        actionNode = _.cloneDeep(node.action),
        action,
        mappedChildNodes,
        registeredTemplates = getRegisteredTemplates();

    function getValue(key) {
        return (data() || {})[key];
    }

    if (node.template && !registeredTemplates[node.template]) {
        console.error('Template not registered ', node.template);
        node.template = 'no_template';
    }

    mappedChildNodes = createViewModels(node.children || []);

    if (actionNode) {
        action = createViewModel(actionNode);
    } else {
        action = function () { };
    }

    if (node.dataSourceEndpoint) {
        // create a callback object that the ajaxAction knows how to use.
        // this is the alternative to the lously coupled nextactions[] || error actions.
        var callback = {
            callback: function (err, results) {
                if (err) {
                    console.log('ajax request error', err);
                    return;
                }
                data(results);
            }
        }
        createViewModel(node.dataSourceEndpoint).action(callback);
    }

    return merge(node, {
        mappedChildNodes: mappedChildNodes,
        action: action,
        data: data,
        isShown: isShown,
        context: this
    });
}
