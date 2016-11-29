import { registerTemplates, registerBindings } from 'scalejs.mvvm';
import { registerViewModels } from 'scalejs.metadataFactory';

import gridBasicFilterViewModel from './gridBasicFilterViewModel';
import gridBasicFilterBindings from './gridBasicFilterBindings';
import gridBasicFilterTemplates from './gridBasicFilter.html';

import './gridBasicFilter.scss';

registerBindings(gridBasicFilterBindings);
registerTemplates(gridBasicFilterTemplates);
registerViewModels({
    gridBasicFilter: gridBasicFilterViewModel
});