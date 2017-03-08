'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _scalejs = require('scalejs.expression-jsep');

require('datatables.net-fixedheader');

require('datatables.net-select');

require('datatables.net-responsive');

var _gridRegistry = require('./registry/gridRegistry');

var _gridRegistry2 = _interopRequireDefault(_gridRegistry);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

exports.default = {
    grid: function grid() {
        var options = this.options,
            clientSearch = options.clientSearch,
            caseInsen = this.caseInsensitive,
            gridSettings = {
            dom: 't',
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
            registry: _gridRegistry2.default
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
                hide: !ko.unwrap(this.loader.visible)
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
    }
};
//# sourceMappingURL=gridBindings.js.map