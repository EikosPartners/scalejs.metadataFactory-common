'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

require('datatables.net-fixedheader');

require('datatables.net-select');

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
            query: this.sendQuery,
            searching: clientSearch,
            select: {
                style: 'single',
                blurable: true,
                className: 'highlight',
                selectedItem: this.selectedItem
            }
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