import sandbox from 'scalejs.sandbox';
import { getRegisteredTypes } from 'scalejs.metadataFactory';
import {navigation, layout} from 'scalejs.navigation';
import ko from 'knockout';
import dataservice from 'dataservice';

export default function globalNavigation(node) {
    var routes = ko.observableArray(node.routes),
    merge = sandbox.object.merge,
    navLinks = navigation.navLinks,
    activeLink = navigation.activeLink;

    function walkGetTypes(nodes) {
        return (nodes || [])
            .reduce( (types, node) => types.concat([node.type])
            .concat(walkGetTypes(node.children)), []);
    }

    routes().forEach(function (route) {
        navigation.addNav(route, function (routeInfo) {
            var name = route.get.replace('{path}', routeInfo.path ? '_' + routeInfo.path.replace('/','_') : '');
            dataservice.ajax({ 'uri': name }, function (err, metadata) {
                if (err) {
                    return;
                }
                var types = _.uniq(walkGetTypes(Array.isArray(metadata) ? metadata : [metadata])).filter(function (type) {
                    return type && getRegisteredTypes().indexOf(type) === -1
                });
                console.log('Missing types:', types);

                layout.content(metadata);
            });
        });
    });

    navigation.reRoute();

    return merge(node, {
        navLinks: navLinks,
        activeLink: activeLink
    });
}
