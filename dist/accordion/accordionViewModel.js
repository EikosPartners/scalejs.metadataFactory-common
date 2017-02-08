'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (node) {
    var context = this,
        subs = [],
        createViewModels = _scalejs.createViewModels.bind(this),
        // ensures context is passed
    options = node.options || {},
        mappedChildNodes = (0, _knockout.observableArray)(),
        isShown = (0, _knockout.observable)(true),
        children = createViewModels(node.children);

    var sections = null;

    mappedChildNodes(children);

    sections = node.sections.map(function (section, index) {
        var visible = (0, _knockout.observable)(options.openByDefault !== false);
        return (0, _scalejs4.merge)(children[index], {
            header: section,
            visible: visible,
            toggleVisibility: function toggleVisibility() {
                if (!visible() && options && options.trueAccordion) {
                    setAllSectionVisibility(false);
                }
                visible(!visible());
            }
        });
    });

    function setAllSectionVisibility(visiblity) {
        sections.forEach(function (section) {
            section.visible(visiblity);
        });
    }

    subs.push((0, _scalejs3.receive)(node.id + '.collapseAll', function () {
        setAllSectionVisibility(false);
    }));

    subs.push((0, _scalejs3.receive)(node.id + '.expandAll', function () {
        setAllSectionVisibility(true);
    }));

    if (node.rendered) {
        subs.push((0, _knockout.computed)(function () {
            var rendered = (0, _scalejs2.evaluate)(node.rendered, context.getValue);
            mappedChildNodes(rendered ? children : []);
        }));
    }

    return (0, _scalejs4.merge)(node, {
        isShown: isShown,
        sections: sections,
        mappedChildNodes: mappedChildNodes,
        setAllSectionVisibility: setAllSectionVisibility,
        dispose: function dispose() {
            subs.forEach(function (sub) {
                sub.dispose();
            });
        }
    });
};

var _scalejs = require('scalejs.metadataFactory');

var _knockout = require('knockout');

var _scalejs2 = require('scalejs.expression-jsep');

var _scalejs3 = require('scalejs.messagebus');

var _scalejs4 = require('scalejs');
//# sourceMappingURL=accordionViewModel.js.map