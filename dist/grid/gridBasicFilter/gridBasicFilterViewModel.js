'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (node) {
    var context = this,
        options = node.options || {},
        placeholder = _knockout2.default.observable(true),
        filterText = options.filterText || 'Filter';

    if ((0, _scalejs.has)(options.caseInsensitive)) {
        context.caseInsensitive(options.caseInsensitive);
    }

    context.search.subscribe(function (val) {
        if (!val) {
            placeholder(true);
        }
    });

    return (0, _scalejs.merge)(node, {
        context: context,
        placeholder: placeholder,
        filterText: filterText
    });
};

var _scalejs = require('scalejs');

var _knockout = require('knockout');

var _knockout2 = _interopRequireDefault(_knockout);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
//# sourceMappingURL=gridBasicFilterViewModel.js.map