import { registerActions } from '../action/actionModule';

function redirect(options) {
    window.location.replace(options.target);
}
registerActions({redirect});
