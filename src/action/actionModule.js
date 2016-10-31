import { extend } from 'lodash';
import { registerTemplates, registerBindings } from 'scalejs.mvvm';
import { registerViewModels } from 'scalejs.metadataFactory';

import actionViewModel from './actionViewModel';
import actionBindings from './actionBindings';
import actionTemplates from './action.html';

const registeredActions = {};

function registerActions(actions) {
    extend(registeredActions, actions);
}

function getRegisteredActions() {
    return registeredActions;
}

registerBindings(actionBindings);
registerTemplates(actionTemplates);
registerViewModels({ action: actionViewModel });

export { registerActions, getRegisteredActions };