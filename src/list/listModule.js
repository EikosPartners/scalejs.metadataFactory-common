import { registerTemplates, registerBindings } from 'scalejs.mvvm';
import { registerViewModels } from 'scalejs.metadataFactory';

import listViewModel from './listViewModel';
import listBindings from './listBindings';
import listTemplates from './list.html';
import 'ko-bindings/fontIcon';


    registerBindings(listBindings);
    registerTemplates(listTemplates);
    registerViewModels({
        list: listViewModel
    });
