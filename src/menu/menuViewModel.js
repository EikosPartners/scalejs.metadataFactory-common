import { createViewModels, createViewModel } from 'scalejs.metadataFactory';
import { unwrap, computed, observable, observableArray } from 'knockout';
import { receive } from 'scalejs.messagebus';
import { merge, get } from 'scalejs';
import _ from 'lodash';

    export default function (node) {
        var keyMap = node.keyMap || {},
            context = this,
            base = createViewModel.call(this, merge(node, { type: 'template' })),
            mappedChildNodes = observableArray(),
            accordion;

        function mapToAccordion(data) {
            if (!data.sections) {
                return {
                    "type": "template",
                    "template": "empty_panel",
                }
            }

            let zipped = data.sections.map(section => {
                    return [
                        section.title,
                        mapToAccordion(section)
                    ]
                }),
                [sections, children] = _.unzip(zipped);
            
            return {
                type: 'accordion',
                isShown: observable(true),
                // keep all menu items "closed" by default
                // only allow one open menu at a time
                options: {
                    trueAccordion: true,
                    openByDefault: false
                },
                template: 'menu_accordion',
                sections,
                children
            }
        }

        function mapWorkflow(data) {
            var workflow = get(data, keyMap.resultsKey || '', data);
            // data will be converted to metadata in order to render accordions
            accordion = createViewModel.call(context, mapToAccordion(workflow))
            mappedChildNodes([accordion]);
            
            if (!workflow.openPanel) {
                openFirst(accordion);
            }
        }        

        function openFirst(accordion) {
            let firstSection = accordion.sections && accordion.sections[0];
            if(!firstSection) {
                return; // all done opening accordions
            }
            firstSection.visible(true);
            openFirst(firstSection);
        }

        if(node.data) {            
            // data loaded synchronously 
            mapWorkflow(base.data());
        } else if (node.dataSourceEndpoint) {
            // data loaded asynchronously
            base.data.subscribe(data => {
                mapWorkflow(data);
            });
        }
        
        return merge(node, {
            mappedChildNodes
        });
    };
