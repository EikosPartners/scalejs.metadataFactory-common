'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _scalejs = require('scalejs.expression-jsep');

var _scalejs2 = require('scalejs.messagebus');

require('datatables.net-fixedheader');

require('datatables.net-select');

require('datatables-epresponsive');

var _gridRegistry = require('./registry/gridRegistry');

var _gridRegistry2 = _interopRequireDefault(_gridRegistry);

var _knockout = require('knockout');

var _knockout2 = _interopRequireDefault(_knockout);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

exports.default = {
    grid: function grid() {
        var options = this.options,
            clientSearch = options.clientSearch,
            caseInsen = this.caseInsensitive,
            gridSettings = {
            dom: 'tR',
            rows: this.rows,
            columns: this.columns,
            data: this.data,
            paging: false,
            fixedHeader: options.fixedHeader,
            infiniteScroll: options.infinite,
            scrollElement: options.scrollElement,
            hasChildren: options.hasChildren,
            query: this.sendQuery,
            searching: clientSearch,
            ordering: false,
            sort: this.sort,
            responsive: true, // todo: get this working
            select: {
                style: 'single',
                blurable: true,
                items: 'cell',
                className: 'highlight',
                selectedItem: this.selectedItem
            },
            registry: _gridRegistry2.default,
            autoWidth: false
        };

        if (clientSearch) {
            gridSettings.clientSearch = {
                basicSearch: this.search,
                advancedSearch: this.filters,
                caseInsen: caseInsen
            };
            gridSettings.ordering = true;
        }

        return {
            css: this.gridClasses,
            dataTables: gridSettings
        };
    },
    'grid-loader': function gridLoader() {
        var styles = this.loader.inProgress() ? 'active' : '';
        return {
            css: styles
        };
    },
    'grid-footer': function gridFooter() {
        return {
            if: this.footer && this.loader.visible(),
            css: {
                hide: !_knockout2.default.unwrap(this.loader.visible)
            }
        };
    },
    'grid-display': function gridDisplay() {
        var display = this.options.gridDisplay,
            ctx = this,
            visible = display === undefined ? true : (0, _scalejs.evaluate)(display, function (id) {
            return ctx[id];
        });
        return {
            css: {
                hide: !visible
            }
        };
    },
    'grid-header': function gridHeader() {
        var filter = (this.gridHeaderItems || []).filter(function (item) {
            return item && item.filterIsVisible;
        })[0];
        return {
            css: _defineProperty({
                hide: !this.gridHeaderItems.length,
                visibleFilter: filter && filter.filterIsVisible
            }, this.gridHeaderClasses, this.gridHeaderClasses)
        };
    },
    'grid-wrapper': function gridWrapper() {
        var _css2;

        // TODO: move to templates, too specific
        var filter = (this.gridHeaderItems || []).filter(function (item) {
            return item && item.filterIsVisible;
        })[0];
        return {
            css: (_css2 = {}, _defineProperty(_css2, this.classes, this.classes), _defineProperty(_css2, 'visibleFilter', filter && filter.filterIsVisible), _css2)
        };
    },
    'grid-expanded': function gridExpanded(ctx) {
        if (!this.data) {
            return;
        }

        var metadata = ctx.$parent.options.hasChildren.children,
            DEFAULT_KEY_MAP = {
            resultsKey: 'data',
            childDataKey: 'childData'
        },
            keyMap = ctx.$parent.dataSourceEndpoint ? _.merge(ctx.$parent.dataSourceEndpoint.keyMap, DEFAULT_KEY_MAP) : DEFAULT_KEY_MAP,
            parentContext = ctx.$parents.filter(function (x) {
            return x.context;
        })[0],
            newContext = {
            metadata: metadata,
            parentContext: parentContext.context,
            data: _defineProperty({}, keyMap.resultsKey, this.data),
            getValue: function getValue(id) {
                if (id === 'row') {
                    return row;
                }

                return parentContext.context.getValue(id);
            }
        };

        // If there is a dataSourceEndpoint, give it the row data for mustache rendering if necessary
        if (metadata[0].dataSourceEndpoint) {
            metadata[0].dataSourceEndpoint.data = this.data;
        }

        metadata[0].data = this.data[keyMap.childDataKey];

        return {
            metadataFactory: {
                metadata: metadata,
                context: newContext
            }
        };
    }
};
//# sourceMappingURL=gridBindings.js.map