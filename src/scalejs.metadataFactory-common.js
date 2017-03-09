import './accordion/accordionModule';
import './action/actionModule';
import './adapter/adapterModule';
import './input/inputModule';
import './store/storeModule';
import './template/templateModule';
import './list/listModule';
import './listAdvanced/listAdvancedModule';
import './grid/gridModule';

import mvvm from 'scalejs.mvvm';

import ko from 'knockout';
window.ko = ko;

mvvm.init({});
