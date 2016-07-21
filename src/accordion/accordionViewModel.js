/*global define, ko*/
import { createViewModels as createViewModelsUnbound } from 'scalejs.metadataFactory';
import { unwrap, computed, observable } from 'knockout';
import { receive } from 'scalejs.messagebus';
import { merge } from 'scalejs';


    /*
     * Responsible for combining sections with children
     * Sections contain the names of the headers
     * There is one child per section
     */

    // TODO: add docs
    export default function (node, metadata) {
        var subs = [],
            createViewModels = createViewModelsUnbound.bind(this), //ensures context is passed
            options = node.options || {},
            mappedChildNodes,
            sections,
            isShown = observable(true);

        mappedChildNodes = createViewModels(node.children);

    
        sections = node.sections.map(function (section, index) {
            var visible = observable(options.openByDefault === false ? false : true);
            return merge(mappedChildNodes[index], {
                header: section,
                visible: visible,
                toggleVisibility: function () {
                    if(!visible() && options && options.trueAccordion){
                        setAllSectionVisibility(false);
                    }
                    visible(!visible());
                }
            });
        });

        function setAllSectionVisibility(visiblity) {
            sections.forEach(function(section) {
               section.visible(visiblity);
            });
        }

        subs.push(receive(node.id + '.collapseAll', function(data) {
            setAllSectionVisibility(false);
        }));

        subs.push(receive(node.id + '.expandAll', function(data) {
            setAllSectionVisibility(true);
        }));

        return merge(node, {
            isShown: isShown,
            sections: sections,
            mappedChildNodes: mappedChildNodes,
            setAllSectionVisibility: setAllSectionVisibility,
            dispose: function () {
                subs.forEach(function(sub) {
                    sub.dispose();
                })
            }
        });
    };
