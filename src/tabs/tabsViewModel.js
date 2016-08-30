import { createViewModel, createViewModels, createViewModel as createViewModelUnbound } from 'scalejs.metadataFactory';
import { registerTemplates, registerBindings, template } from 'scalejs.mvvm';
import { observable, observableArray, computed, unwrap } from 'knockout';
import { getCurrent, setRoute } from 'scalejs.navigation';
import { receive, notify } from 'scalejs.messagebus';
import { evaluate } from 'scalejs.expression-jsep';
import { objectContains, formatText } from './tabUtils';
import { extend, cloneDeep } from 'lodash';
import { is, has, merge } from 'scalejs';
import dataservice from 'dataservice';

    // tabsViewModel
    // tabs displays clickable links that can be used to modify the contents of an active section
    // there is one special tabType right now called ajax which will make a new ajax request when the tab is clicked
    // otherwise the tab will be the mappedChildNodes
    // todo: refactor tabObj/tabDef to be more clear?
    var tabTypes = {
        ajax: ajax,
        route: route,
        lazy: lazy
    };

    function disposeNodes(nodes) {
        unwrap(nodes).forEach(node => {
            node.dispose && node.dispose();
            disposeNodes(node.mappedChildNodes || []);
        });
    }

    function lazy(tabObj, tab) {
        var mappedChildNodes = observableArray(),
            setActiveTab = tabObj.setActiveTab,
            tabTemplate = tabObj.tabTemplate,
            context = this;
        
        tabObj.mappedChildNodes = mappedChildNodes;

        tabObj.setActiveTab = function (newRoute) {
            if (!mappedChildNodes().length || !tabObj.keepCache) {
                if (mappedChildNodes().length) {
                    disposeNodes(mappedChildNodes());
                }
                mappedChildNodes(createViewModels.call(context, tab.children));
                tabTemplate({
                    template: {
                        name: 'metadata_items_template',
                        data: mappedChildNodes()
                    },
                    tabObj: tabObj
                });
                setActiveTab(newRoute);
            } else {
                setActiveTab(newRoute);
            }
        };

        return tabObj;
    }

    function ajax(tabObj, tab) {
        var tabParams = tab.options && tab.options.params,
            setActiveTab = tabObj.setActiveTab,
            tabTemplate = tabObj.tabTemplate,
            mappedChildNodes = observableArray(),
            context = this;

        // update everything when mapped child nodes changes
        tabObj.mappedChildNodes = mappedChildNodes;

        // override tab setActiveTab so that new ajax request is made for first load
        tabObj.setActiveTab = function(newRoute) {
            if (!tabTemplate() || !tabObj.keepCache) {
                if(tabTemplate()) {
                    tabTemplate().template.data.forEach(function (node) {
                        // todo - call dispose on mapped child nodes of each node
                        if (node.dispose) {
                            node.dispose();
                        }
                    });
                }
                dataservice.get({uri:tab.ajax}, function (err, metadata) {
                    if (err) {
                        console.error('there is an error',err);
                    }

                    try {
                        mappedChildNodes(createViewModels.call(context, Array.isArray(metadata) ? metadata : [metadata]));
                    } catch (err) {
                        console.error(err);
                    }


                    // need to pass tabObj to the activeTabRegion to be able to code dynamic logic in custom binding
                    tabTemplate({
                        template: {
                            name: 'metadata_items_template',
                            data: mappedChildNodes()
                        },
                        tabObj: tabObj
                    });
                    setActiveTab(newRoute);
                });
            } else {
                setActiveTab(newRoute);
            }
        }
        // todo refactor to pass params
        if (tabParams) {
            tab.ajax = getCurrent().query && getCurrent().query[tabParams] ? tab.ajax + getCurrent().query[tabParams] : tab.ajax;
        }

        return tabObj;
    }

    // tabObj - the ViewModel for the tab itself (not the contents)
    // tab - the definition of the Tab contents
    function route(tabObj, tab) {
        var context = this; // want to pass context incase it has data

        // override tab setActiveTab so that a route is performed
        tabObj.setActiveTab = function () {
            // merge the params from route with current query as not to overwrite it
            // also merge with the tabObj.tabDef.params so that the tab initializes correctly
            // for the objectContains check below, if the tabDef.params is part of the query it will use that tab as the initial tab
            // so we need to make sure, that if we're setting a tabRoute, that the params of the last tab are overwriten with the params in the current tab
            // so you dont get another route accidentally
            createViewModel.call(context, {
                type: 'action',
                actionType: 'route',
                options: {
                    target: tab.route.target,
                    params: merge(
                        getCurrent().query,
                        tabObj.tabDef.params,
                        tab.route.params
                    )
                }
            }).action();
        }
        return tabObj;
    }

    export default function (node, metadata) {
        var context = this,
            createViewModel = createViewModelUnbound.bind(context), //ensures context is passed
            options = node.options || {},
            mappedChildNodes,
            activeTabRegion = observable({}),
            initialized = false,
            subs = [],
            query = getCurrent().query,
            tabs = [],
            initialActiveTab;

        // when tabs are selected update the tab route
        // do not update tabroute on initialization, just replace
        function setTabRoute(tabDef) {
            var currentRoute = getCurrent().route + (getCurrent().path ? '/' + getCurrent().path : '' ),
                query = getCurrent().query;
            setRoute(tabDef.target || currentRoute, merge(query,tabDef.params), false, initialized);
            initialized = true;
        }

        // zip the children tabs with the tab defs
        node.children.forEach(function (tab, index) {
            var tabTemplate = observable(), // can by dynamic because of ajax tabs
                tabDef = typeof node.headers[index] === 'string' ? { text: node.headers[index] } : node.headers[index],
                tabName = tabDef.computed ? computed(function () {
                    return formatText(tabDef.text, context.getValue);
                }) : tabDef.text,
                tabObj = {
                    tabName: tabName,
                    tabDef: tabDef,
                    tabTemplate: tabTemplate,
                    keepCache: tab.cache || node.cache
                },
                tabViewModel;

           // sets the active tab region to the tab template
           // sets newRoute if defined, else sets tabRoute
           tabObj.setActiveTab = function (newRoute) {
               if (options.validations && options.validations[tabDef.text]) {
                   notify(options.validations[tabDef.text], {
                       successCallback: function() {
                           activeTabRegion(tabTemplate());
                           setTabRoute(newRoute || tabDef);
                       }
                   });
               } else {
                    activeTabRegion(tabTemplate());
                    setTabRoute(newRoute || tabDef);
               }
           };

           // tab is active when the active region is the template
           tabObj.isActive = computed(function () {
                return activeTabRegion() === tabTemplate();
            });

            // create tabViewModel from type if defined
            // else call createViewModel
            if (tabTypes[tab.type]) {
                tabViewModel = tabTypes[tab.type].call(context, tabObj, tab)
            } else {
                tabViewModel = createViewModel(tab)
                tabTemplate(template('metadata_item_template', tabViewModel));
            }

            extend(tabObj, tabViewModel);

            // visible expression binding using context' getValue
            if(has(tabDef.visible)) {
                tabObj.visible = is(tabDef.visible, 'boolean') ?
                    tabDef.visible
                    : computed(function() {
                        return evaluate(tabDef.visible, context.getValue || function (id) {
                            console.error('Trying to evaluate a binding when getValue isnt specified on the context', tabObj);
                        });
                    });
            } else {
                tabObj.visible = true;
            }

            tabs.push(tabObj);

            // sets the active tab if defined in the query or tabDef
            if(tabDef.isActive || tabDef.params && query && objectContains(query, tabDef.params)) {
                initialActiveTab = tabObj;
            }
        });

        if (initialActiveTab) {
            initialActiveTab.setActiveTab();
        } else if (!activeTabRegion().template) {
            // initialize to first tab if we havent routed to a specific tab
            
            // will set first visible tab to active tab
            let initialTab = tabs.filter((tab) => {
                return unwrap(tab.visible);
            })[0];

            initialTab && initialTab.setActiveTab();
        }

        // receive events to set active tab
        if(node.id) {
            subs.push(receive(node.id +'.setActiveTab', function (params) {
                tabs.some(function(tab) {
                    // if activeTab: 'x' is in both objects, set the active tab
                    // and write this better..maybe use ids
                    if(objectContains(params, tab.tabDef.params)) {
                        tab.setActiveTab(merge(cloneDeep(tab.tabDef), { params: params }));
                    }
                });
            }));

            subs.push(receive(node.id+'.setNextTab', function () {
                var currentIndex =  0,
                    newIndex;

                tabs.some(function(tab, index) {
                    if (activeTabRegion() == tab.tabTemplate()) {
                        currentIndex = index;
                    }
                })

                while(newIndex === undefined) {
                    if (!tabs[(currentIndex+1) % tabs.length].isChild) {
                        newIndex = currentIndex +1;
                    } else {
                        currentIndex++
                    }
                }

                tabs[newIndex].setActiveTab();
            }));
        }

        return merge(node, {
            tabs: tabs,
            mappedChildNodes: tabs,
            activeTabRegion: activeTabRegion,
            context: this,
            dispose: function () {
                subs.forEach(function (sub) {
                    sub.dispose();
                });

                tabs.forEach(function (tab) {
                    var tabViewModels = tab.tabTemplate() && tab.tabTemplate().template.data;
                    // why is tab viewmodels an array, anyway?
                    if (tabViewModels && !Array.isArray(tabViewModels)) {
                        tabViewModels = [tabViewModels];
                    }
                    (tabViewModels || []).forEach(function(vm) {
                        vm && vm.dispose && vm.dispose();
                    });
                });
            }
        });
    };
