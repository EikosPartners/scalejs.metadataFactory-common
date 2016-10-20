import { registerTemplates, registerBindings } from 'scalejs.mvvm';
import { registerViewModels } from 'scalejs.metadataFactory';

import tabsViewModel from './tabsViewModel';
import tabsBindings from './tabsBindings';
import tabsTemplates from './tabs.html';
import './tabs.scss';
import 'ko-bindings/fontIcon';

registerBindings(tabsBindings);
registerTemplates(tabsTemplates);
registerViewModels({
    tabs: tabsViewModel
});