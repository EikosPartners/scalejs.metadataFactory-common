import { registerTemplates } from 'scalejs.mvvm';
import { registerViewModels } from 'scalejs.metadataFactory';

import renderViewModel from './renderViewModel';
import renderTemplates from './render.html';

registerTemplates(renderTemplates);
registerViewModels({
    render: renderViewModel
});