'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var bindings = {
    'globalNavlinks': function globalNavlinks(ctx) {
        var navLinks = this.navLinks().filter(function (link) {
            return link.inNav !== false;
        });
        return {
            foreach: navLinks
        };
    }
};

exports.default = bindings;
//# sourceMappingURL=globalNavigationBindings.js.map