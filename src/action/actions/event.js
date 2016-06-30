import { notify } from 'scalejs.messagebus';
import { unwrap } from 'knockout';
import { merge } from 'scalejs';
import ko from 'knockout';

import { registerActions } from '../actionModule';

function event(options) {
    let data = unwrap(this && this.data);

    // if (options.before) {
    //     invoke(options.before, {}, options.beforeOptions);
    // }

    if (options.paramsKey) {
        options.params = merge(options.params || {}, options[options.paramsKey]);
    }

    notify(unwrap(options.target), options.params);

    // if (options.after) {
    //     invoke(options.after, {}, options.afterOptions);
    // }
}

registerActions({ event });

