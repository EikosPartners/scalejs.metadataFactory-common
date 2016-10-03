import { registerTemplates, registerBindings } from 'scalejs.mvvm';
import { registerViewModels } from 'scalejs.metadataFactory';

import groupViewModel from './groupViewModel';
import groupTemplates from './group.html';
    

    registerTemplates(groupTemplates);
    registerViewModels({
        group: groupViewModel
    });
