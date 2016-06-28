import globalNavigationViewModel from './globalNavigationViewModel.js';
import globalNavigationView from './globalNavigation.html';
import globalNavigationBindings from './globalNavigationBindings';
import { registerTemplates, registerBindings } from 'scalejs.mvvm';
import { registerViewModels } from 'scalejs.metadataFactory';
import {navigation, layout} from 'scalejs.navigation';
import ko from 'knockout';
import dataservice from 'dataservice';

registerTemplates(globalNavigationView);
registerBindings(globalNavigationBindings);
registerViewModels({
    globalNavigation: globalNavigationViewModel
});
