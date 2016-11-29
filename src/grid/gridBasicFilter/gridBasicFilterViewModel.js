import { merge, has } from 'scalejs';
import ko from 'knockout';

export default function (node) {
    const context = this,
        options = node.options || {},
        placeholder = ko.observable(true),
        filterText = options.filterText || 'Filter';

    if (has(options.caseInsensitive)) {
        context.caseInsensitive(options.caseInsensitive);
    }

    context.search.subscribe((val) => {
        if (!val) {
            placeholder(true);
        }
    });

    return merge(node, {
        context,
        placeholder,
        filterText
    });
}