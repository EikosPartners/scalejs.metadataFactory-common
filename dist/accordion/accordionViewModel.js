'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (node, metadata) {
    var subs = [],
        createViewModels = _scalejs.createViewModels.bind(this),
        //ensures context is passed
    options = node.options || {},
        mappedChildNodes,
        sections,
        isShown = (0, _knockout.observable)(true);

    mappedChildNodes = createViewModels(node.children);

    sections = node.sections.map(function (section, index) {
        var visible = (0, _knockout.observable)(options.openByDefault === false ? false : true);
        return (0, _scalejs3.merge)(mappedChildNodes[index], {
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

    subs.push((0, _scalejs2.receive)(node.id + '.collapseAll', function (data) {
        setAllSectionVisibility(false);
    }));

    subs.push((0, _scalejs2.receive)(node.id + '.expandAll', function (data) {
        setAllSectionVisibility(true);
    }));

    return (0, _scalejs3.merge)(node, {
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

var _scalejs2 = require('scalejs.messagebus');

var _scalejs3 = require('scalejs');

;

/*
 * Responsible for combining sections with children
 * Sections contain the names of the headers
 * There is one child per section
 */

// TODO: add docs
/*global define, ko*/
//# sourceMappingURL=accordionViewModel.js.map