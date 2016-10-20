import { registerTemplates, registerBindings } from 'scalejs.mvvm';
import { registerViewModels } from 'scalejs.metadataFactory';

import listAdvancedViewModel from './listAdvancedViewModel';
import listAdvancedBindings from './listAdvancedBindings';
import listAdvancedTemplates from './listAdvanced.html';
import './listAdvanced.scss';
import 'ko-bindings/clickoff';
import 'ko-bindings/fontIcon';


    registerBindings(listAdvancedBindings);
    registerTemplates(listAdvancedTemplates);
    registerViewModels({
        listAdvanced: listAdvancedViewModel
    });
