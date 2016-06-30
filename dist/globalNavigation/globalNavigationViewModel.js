'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = globalNavigation;

var _scalejs = require('scalejs.metadataFactory');

var _scalejs2 = require('scalejs.navigation');

var _dataservice = require('dataservice');

var _dataservice2 = _interopRequireDefault(_dataservice);

var _scalejs3 = require('scalejs');

var _knockout = require('knockout');

var _knockout2 = _interopRequireDefault(_knockout);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function globalNavigation(node) {
    var routes = _knockout2.default.observableArray(node.routes),
        navLinks = _scalejs2.navigation.navLinks,
        activeLink = _scalejs2.navigation.activeLink;

    function walkGetTypes(nodes) {
        return (nodes || []).reduce(function (types, node) {
            return types.concat([node.type]).concat(walkGetTypes(node.children));
        }, []);
    }

    routes().forEach(function (route) {
        _scalejs2.navigation.addNav(route, function (routeInfo) {
            var name = route.get.replace('{path}', routeInfo.path ? '_' + routeInfo.path.replace('/', '_') : '');
            _dataservice2.default.ajax({ 'uri': name }, function (err, metadata) {
                if (err) {
                    return;
                }
                var types = _.uniq(walkGetTypes(Array.isArray(metadata) ? metadata : [metadata])).filter(function (type) {
                    return type && (0, _scalejs.getRegisteredTypes)().indexOf(type) === -1;
                });
                console.log('Missing types:', types);

                _scalejs2.layout.content(metadata);
            });
        });
    });

    _scalejs2.navigation.init(node.initial || 0);

    return (0, _scalejs3.merge)(node, {
        navLinks: navLinks,
        activeLink: activeLink
    });
}
//# sourceMappingURL=globalNavigationViewModel.js.map