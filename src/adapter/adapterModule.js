/*global define */
import sandbox from 'scalejs.sandbox';
import adapterViewModel from './adapterViewModel';
import adapterTemplates from './adapter.html';
import { registerViewModels } from 'scalejs.metadataFactory'
    

    sandbox.mvvm.registerTemplates(adapterTemplates);

    export default function adapter() {       
        registerViewModels({
            adapter: adapterViewModel
        });
    };
