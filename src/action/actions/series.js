import { createViewModel } from 'scalejs.metadataFactory';
import { registerActions } from '../actionModule';

function series(options, args) {
    const context = this;
    (options.actions || []).forEach((action) => {
        createViewModel.call(context, action).action(args);
    });
}

registerActions({ series });