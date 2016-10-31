import { registerActions } from 'scalejs.metadatafactory-common/dist/action/actionModule';
import { unwrap } from 'knockout';
import { merge } from 'scalejs';
import mustache from 'mustache';

function redirect(options) {
    if (!options.target) {
        console.error('Must provide target!');
        return;
    }

    let data = unwrap(options.data || (this && this.data)),
        url;

    if (options.params && options.paramsKey) {
        data = merge(data, options[options.paramsKey]);
    }

    url = mustache.render(options.target, data);

    window.location.replace(url);
}
registerActions({ redirect });
