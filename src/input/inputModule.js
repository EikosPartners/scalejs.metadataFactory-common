import { registerTemplates, registerBindings } from 'scalejs.mvvm';
import { registerViewModels } from 'scalejs.metadataFactory';

import './validation/validationEngine';
import 'scalejs.inputmask';
import autocompleteViewModel from './autocomplete/autocompleteViewModel';
import selectViewModel from './select/selectViewModel';
import inputViewModel from './inputViewModel';
import inputBindings from './inputBindings';
import inputTemplates from './input.html';
import 'ko-bindings/datepicker';
import 'ko-bindings/autosize';
import 'ko-bindings/tokeninput';
import 'pikaday/scss/pikaday.scss';
import './input.scss';
import './input-multiselect.scss';
    registerBindings(inputBindings);
    registerTemplates(inputTemplates);
    registerViewModels({
        input: inputViewModel
    });
