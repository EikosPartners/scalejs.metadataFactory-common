import { registerTemplates, registerBindings } from 'scalejs.mvvm';
import { registerViewModels } from 'scalejs.metadataFactory';

import menuViewModel from './menuViewModel';
import menuBindings from './menuBindings';
import menuTemplates from './menu.html';
import './menu.scss';

    registerBindings(menuBindings);
    registerTemplates(menuTemplates);
    registerViewModels({
        menu: menuViewModel
    });

