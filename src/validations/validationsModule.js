import { registerViewModels,  } from 'scalejs.metadataFactory';
import { registerTemplates, registerBindings } from 'scalejs.mvvm';

import validationsViewModel from './validationsViewModel';
import validationsBindings from './validationsBindings';
import validationTemplate from './validations.html';
import './validations.scss';
import 'ko-bindings/fontIcon';

registerBindings(validationsBindings);
registerTemplates(validationTemplate);
registerViewModels({ validations: validationsViewModel });