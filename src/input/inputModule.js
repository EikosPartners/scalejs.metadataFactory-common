import { registerTemplates, registerBindings } from 'scalejs.mvvm';
import { registerViewModels } from 'scalejs.metadataFactory';

import './validation/validationEngine';
import 'scalejs.inputmask';
import inputViewModel from './inputViewModel';
import inputBindings from './inputBindings';
import inputTemplates from './input.html';
import './input.scss';
import '../../node_modules/pikaday/scss/pikaday.scss';
import 'ko-bindings/datepicker.js';

    registerBindings(inputBindings);
    registerTemplates(inputTemplates);
    registerViewModels({
        input: inputViewModel
    });
        