import { registerActions } from 'scalejs.metadatafactory-common/dist/action/actionModule';
import { unwrap } from 'knockout';
import { merge } from 'scalejs';
import mustache from 'mustache';
import ko from 'knockout';

function redirect(options) {
    if (!options.target) {
        console.error("Must provide target!");
        return;
    }

    let data = unwrap(options.data || (this && this.data)),
        params;

    if (options.params && options.paramsKey) {
        data = merge(data, options[options.paramsKey]);
    }

    var url = mustache.render(options.target, data);

    window.location.replace(url);
}
registerActions({redirect});
