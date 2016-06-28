'use strict';

var _scalejs = require('scalejs.metadataFactory');

var _actionModule = require('../actionModule');

function series(options, args) {
    var context = this;
    (options.actions || []).forEach(function (action) {
        _scalejs.createViewModel.call(context, action).action(args);
    });
}

(0, _actionModule.registerActions)({ series: series });
//# sourceMappingURL=series.js.map