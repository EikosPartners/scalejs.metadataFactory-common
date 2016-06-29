import { registerViewModels } from 'scalejs.metadataFactory';
import setValueViewModel from './setValueViewModel';
    
    registerViewModels({
        setValue: setValueViewModel
    });