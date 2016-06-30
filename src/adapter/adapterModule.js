import { registerTemplates, registerBindings } from 'scalejs.mvvm';
import { registerViewModels } from 'scalejs.metadataFactory';

import adapterViewModel from './adapterViewModel';
import adapterTemplates from './adapter.html';

    registerTemplates(adapterTemplates);
    registerViewModels({
        adapter: adapterViewModel
    });
