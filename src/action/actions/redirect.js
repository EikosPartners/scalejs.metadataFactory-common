import { registerActions } from '../actionModule';

function redirect(options) {
    window.location.replace(options.target);
}
registerActions({redirect});
