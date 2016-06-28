import { registerTemplates, registerBindings } from 'scalejs.mvvm';
import { registerViewModels } from 'scalejs.metadataFactory';

import viewModel from './templateViewModel';

registerViewModels({
    template: viewModel
});
