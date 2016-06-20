import { registerTemplates, registerBindings } from 'scalejs.mvvm';
import { registerViewModels } from 'scalejs.metadataFactory';

import inputViewModel from './inputViewModel';
import inputBindings from './inputBindings';
import inputTemplates from './input.html';
    

    registerBindings(inputBindings);
    registerTemplates(inputTemplates);
    registerViewModels({
        input: inputViewModel
    });
        