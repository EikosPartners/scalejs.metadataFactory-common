'use strict';

var _scalejs = require('scalejs.metadataFactory');

var _actionModule = require('../actionModule');

/**
 * Series action to perform a set of actions synchronously
 *
 * @module series
 *
 * @param {object} node
 *  The configuration object for the series action
 * @param {string} node.type='action'
 *  The type of the node is action
 * @param {string} node.actionType='series',
 *  The actionType of the node is series
 * @param {string} node.text
 *  The text to display on the button
 * @param {object} node.options
 *  The options pertaining to the series action
 * @param {array} node.options.actions
 *  Array of actions to perform synchronously
 *
 * @example
 *  {
 *        "type": "action",
 *        "actionType": "series",
 *        "text": "Start Actions",
 *        "options": {
 *            "actions": [
 *                 {
 *                    "type": "action",
 *                    "actionType": "route",
 *                    "text": "Add User",
 *                    "options": {
 *                        "target": "add-user"
 *                    }
 *                 },
 *                 {
 *                    "type": "action",
 *                    "actionType": "event",
 *                    "options": {
 *                        "target": "my_grid.add",
 *                        "params": [
 *                            {
 *                                "name": "{{request.name}}",
 *                                "endpoint": "{{request.uri}}",
 *                                "status": "{{status}}"
 *                            }
 *                        ],
 *                        "useOptions": true
 *                    }
 *                }
 *            ]
 *        }
 *    }
 */
function series(options, args) {
    var context = this;
    (options.actions || []).forEach(function (action) {
        _scalejs.createViewModel.call(context, action).action(args);
    });
}

(0, _actionModule.registerActions)({ series: series });
//# sourceMappingURL=series.js.map