'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = function (node) {
    var keyMap = node.keyMap || {},
        context = this,
        base = _scalejs.createViewModel.call(this, (0, _scalejs3.merge)(node, { type: 'template' })),
        mappedChildNodes = (0, _knockout.observableArray)(),
        accordion;

    function mapToAccordion(data) {
        if (!data.sections) {
            return {
                "type": "template",
                "template": "empty_panel"
            };
        }

        var zipped = data.sections.map(function (section) {
            return [section.title, mapToAccordion(section)];
        }),
            _$unzip = _lodash2.default.unzip(zipped),
            _$unzip2 = _slicedToArray(_$unzip, 2),
            sections = _$unzip2[0],
            children = _$unzip2[1];


        return {
            type: 'accordion',
            isShown: (0, _knockout.observable)(true),
            // keep all menu items "closed" by default
            // only allow one open menu at a time
            options: {
                trueAccordion: true,
                openByDefault: false
            },
            template: 'menu_accordion',
            sections: sections,
            children: children
        };
    }

    function mapWorkflow(data) {
        var workflow = (0, _scalejs3.get)(data, keyMap.resultsKey || '', data);
        // data will be converted to metadata in order to render accordions
        accordion = _scalejs.createViewModel.call(context, mapToAccordion(workflow));
        mappedChildNodes([accordion]);

        if (!workflow.openPanel) {
            openFirst(accordion);
        }
    }

    function openFirst(accordion) {
        var firstSection = accordion.sections && accordion.sections[0];
        if (!firstSection) {
            return; // all done opening accordions
        }
        firstSection.visible(true);
        openFirst(firstSection);
    }

    if (node.data) {
        // data loaded synchronously 
        mapWorkflow(base.data());
    } else if (node.dataSourceEndpoint) {
        // data loaded asynchronously
        base.data.subscribe(function (data) {
            mapWorkflow(data);
        });
    }

    return (0, _scalejs3.merge)(node, {
        mappedChildNodes: mappedChildNodes
    });
};

var _scalejs = require('scalejs.metadataFactory');

var _knockout = require('knockout');

var _scalejs2 = require('scalejs.messagebus');

var _scalejs3 = require('scalejs');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

;
//# sourceMappingURL=menuViewModel.js.map