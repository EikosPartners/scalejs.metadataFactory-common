import { evaluate } from 'scalejs.expression-jsep';
import { notify } from 'scalejs.messagebus';
import 'datatables.net-fixedheader';
import 'datatables.net-select';
import 'datatables-epresponsive';
import registry from './registry/gridRegistry';
import ko from 'knockout';

export default {
    grid: function () {
        const options = this.options,
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
                registry,
                autoWidth: false
            };

        if (clientSearch) {
            gridSettings.clientSearch = {
                basicSearch: this.search,
                advancedSearch: this.filters,
                caseInsen
            };
            gridSettings.ordering = true;
        }

        return {
            css: this.gridClasses,
            dataTables: gridSettings
        };
    },
    'grid-loader': function () {
        const styles = this.loader.inProgress() ? 'active' : '';
        return {
            css: styles
        };
    },
    'grid-footer': function () {
        return {
            if: this.footer && this.loader.visible(),
            css: {
                hide: !(ko.unwrap(this.loader.visible))
            }
        };
    },
    'grid-display': function () {
        const display = this.options.gridDisplay,
            ctx = this,
            visible = display === undefined ? true :
            evaluate(display, id => ctx[id]);
        return {
            css: {
                hide: !visible
            }
        };
    },
    'grid-header': function () {
        const filter = (this.gridHeaderItems || []).filter(item => item && item.filterIsVisible)[0];
        return {
            css: {
                hide: !this.gridHeaderItems.length,
                visibleFilter: filter && filter.filterIsVisible,
                // only apply grid header classes if they are defined
                [this.gridHeaderClasses]: this.gridHeaderClasses
            }
        };
    },
    'grid-wrapper': function () {
        // TODO: move to templates, too specific
        const filter = (this.gridHeaderItems || []).filter(item => item && item.filterIsVisible)[0];
        return {
            css: {
                [this.classes]: this.classes,
                visibleFilter: filter && filter.filterIsVisible
            }
        };
    },
    'grid-expanded': function (ctx) {
        if (!this.data) {
            return;
        }

        let metadata = ctx.$parent.options.hasChildren.children,
            DEFAULT_KEY_MAP = {
                resultsKey: 'data',
                childDataKey: 'childData'
            },
            keyMap = ctx.$parent.dataSourceEndpoint ? _.merge(ctx.$parent.dataSourceEndpoint.keyMap, DEFAULT_KEY_MAP) : DEFAULT_KEY_MAP,
            parentContext = ctx.$parents.filter(x => x.context)[0],
            newContext = {
                metadata: metadata,
                parentContext: parentContext.context,
                data: {
                    [keyMap.resultsKey]: this.data
                },
                getValue: function (id) {
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
