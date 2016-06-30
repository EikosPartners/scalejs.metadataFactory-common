'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getRegisteredActions = exports.registerActions = undefined;

var _lodash = require('lodash');

var _scalejs = require('scalejs.mvvm');

var _scalejs2 = require('scalejs.metadataFactory');

var _actionViewModel = require('./actionViewModel');

var _actionViewModel2 = _interopRequireDefault(_actionViewModel);

var _actionBindings = require('./actionBindings');

var _actionBindings2 = _interopRequireDefault(_actionBindings);

var _action = require('./action.html');

var _action2 = _interopRequireDefault(_action);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var registeredActions = {};

function registerActions(actions) {
    (0, _lodash.extend)(registeredActions, actions);
}

function getRegisteredActions() {
    return registeredActions;
}

(0, _scalejs.registerBindings)(_actionBindings2.default);
(0, _scalejs.registerTemplates)(_action2.default);
(0, _scalejs2.registerViewModels)({ action: _actionViewModel2.default });

exports.registerActions = registerActions;
exports.getRegisteredActions = getRegisteredActions;
//# sourceMappingURL=actionModule.js.map