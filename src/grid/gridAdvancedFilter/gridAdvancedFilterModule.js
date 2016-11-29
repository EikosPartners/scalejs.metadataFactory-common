import { registerTemplates, registerBindings } from 'scalejs.mvvm';
import { registerViewModels } from 'scalejs.metadataFactory';

import gridAdvancedFilterViewModel from './gridAdvancedFilterViewModel';
import gridAdvancedFilterBindings from './gridAdvancedFilterBindings';
import gridAdvancedFilterTemplates from './gridAdvancedFilter.html';

import './gridAdvancedFilter.scss';

registerBindings(gridAdvancedFilterBindings);
registerTemplates(gridAdvancedFilterTemplates);
registerViewModels({
    gridAdvancedFilter: gridAdvancedFilterViewModel
});