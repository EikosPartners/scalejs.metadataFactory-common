import { registerTemplates, registerBindings } from 'scalejs.mvvm';
import { registerViewModels } from 'scalejs.metadataFactory';
import 'scalejs.inputmask';
import 'ko-bindings/datepicker';
import 'ko-bindings/autosize';
import 'ko-bindings/tokeninput';
import 'ko-bindings/fontIcon';
import 'pikaday/scss/pikaday.scss';

import './validation/validationEngine';
import inputViewModel from './inputViewModel';
import inputBindings from './inputBindings';
import inputTemplates from './input.html';

import './autocomplete/autocomplete.scss';
import './input.scss';
import './input-multiselect.scss';

registerBindings(inputBindings);
registerTemplates(inputTemplates);
registerViewModels({
    input: inputViewModel
});
