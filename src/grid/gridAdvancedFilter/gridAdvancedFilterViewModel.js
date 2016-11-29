import { createViewModel } from 'scalejs.metadataFactory';
import { receive } from 'scalejs.messagebus';
import { merge, has } from 'scalejs';
import ko from 'knockout';

export default function (node) {
    const context = this,
        id = node.id,
        options = node.options || {},
        advancedFilter = createViewModel.call(context, node.filter),
        filterData = advancedFilter.context.data, // todo: review
        filterDict = advancedFilter.context.dictionary,
        filterIsVisible = ko.observable(false),
        filterText = options.filterText || 'Advanced',
        subs = [];

    if (has(options.caseInsensitive)) {
        context.caseInsensitive(options.caseInsensitive);
    }

    function setupReceiveFilter() {
        subs.push(receive(`${node.id}.filter`, () => {
            const query = {},
                filters = filterData();

            Object.keys(filters).forEach((key) => {
                if (filters[key]) {
                    if (filterDict()[key].inputType === 'datepicker') {
                        query[key] = {};
                        query[key].value = filters[key];
                        query[key].date = true;
                    } else {
                        query[key] = filters[key];
                    }
                }
            });
            context.skip(0);
            context.filters(query);
            filterIsVisible(false);
            if (!context.clientSearch) {
                context.rows.removeAll();
            }
        }));
    }

    function setupClearFilter() {
        subs.push(receive(`${node.id}.clear`, () => {
            const filters = filterData();
            Object.keys(filters).forEach((filter) => {
                if (filters[filter]) {
                    filterDict()[filter].setValue('');
                }
            });
            context.skip(0);
            context.search('');
            context.filters({});
            filterIsVisible(false);
            if (!context.clientSearch) {
                context.rows.removeAll();
            }
        }));
    }

    function dispose() {
        subs.forEach((sub) => {
            sub.dispose();
        });
    }

    setupReceiveFilter();
    setupClearFilter();

    return merge(node, {
        id,
        context,
        dispose,
        advancedFilter,
        filterIsVisible,
        filterText
    });
}