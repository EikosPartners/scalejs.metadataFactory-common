'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

require('datatables.net-fixedheader');

require('datatables.net-select');

var _gridRegistry = require('./registry/gridRegistry');

var _gridRegistry2 = _interopRequireDefault(_gridRegistry);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
            hasChildren: options.hasChildren,
            query: this.sendQuery,
            searching: clientSearch,
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
        }

        return {
            css: this.classes,
            dataTables: gridSettings
        };
    },
    'grid-loader': function gridLoader() {
        var styles = this.loader.inProgress() ? 'active' : '';
        return {
            css: styles
        };
    }
};
//# sourceMappingURL=gridBindings.js.map