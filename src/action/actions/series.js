import { createViewModel } from 'scalejs.metadatafactory';

import { registerActions } from '../actionModule';

function series(options, args) {
    var context = this;
    (options.actions || []).forEach(function (action) {
        createViewModel.call(context, action).action(args);
    });
}

registerActions({series});