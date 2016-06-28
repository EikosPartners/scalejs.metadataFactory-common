'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = templateViewModel;

var _scalejs = require('scalejs.metadataFactory');

var _scalejs2 = require('scalejs.mvvm');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _knockout = require('knockout');

var _knockout2 = _interopRequireDefault(_knockout);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function templateViewModel(node) {
    var observable = _knockout2.default.observable,
        merge = _lodash2.default.merge,
        data = observable(node.data || {}),
        context = node.options && node.options.createContext ? { metadata: [], data: data } : this,
        createViewModel = _scalejs.createViewModel.bind(context),
        // passes context
    createViewModels = _scalejs.createViewModels.bind(context),
        // passes context
    // properties
    isShown = observable(node.visible !== false),

    //visible = observable(),
    actionNode = _lodash2.default.cloneDeep(node.action),
        action,
        mappedChildNodes,
        registeredTemplates = (0, _scalejs2.getRegisteredTemplates)();

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
        // create a callback object that the ajaxAction knows how to use.
        // this is the alternative to the lously coupled nextactions[] || error actions.
        var callback = {
            callback: function callback(err, results) {
                if (err) {
                    console.log('ajax request error', err);
                    return;
                }
                data(results);
            }
        };
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
//# sourceMappingURL=templateViewModel.js.map