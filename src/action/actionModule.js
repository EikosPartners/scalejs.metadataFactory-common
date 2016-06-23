import core from 'scalejs.core';
import { registerTemplates, registerBindings } from 'scalejs.mvvm';
import { registerViewModels } from 'scalejs.metadatafactory';

import actionViewModel from './actionViewModel';
import actionBindings from './actionBindings';
import actionTemplates from './action.html';


let registeredActions = {};

function registerActions(actions) {
    core.object.extend(registeredActions, actions);
}

function getRegisteredActions() {
    return registeredActions;
}

registerBindings(actionBindings);
registerTemplates(actionTemplates);
registerViewModels({action: actionViewModel});

export { registerActions, getRegisteredActions };