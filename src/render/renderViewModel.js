import { createViewModels } from 'scalejs.metadataFactory';
import { observableArray, unwrap } from 'knockout';
import { receive } from 'scalejs.messagebus';
import { merge, get } from 'scalejs';
import _ from 'lodash';

/**
 * Render: a viewless component to conditionally render pjson components
 * @module render
 *
 * @param {object} node
 *  The configuration object for the module
 * @param {string} node.type='render'
 *  The type of the node is render
 * @param {string} node.id
 *  The channel to set up the receiver for
 *
 * @example
 * {
 *      "type": "render",
 *      "id": "my_grid"
 */
export default function (node) {
    const context = _.cloneDeep(this),
        mappedChildNodes = observableArray(),
        render = receive(`${node.id}.render`, (options) => {
            let children = options.data;
            if (options.keyMap) {
                children = get(options, options.keyMap.resultsKey);
            }
            children = Array.isArray(children) ? children : [children];

            if (mappedChildNodes()) {
                dispose(mappedChildNodes());
            }
            mappedChildNodes(createViewModels.call(context, children));
        });

    function dispose(nodes) {
        nodes.forEach((n) => {
            n.dispose && n.dispose();
            dispose(unwrap(n.mappedChildNodes) || []);
        });
    }

    return merge(node, {
        mappedChildNodes,
        dispose() {
            render.dispose();
        }
    });
}