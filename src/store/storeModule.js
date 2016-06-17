/*global define */
import storeViewModel from './storeViewModel';
import { registerViewModels } from 'scalejs.metadataFactory'    

    export default function store() {

        registerViewModels({
            store: storeViewModel
        });
    };
