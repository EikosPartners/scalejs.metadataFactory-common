import { registerTemplates, registerBindings } from 'scalejs.mvvm';
import { registerViewModels } from 'scalejs.metadataFactory';

import viewModel from './templateViewModel';
import view from './template.html';

registerTemplates(view);

registerViewModels({
    template: viewModel
});
