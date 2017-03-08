import { registerTemplates, registerBindings } from 'scalejs.mvvm';
import { registerViewModels } from 'scalejs.metadataFactory';

import gridViewModel from './gridViewModel';
import gridBindings from './gridBindings';
import gridTemplates from './grid.html';

import './grid.scss';

// TODO: find out if this should go here or not
import './dataTables.js';

registerBindings(gridBindings);
registerTemplates(gridTemplates);
registerViewModels({
    grid: gridViewModel
});