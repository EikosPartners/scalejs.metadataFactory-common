import { createViewModels as createViewModelsUnbound } from 'scalejs.metadataFactory';
import { unwrap, computed, observable, observableArray } from 'knockout';
import { evaluate } from 'scalejs.expression-jsep';
import { receive } from 'scalejs.messagebus';
import { merge } from 'scalejs';


    /*
     * Responsible for combining sections with children
     * Sections contain the names of the headers
     * There is one child per section
     */

    // TODO: add docs
export default function (node) {
    const context = this,
        subs = [],
        createViewModels = createViewModelsUnbound.bind(this), // ensures context is passed
        options = node.options || {},
        mappedChildNodes = observableArray(),
        isShown = observable(true),
        children = createViewModels(node.children);

    let sections = null;

    mappedChildNodes(children);


    sections = node.sections.map((section, index) => {
        const visible = observable(options.openByDefault !== false);
        return merge(children[index], {
            header: section,
            visible: visible,
            toggleVisibility: function () {
                if (!visible() && options && options.trueAccordion) {
                    setAllSectionVisibility(false);
                }
                visible(!visible());
            }
        });
    });

    function setAllSectionVisibility(visiblity) {
        sections.forEach((section) => {
            section.visible(visiblity);
        });
    }

    subs.push(receive(`${node.id}.collapseAll`, () => {
        setAllSectionVisibility(false);
    }));

    subs.push(receive(`${node.id}.expandAll`, () => {
        setAllSectionVisibility(true);
    }));

    if (node.rendered) {
        subs.push(computed(() => {
            const rendered = evaluate(node.rendered, context.getValue);
            mappedChildNodes(rendered ? children : []);
        }));
    }

    return merge(node, {
        isShown: isShown,
        sections: sections,
        mappedChildNodes: mappedChildNodes,
        setAllSectionVisibility: setAllSectionVisibility,
        dispose: function () {
            subs.forEach((sub) => {
                sub.dispose();
            });
        }
    });
}