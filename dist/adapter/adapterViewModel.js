'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = adapterViewModel;

var _knockout = require('knockout');

var _scalejs = require('scalejs.metadataFactory');

var _scalejs2 = require('scalejs.messagebus');

var _lodash = require('lodash');

var _scalejs3 = require('scalejs');

var _scalejs4 = require('scalejs.noticeboard');

var _scalejs5 = _interopRequireDefault(_scalejs4);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* TODO:
In PJSON, we used readonly, errors, etc. We need a way to do that outside of adapter
i.e. plugin to adapter context with other components
*/

/** Adapter: a viewless component which keeps track of child nodes and the data for the nodes
 * @module adapter
 *
 * @param {object} node
 *  The configuration object for the module
 * @param {string} node.type='adapter'
 *  The type of the node is adapter
 * @param {string} node.id
 *  The id for the module
 * @param {boolean} [node.lazy=false]
 *  If the child nodes need to be lazily loaded
 * (e.g. delay creation of children viewmodels until data returns)
 * @param {boolean} [node.persist=false]
 *  If data object should be persisted from one fetch data call to the next (upon refresh)
 * @param {object|Object[]} [node.dataSourceEndpoint]
 *  An object defining the endpoint(s) that makes the ajax calls
 * @param {string} node.dataSourceEndpoint.uri
 *   The uri for the endpoint
 * @param {string} [node.dataSourceEndpoint.url]
 *  The url for the endpoint
 * @param {array|object} [node.dataSourceEndpoint.keyMap]
 *  A mapper object or array of mapper objects to map keys
 * @param {string} [node.dataSourceEndpoint.keyMap.resultsKey]
 *  Map the results from the ajax call with this key
 * @param {string} [node.dataSourceEndpoint.keyMap.dataKey]
 *  Extend the data object with this key
 * @param {string} [node.dataSourceEndpoint.keyMap.storeKey]
 *  Place the resultsByKey inside of the store with this key
 * @param {object} [node.dataSourceEndpoint.options]
 *  Options for the ajax call
 * @param {array} node.children
 *  The json configuration for children nodes which will be mapped
 * to view models and kept track of from the adapter
 * @param {array} [node.plugins]
 *  The json configuration for plugins which will be accessible
 * from getValue function, based upon type
 *
 * @property {array} mappedChildNodes the mapped children nodes
 * @property {observable} data the data retrieved from dataSourceEndpoint and tracked from children
 * @property {object} contextPlugins an object that contains the plugins which have
 * been added to the adapter context
 * @property {context} the context for the adapter (which can be utilized in a custom template)
 * @property {function} dispose the dispose function for all internal subs
 *
 * @example
 * {
 *      "type": "adapter",
 *      "id": "ADAPTER_ID",
 *      "dataSourceEndpoint": [
 *          {
 *              "uri": "endpoint/uri",
 *              "options": {
 *                  "type": "PUT"
 *              },
 *              "keyMap": {
 *                  "dataKey": "a",
 *                  "resultsKey": "b"
 *              }
 *          }
 *      ],
 *      "children": [
 *          // children json configuration goes here
 *      ]
 * }
 */
function adapterViewModel(node) {
    var dictionary = (0, _knockout.observable)({}),
        // dictionary of nodes with an id
    data = (0, _knockout.observable)({}),
        // data of dictionary contents
    context = {
        metadata: node.children,
        parentContext: this,
        getValue: getValue,
        dictionary: dictionary,
        data: data,
        id: node.id
    },
        mappedChildNodes = (0, _knockout.observableArray)(),
        subs = [],
        plugins = node.plugins ? _scalejs.createViewModels.call(context, node.plugins) : [],
        contextPlugins = {};

    var dataSyncSubscription = void 0,
        updated = false;

    plugins.forEach(function (plugin) {
        contextPlugins[plugin.type] = plugin;
    });

    // recursive function which parses through nodes and adds nodes with an id to dictionary
    function createDictionary(nodes) {
        var dict = dictionary.peek();
        nodes.forEach(function (n) {
            // add node to dictionary if it isnt there yet
            if (n.id && !dict[n.id]) {
                dict[n.id] = n;
                updated = true;
            }
            // add children to dictionary if getValue function is not exposed
            if (!n.getValue) {
                createDictionary((0, _knockout.unwrap)(n.mappedChildNodes) || []);
            }
        });
    }

    // keep the data current if the node value changed with dataSyncDescription
    function syncDataDictionary() {
        dataSyncSubscription = (0, _knockout.computed)(function () {
            var dict = dictionary();
            Object.keys(dict).forEach(function (id) {
                if (dict[id].rendered) {
                    if (dict[id].rendered() && dict[id].getValue) {
                        data()[id] = dict[id].getValue();
                    } else if (!dict[id].rendered()) {
                        if (dict[id].trackIfHidden) {
                            data()[id] = dict[id].getValue();
                        } else {
                            delete data()[id];
                        }
                    }
                }
            });
        });
    }

    // pause dataSyncDescription and update the data
    function updateData(newData) {
        dataSyncSubscription && dataSyncSubscription.dispose();
        data(newData);
        syncDataDictionary();
    }

    // fetches the data from dataSourceEndpoint(s)
    function fetchData() {
        var dataSourceEndpointArray = Array.isArray(node.dataSourceEndpoint) ? node.dataSourceEndpoint : [node.dataSourceEndpoint],
            dataObject = node.persist ? data() : {};
        var count = 0;

        dataSourceEndpointArray.forEach(function (e) {
            var endpoint = e;
            if (endpoint.uri) {
                console.warn('dataSourceEndpoint expects URI in "target". Please update your JSON to reflect the new syntax');
                endpoint = (0, _scalejs3.merge)(endpoint, {
                    target: endpoint
                });
                delete endpoint.uri;
            }

            _scalejs.createViewModel.call(context, {
                type: 'action',
                actionType: 'ajax',
                options: endpoint
            }).action({
                callback: function callback(error, results) {
                    var resultsByKey = void 0,
                        keyMapArray = endpoint.keyMap || [{}],
                        newDataObject = {};

                    count += 1;

                    if (!Array.isArray(keyMapArray)) {
                        keyMapArray = [keyMapArray];
                    }

                    if (!error) {
                        keyMapArray.forEach(function (keyMap) {
                            resultsByKey = keyMap.resultsKey ? (0, _scalejs3.get)(results, keyMap.resultsKey) : results;
                            // optional: keyMap.dataKey path to extend dataObject on
                            if (keyMap.dataKey) {
                                newDataObject[keyMap.dataKey] = resultsByKey;
                            } else if (keyMap.storeKey) {
                                _scalejs5.default.setValue(keyMap.storeKey, resultsByKey);
                            } else {
                                newDataObject = resultsByKey;
                            }
                            (0, _lodash.extend)(dataObject, newDataObject);
                        });
                    }

                    if (count === dataSourceEndpointArray.length) {
                        updateData(dataObject);
                        if (!mappedChildNodes().length) {
                            mappedChildNodes(_scalejs.createViewModels.call(context, node.children || []));
                        }
                    }
                }
            });
        });
    }

    function getValue(id) {
        var dictNode = dictionary()[id],
            dataValue = (data() || {})[id];

        // the node has been defined so get the value from the node
        if (dictNode && dictNode.getValue) {
            return dictNode.getValue();
        }

        // data has been defined for the node but the node doesnt exist yet
        if (dataValue) {
            return dataValue;
        }

        if (contextPlugins && contextPlugins[id]) {
            return contextPlugins[id]();
        }
        return context.parentContext.getValue(id);
    }

    if (node.keepContextData) {
        data((0, _knockout.unwrap)(this.data) || {});
    }

    if (!node.lazy) {
        mappedChildNodes(_scalejs.createViewModels.call(context, node.children || []));
    }

    // update dictionary if mappedChildNodes of a node updates
    (0, _knockout.computed)(function () {
        updated = false;
        createDictionary(mappedChildNodes());
        if (updated) {
            dictionary.valueHasMutated();
        }
    });

    // initialize the data subscription
    syncDataDictionary();

    // get initial data
    if (node.dataSourceEndpoint) {
        fetchData();
    }

    // listen for 'refresh' event
    subs.push((0, _scalejs2.receive)(node.id + '.refresh', function (options) {
        // console.log('-->', node);
        if (node.dataSourceEndpoint) {
            fetchData(options);
        } else {
            Object.keys(dictionary()).forEach(function (key) {
                dictionary()[key].setValue && dictionary()[key].setValue('');
            });
        }
    }));

    return (0, _scalejs3.merge)(node, {
        mappedChildNodes: mappedChildNodes,
        data: data,
        contextPlugins: contextPlugins,
        context: context,
        dispose: function dispose() {
            subs.forEach(function (sub) {
                sub.dispose();
            });
        }
    });
}
//# sourceMappingURL=adapterViewModel.js.map