'use strict';

var _actionModule = require('../action/actionModule');

function redirect(options) {
    window.location.replace(options.target);
}
(0, _actionModule.registerActions)({ redirect: redirect });
//# sourceMappingURL=redirect.js.map