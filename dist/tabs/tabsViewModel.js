'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (node, metadata) {
    var context = this,
        createViewModel = _scalejs.createViewModel.bind(context),
        //ensures context is passed
    options = node.options || {},
        mappedChildNodes,
        activeTabRegion = (0, _knockout.observable)({}),
        initialized = false,
        subs = [],
        query = (0, _scalejs3.getCurrent)().query,
        tabs = [],
        initialActiveTab;

    // when tabs are selected update the tab route
    // do not update tabroute on initialization, just replace
    function setTabRoute(tabDef) {
        var currentRoute = (0, _scalejs3.getCurrent)().route + ((0, _scalejs3.getCurrent)().path ? '/' + (0, _scalejs3.getCurrent)().path : ''),
            query = (0, _scalejs3.getCurrent)().query;
        (0, _scalejs3.setRoute)(tabDef.target || currentRoute, (0, _scalejs6.merge)(query, tabDef.params), false, initialized);
        initialized = true;
    }

    // zip the children tabs with the tab defs
    node.children.forEach(function (tab, index) {
        var tabTemplate = (0, _knockout.observable)(),
            // can by dynamic because of ajax tabs
        tabDef = typeof node.headers[index] === 'string' ? { text: node.headers[index] } : node.headers[index],
            tabName = tabDef.computed ? (0, _knockout.computed)(function () {
            return (0, _utils.formatText)(tabDef.text, context.getValue);
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
                (0, _scalejs4.notify)(options.validations[tabDef.text], {
                    successCallback: function successCallback() {
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
        tabObj.isActive = (0, _knockout.computed)(function () {
            return activeTabRegion() === tabTemplate();
        });

        // create tabViewModel from type if defined
        // else call createViewModel
        if (tabTypes[tab.type]) {
            tabViewModel = tabTypes[tab.type].call(context, tabObj, tab);
        } else {
            tabViewModel = createViewModel(tab);
            tabTemplate((0, _scalejs2.template)('metadata_item_template', tabViewModel));
        }

        (0, _lodash.extend)(tabObj, tabViewModel);

        // visible expression binding using context' getValue
        if ((0, _scalejs6.has)(tabDef.visible)) {
            tabObj.visible = (0, _scalejs6.is)(tabDef.visible, 'boolean') ? tabDef.visible : (0, _knockout.computed)(function () {
                return (0, _scalejs5.evaluate)(tabDef.visible, context.getValue || function (id) {
                    console.error('Trying to evaluate a binding when getValue isnt specified on the context', tabObj);
                });
            });
        } else {
            tabObj.visible = true;
        }

        tabs.push(tabObj);

        // sets the active tab if defined in the query or tabDef
        if (tabDef.isActive || tabDef.params && query && (0, _utils.objectContains)(query, tabDef.params)) {
            initialActiveTab = tabObj;
        }
    });

    if (initialActiveTab) {
        initialActiveTab.setActiveTab();
    } else if (!activeTabRegion().template) {
        // initialize to first tab if we havent routed to a specific tab
        tabs[0].setActiveTab();
    }

    // receive events to set active tab
    if (node.id) {
        subs.push((0, _scalejs4.receive)(node.id + '.setActiveTab', function (params) {
            tabs.some(function (tab) {
                // if activeTab: 'x' is in both objects, set the active tab
                // and write this better..maybe use ids
                if ((0, _utils.objectContains)(params, tab.tabDef.params)) {
                    tab.setActiveTab((0, _scalejs6.merge)((0, _lodash.cloneDeep)(tab.tabDef), { params: params }));
                }
            });
        }));

        subs.push((0, _scalejs4.receive)(node.id + '.setNextTab', function () {
            var currentIndex = 0,
                newIndex;

            tabs.some(function (tab, index) {
                if (activeTabRegion() == tab.tabTemplate()) {
                    currentIndex = index;
                }
            });

            while (newIndex === undefined) {
                if (!tabs[(currentIndex + 1) % tabs.length].isChild) {
                    newIndex = currentIndex + 1;
                } else {
                    currentIndex++;
                }
            }

            tabs[newIndex].setActiveTab();
        }));
    }

    return (0, _scalejs6.merge)(node, {
        tabs: tabs,
        mappedChildNodes: tabs,
        activeTabRegion: activeTabRegion,
        context: this,
        dispose: function dispose() {
            subs.forEach(function (sub) {
                sub.dispose();
            });

            tabs.forEach(function (tab) {
                var tabViewModels = tab.tabTemplate() && tab.tabTemplate().template.data;
                // why is tab viewmodels an array, anyway?
                if (tabViewModels && !Array.isArray(tabViewModels)) {
                    tabViewModels = [tabViewModels];
                }
                (tabViewModels || []).forEach(function (vm) {
                    vm && vm.dispose && vm.dispose();
                });
            });
        }
    });
};

var _scalejs = require('scalejs.metadataFactory');

var _scalejs2 = require('scalejs.mvvm');

var _knockout = require('knockout');

var _scalejs3 = require('scalejs.navigation');

var _scalejs4 = require('scalejs.messagebus');

var _scalejs5 = require('scalejs.expression-jsep');

var _utils = require('utils');

var _lodash = require('lodash');

var _scalejs6 = require('scalejs');

var _dataservice = require('dataservice');

var _dataservice2 = _interopRequireDefault(_dataservice);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// tabsViewModel
// tabs displays clickable links that can be used to modify the contents of an active section
// there is one special tabType right now called ajax which will make a new ajax request when the tab is clicked
// otherwise the tab will be the mappedChildNodes
// todo: refactor tabObj/tabDef to be more clear?
var tabTypes = {
    ajax: ajax,
    route: route
};

function ajax(tabObj, tab) {
    var tabParams = tab.options && tab.options.params,
        setActiveTab = tabObj.setActiveTab,
        tabTemplate = tabObj.tabTemplate,
        mappedChildNodes = (0, _knockout.observableArray)(),
        context = this;

    // update everything when mapped child nodes changes
    tabObj.mappedChildNodes = mappedChildNodes;

    // override tab setActiveTab so that new ajax request is made for first load
    tabObj.setActiveTab = function (newRoute) {
        if (!tabTemplate() || !tabObj.keepCache) {
            if (tabTemplate()) {
                tabTemplate().template.data.forEach(function (node) {
                    // todo - call dispose on mapped child nodes of each node
                    if (node.dispose) {
                        node.dispose();
                    }
                });
            }
            _dataservice2.default.get({ uri: tab.ajax }, function (err, metadata) {
                if (err) {
                    console.error('there is an error', err);
                }

                try {
                    mappedChildNodes(_scalejs.createViewModels.call(context, Array.isArray(metadata) ? metadata : [metadata]));
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
    };
    // todo refactor to pass params
    if (tabParams) {
        tab.ajax = (0, _scalejs3.getCurrent)().query && (0, _scalejs3.getCurrent)().query[tabParams] ? tab.ajax + (0, _scalejs3.getCurrent)().query[tabParams] : tab.ajax;
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
        _scalejs.createViewModel.call(context, {
            type: 'action',
            actionType: 'route',
            options: {
                target: tab.route.target,
                params: (0, _scalejs6.merge)((0, _scalejs3.getCurrent)().query, tabObj.tabDef.params, tab.route.params)
            }
        }).action();
    };
    return tabObj;
}

;
//# sourceMappingURL=tabsViewModel.js.map