import { observable, observableArray, computed, unwrap } from 'knockout';
import { createViewModels as createViewModelsUnbound } from 'scalejs.metadataFactory';
import { evaluate } from 'scalejs.expression-jsep';
import { merge, has, is } from 'scalejs';
import dataservice from 'dataservice';
import _ from 'lodash';


//TODO: Refactor multi-input functionality out or to its own viewmodel

    export default function autocompleteViewModel(node, inputViewModel) {
        var context = this,
            dataSourceEndpoint = node.dataSourceEndpoint,
            keyMap = node.keyMap || {},
            createViewModels = createViewModelsUnbound.bind(this),
            // inputViewModel
            inputValue = inputViewModel.inputValue,
            subs = inputViewModel.subs,
            mapItem = inputViewModel.mapItem,
            hasFocus = inputViewModel.hasFocus,
            readonly = inputViewModel.readonly,
            isShown = inputViewModel.isShown,            
            autocompleteSource = inputViewModel.values, //todo: just use values
            // props
            sourceArray,
            validations,
            options = node.options || {},
            unique = options.unique,
            computedSource,
            itemMapper = mapItem(keyMap),
            objectValue,
            autocompleteSourceDef;
        
        if(node.autocompleteSource) {
            console.warn('[autocomplete] please move the autocompleteSource into options');
            autocompleteSourceDef = _.cloneDeep(node.autocompleteSource);
        } else {
            autocompleteSourceDef = _.cloneDeep(node.options && node.options.autocompleteSource)
        }

        function mapAutocompleteSource(source) {
            return source.map(function(src) {
                if (typeof src === 'string') {
                    return {
                        value: src,
                        label: src
                    }
                } else {
                    return src;
                }
            });
        }

        function getAutocompleteSource() {
            dataservice.ajax(dataSourceEndpoint, function(error, data) {
                if (error) {
                    console.error('Data retrieval failure', error);
                    return;
                }
                if (keyMap.dataKey) {
                    sourceArray  =  data[keyMap.dataKey];
                    // todo: update to use mapItem
                    var mappedData = data[keyMap.dataKey].map(function(d) {
                        return keyMap.textKey && keyMap.valueKey ?
                            {
                                label: (Array.isArray(keyMap.textKey) ? keyMap.textKey : [keyMap.textKey]).map(function(k) {
                                    return d[k];
                                }).join(keyMap.delimiter || ' / '),
                                value: d[keyMap.valueKey]
                            }
                            : d[node.id]; //todo: remove this and add mapping!
                    })
                    autocompleteSource(mapAutocompleteSource(_.uniqBy(mappedData, function(item) {
                            return item ?  has(item, 'value') ? item.value : item : '';
                    }).filter(Boolean))) // remove empty values
                } else {
                    sourceArray = data.SearchResults;
                    autocompleteSource(mapAutocompleteSource(data.SearchResults));
                }
            });
        }

        function getAutocompleteSourceFromContext() {
            var source = _.toArray(evaluate(autocompleteSourceDef.fromArray || [], context.getValue));

            // storing source array before any mapping
            sourceArray = source;
            if (Array.isArray(source)) {
                autocompleteSource(
                    _.uniqBy(
                        source
                            .map(itemMapper)
                            //todo: remove additional mapping - using binding options
                            .map(function(item) {
                                return {
                                    label: item.text,
                                    value: item.value,
                                    original: item.original
                                };
                            }),
                        function(item) {
                            return item.value;
                        }
                    )
                );
            }
        }

        // function setReadonly(bool) {
        //     readonly(bool);
        // }

        if (dataSourceEndpoint) {
            subs.push(computed(getAutocompleteSource));
        }

        if (Array.isArray(autocompleteSourceDef)) {
            sourceArray = autocompleteSourceDef;
            autocompleteSource(mapAutocompleteSource(autocompleteSourceDef));
        }

        if (autocompleteSourceDef && !Array.isArray(autocompleteSourceDef)) {
            subs.push(computed(getAutocompleteSourceFromContext).extend({ deferred: true }));
        }

        if (!options.addNew) {
            validations = _.cloneDeep(options.validations) || {};
            if (!validations || !validations.autocomplete ) {
                validations.autocomplete = {
                    message: 'Please choose a valid selection from the options.',
                    params: autocompleteSource
                }
            } else {
                validations.autocomplete = {
                    message: validations.autocomplete.message || 'Please choose a valid selection from the options.',
                    params: autocompleteSource
                }
            }
        }

        if (unique) {

            inputValue.subscribe(function (oldValue) {
                context.unique[node.id].remove(oldValue);
            }, null, 'beforeChange');
            inputValue.subscribe(function (newValue) {
                if(context.deleteFlag && context.deleteFlag()) { return; }
                context.unique[node.id].push(newValue);
            });

            if(context.deleteFlag) {
                context.deleteFlag.subscribe(function(deleted) {
                    if (deleted) {
                        context.unique[node.id].remove(inputValue());
                    }
                });
            }

            computedSource = computed({
                read: function () {
                    var selectedItems = _.difference(context.unique[node.id](), [inputValue()]).map(function (item) {
                            return {
                                value: item
                            };
                        }),
                        newSource = _.differenceBy(autocompleteSource(), selectedItems, 'value');
                    return newSource;
                },
                write: function (newValues) {
                    autocompleteSource(newValues);
                }
            }).extend({ deferred: true });
        }

        return {
            autocompleteSource: unique ? computedSource : autocompleteSource,
            validations,
            mappedChildNodes: observableArray(), // todo: still need?
            // setReadonly: setReadonly,
            dispose: () => {
                if(unique) {
                    context.unique[node.id].remove(inputValue());
                }
            }
        }
    };
