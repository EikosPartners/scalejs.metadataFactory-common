'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getRegisteredActions = exports.registerActions = undefined;

var _scalejs = require('scalejs.core');

var _scalejs2 = _interopRequireDefault(_scalejs);

var _scalejs3 = require('scalejs.mvvm');

var _scalejs4 = require('scalejs.metadataFactory');

var _actionViewModel = require('./actionViewModel');

var _actionViewModel2 = _interopRequireDefault(_actionViewModel);

var _actionBindings = require('./actionBindings');

var _actionBindings2 = _interopRequireDefault(_actionBindings);

var _action = require('./action.html');

var _action2 = _interopRequireDefault(_action);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var registeredActions = {};

function registerActions(actions) {
    _scalejs2.default.object.extend(registeredActions, actions);
}

function getRegisteredActions() {
    return registeredActions;
}

(0, _scalejs3.registerBindings)(_actionBindings2.default);
(0, _scalejs3.registerTemplates)(_action2.default);
(0, _scalejs4.registerViewModels)({ action: _actionViewModel2.default });

exports.registerActions = registerActions;
exports.getRegisteredActions = getRegisteredActions;
//# sourceMappingURL=actionModule.js.map