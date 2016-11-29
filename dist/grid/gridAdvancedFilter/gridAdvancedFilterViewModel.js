'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (node) {
    var context = this,
        id = node.id,
        options = node.options || {},
        advancedFilter = _scalejs.createViewModel.call(context, node.filter),
        filterData = advancedFilter.context.data,
        // todo: review
    filterDict = advancedFilter.context.dictionary,
        filterIsVisible = _knockout2.default.observable(false),
        filterText = options.filterText || 'Advanced',
        subs = [];

    if ((0, _scalejs3.has)(options.caseInsensitive)) {
        context.caseInsensitive(options.caseInsensitive);
    }

    function setupReceiveFilter() {
        subs.push((0, _scalejs2.receive)(node.id + '.filter', function () {
            var query = {},
                filters = filterData();

            Object.keys(filters).forEach(function (key) {
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
        subs.push((0, _scalejs2.receive)(node.id + '.clear', function () {
            var filters = filterData();
            Object.keys(filters).forEach(function (filter) {
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
        subs.forEach(function (sub) {
            sub.dispose();
        });
    }

    setupReceiveFilter();
    setupClearFilter();

    return (0, _scalejs3.merge)(node, {
        id: id,
        context: context,
        dispose: dispose,
        advancedFilter: advancedFilter,
        filterIsVisible: filterIsVisible,
        filterText: filterText
    });
};

var _scalejs = require('scalejs.metadataFactory');

var _scalejs2 = require('scalejs.messagebus');

var _scalejs3 = require('scalejs');

var _knockout = require('knockout');

var _knockout2 = _interopRequireDefault(_knockout);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
//# sourceMappingURL=gridAdvancedFilterViewModel.js.map