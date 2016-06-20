import { registerTemplates } from 'scalejs.mvvm';
import { registerViewModels } from 'scalejs.metadataFactory';

import storeViewModel from './storeViewModel';
import storeTemplates from './store.html';
    

    registerTemplates(storeTemplates);
    registerViewModels({
        store: storeViewModel
    });