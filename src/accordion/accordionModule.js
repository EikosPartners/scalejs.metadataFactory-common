import { registerTemplates, registerBindings } from 'scalejs.mvvm';
import { registerViewModels } from 'scalejs.metadataFactory';

import accordionViewModel from './accordionViewModel';
import accordionBindings from './accordionBindings';
import accordionTemplates from './accordion.html';

import 'ko-bindings/fontIcon';


    registerBindings(accordionBindings);
    registerTemplates(accordionTemplates);
    registerViewModels({
        accordion: accordionViewModel
    });
