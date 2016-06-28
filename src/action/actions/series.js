import { createViewModel } from 'scalejs.metadataFactory';

import { registerActions } from '../actionModule';

function series(options, args) {
    var context = this;
    (options.actions || []).forEach(function (action) {
        createViewModel.call(context, action).action(args);
    });
}

registerActions({series});