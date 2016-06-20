'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = autocompleteViewModel;

var _scalejs = require('scalejs.sandbox');

var _scalejs2 = _interopRequireDefault(_scalejs);

var _dataservice = require('dataservice');

var _dataservice2 = _interopRequireDefault(_dataservice);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _knockout = require('knockout');

var _knockout2 = _interopRequireDefault(_knockout);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// imports
/*global define,sandbox */
var observable = _scalejs2.default.mvvm.observable,
    observableArray = _scalejs2.default.mvvm.observableArray,
    computed = _scalejs2.default.mvvm.computed,
    evaluate = _scalejs2.default.expression.evaluate,
    merge = _scalejs2.default.object.merge,
    has = _scalejs2.default.object.has,
    is = _scalejs2.default.type.is,
    unwrap = _knockout2.default.unwrap;

function autocompleteViewModel(node, inputViewModel) {
    var context = this,
        dataSourceEndpoint = node.dataSourceEndpoint,
        keyMap = node.keyMap || {},
        createViewModels = _scalejs2.default.metadataFactory.createViewModels.bind(this),

    // inputViewModel
    inputValue = inputViewModel.inputValue,
        subs = inputViewModel.subs,
        mapItem = inputViewModel.mapItem,
        hasFocus = inputViewModel.hasFocus,
        readonly = inputViewModel.readonly,
        isShown = inputViewModel.isShown,

    // props
    autocompleteSource = observableArray(),
        mappedChildNodes = observableArray(),
        sourceArray,
        validations,
        options = node.options || {},
        unique = options.unique,
        computedSource,
        itemMapper = mapItem(keyMap),
        objectValue;

    function getValue() {
        var item;
        if (mappedChildNodes() && mappedChildNodes().length) {
            //collect data from each node
            //note: works well for multi input children..
            return mappedChildNodes().reduce(function (obj, childNode) {
                return merge(obj, childNode.getValue && childNode.getValue());
            }, {});
        }
        if (node.children) {
            if (has(inputValue()) && inputValue() !== '') {
                item = _lodash2.default.find(autocompleteSource(), { value: inputValue() });
                if (item) {
                    return item.original;
                }
                return objectValue;
                console.warn('Cant find value: ' + inputValue() + ' in autocompleteSource in node', node);
            } else {
                return null;
            }
        }
        //ret[keyMap.valueKey] = inputValue();
        return inputValue();
    }

    function setValue(data) {
        var value = is(data, 'object') && has(data.value) ? data.value : data,
            d;
        if (is(value, 'object')) {
            var label = (Array.isArray(keyMap.textKey) ? keyMap.textKey : [keyMap.textKey]).map(function (k) {
                return value[k];
            }).join(keyMap.delimiter || ' / ');
            inputValue(label);

            objectValue = value;

            if (!value[options.autocompleteId] && !_lodash2.default.find(autocompleteSource(), { value: inputValue() })) {
                mappedChildNodes(createViewModels(node.children));
                // todo: Refacctor because assuming too much about children, not generic enough
                mappedChildNodes().forEach(function (child) {
                    child.mappedChildNodes.forEach(function (childNode) {
                        if (childNode.setValue && childNode.id) {
                            childNode.setValue(value[childNode.id]);
                        }
                    });
                });
            }
            return;
        }
        inputValue(value);
    }

    function mapAutocompleteSource(source) {
        return source.map(function (src) {
            if (typeof src === 'string') {
                return {
                    value: src,
                    label: src
                };
            } else {
                return src;
            }
        });
    }

    function getAutocompleteSource() {
        var contextData,
            contextDataObject = {};

        if (dataSourceEndpoint.data && dataSourceEndpoint.data.fromContext) {
            contextData = context.getValue(dataSourceEndpoint.data.fromContext);
            if (contextData === '') {
                autocompleteSource([]);
                inputValue('');
                return;
            }
            contextDataObject[dataSourceEndpoint.data.fromContext] = contextData;
            dataSourceEndpoint.data = merge(dataSourceEndpoint.data, contextDataObject);
        }
        _dataservice2.default.ajax(dataSourceEndpoint, function (error, data) {
            if (error) {
                console.error('Data retrieval failure', error);
                return;
            }
            if (keyMap.dataKey) {
                sourceArray = data[keyMap.dataKey];
                // todo: update to use mapItem
                var mappedData = data[keyMap.dataKey].map(function (d) {
                    return keyMap.textKey && keyMap.valueKey ? {
                        label: (Array.isArray(keyMap.textKey) ? keyMap.textKey : [keyMap.textKey]).map(function (k) {
                            return d[k];
                        }).join(keyMap.delimiter || ' / '),
                        value: d[keyMap.valueKey]
                    } : d[node.id]; //todo: remove this and add mapping!
                });
                autocompleteSource(mapAutocompleteSource(_lodash2.default.uniqBy(mappedData, function (item) {
                    return item ? has(item, 'value') ? item.value : item : '';
                }).filter(Boolean))); // remove empty values
            } else {
                    sourceArray = data.SearchResults;
                    autocompleteSource(mapAutocompleteSource(data.SearchResults));
                }
        });
    }

    function getAutocompleteSourceFromContext() {
        var source = evaluate(node.autocompleteSource.fromArray, context.getValue);

        // storing source array before any mapping
        sourceArray = source;
        if (Array.isArray(source)) {
            autocompleteSource(_lodash2.default.uniqBy(source.map(itemMapper)
            //todo: remove additional mapping - using binding options
            .map(function (item) {
                return {
                    label: item.text,
                    value: item.value,
                    original: item.original
                };
            }), function (item) {
                return item.value;
            }));
        }
    }

    function childSetReadonly(mappedNodes) {
        var nodes = unwrap(mappedNodes);
        nodes.forEach(function (child) {
            if (child.setReadonly) {
                child.setReadonly(readonly());
            } else if (child.mappedChildNodes) {
                childSetReadonly(child.mappedChildNodes);
            }
        });
    }

    function setReadonly(bool) {
        readonly(bool);
        childSetReadonly(mappedChildNodes);
    }

    function validateChildNodes(childNodes) {
        return unwrap(childNodes).reduce(function (isInvalid, curr) {
            if (curr.validate && typeof curr.validate === 'function') {
                return curr.validate() || isInvalid;
            } else {
                return validateChildNodes(curr.mappedChildNodes || []) || isInvalid;
            }
        }, false);
    }
    // validates the input by setting isModified to true
    // returns true if the input has an error
    function validate() {
        inputValue.isModified(true);
        if (mappedChildNodes().length) {
            return validateChildNodes(mappedChildNodes);
        }
        return !inputValue.isValid() && isShown() && this.rendered() && inputValue.severity() === 1;
    }

    if (dataSourceEndpoint) {
        subs.push(computed(getAutocompleteSource));
    }

    if (Array.isArray(node.autocompleteSource)) {
        sourceArray = node.autocompleteSource;
        autocompleteSource(mapAutocompleteSource(node.autocompleteSource));
    }

    if (node.autocompleteSource && !Array.isArray(node.autocompleteSource)) {
        subs.push(computed(getAutocompleteSourceFromContext).extend({ deferred: true }));
    }

    if (!options.addNew) {
        validations = _lodash2.default.cloneDeep(options.validations) || {};
        if (!validations || !validations.autocomplete) {
            validations.autocomplete = {
                message: 'Please choose a valid selection from the options.',
                params: autocompleteSource
            };
        } else {
            validations.autocomplete = {
                message: validations.autocomplete.message || 'Please choose a valid selection from the options.',
                params: autocompleteSource
            };
        }
    }

    if (unique) {

        inputValue.subscribe(function (oldValue) {
            context.unique[node.id].remove(oldValue);
        }, null, 'beforeChange');
        inputValue.subscribe(function (newValue) {
            if (context.deleteFlag && context.deleteFlag()) {
                return;
            }
            context.unique[node.id].push(newValue);
        });

        if (context.deleteFlag) {
            context.deleteFlag.subscribe(function (deleted) {
                if (deleted) {
                    context.unique[node.id].remove(inputValue());
                }
            });
        }

        computedSource = computed({
            read: function read() {
                var selectedItems = _lodash2.default.difference(context.unique[node.id](), [inputValue()]).map(function (item) {
                    return {
                        value: item
                    };
                }),
                    newSource = _lodash2.default.differenceBy(autocompleteSource(), selectedItems, 'value');
                return newSource;
            },
            write: function write(newValues) {
                autocompleteSource(newValues);
            }
        }).extend({ deferred: true });
    }

    inputValue.subscribe(function (value) {
        if (value === 'new' && node.children) {
            var multi = createViewModels(node.children);
            // todo - this is very hardcoded, fix
            multi[0].isVisible(true);
            multi[0].mappedChildNodes[0].hasFocus && multi[0].mappedChildNodes[0].hasFocus(true);
            mappedChildNodes(multi);
        }
    });

    if (node.children) {
        subs.push(computed(function () {
            if (mappedChildNodes().length) {
                //todo - refactor this so that we arent making so many assumptions..?
                inputValue(itemMapper(mappedChildNodes()[0].getValue()).value);
            }
        }));
    }

    return {
        autocompleteSource: unique ? computedSource : autocompleteSource,
        mappedChildNodes: mappedChildNodes,
        getValue: node.children ? getValue : null,
        setValue: node.children ? setValue : null,
        validations: validations,
        validate: node.children ? validate : undefined,
        setReadonly: setReadonly,
        dispose: function dispose() {
            if (unique) {
                context.unique[node.id].remove(inputValue());
            }
        }
    };
};
//# sourceMappingURL=autocompleteViewModel.js.map