import { getRegisteredTypes } from 'scalejs.metadataFactory';
import { navigation, layout } from 'scalejs.navigation';
import dataservice from 'dataservice';
import { merge } from 'scalejs';
import ko from 'knockout';
import _ from 'lodash';

export default function globalNavigation(node) {
    const routes = ko.observableArray(node.routes),
        navLinks = navigation.navLinks,
        activeLink = navigation.activeLink;

    function walkGetTypes(nodes) {
        return (nodes || [])
            .reduce((types, childNode) => types.concat([childNode.type])
            .concat(walkGetTypes(childNode.children)), []);
    }

    routes().forEach((route) => {
        navigation.addNav(route, (routeInfo) => {
            const name = route.get.replace('{path}', routeInfo.path ? `_${routeInfo.path.replace('/', '_')}` : '');
            dataservice.ajax({ uri: name }, (err, metadata) => {
                if (err) {
                    return;
                }
                const types = _.uniq(walkGetTypes(Array.isArray(metadata) ? metadata : [metadata]))
                    .filter(type =>
                        type && getRegisteredTypes().indexOf(type) === -1
                    );

                // console.log('Missing types:', types);

                layout.content(metadata);
            });
        });
    });

    navigation.init(node.initial || 0);

    routes.subscribe((oldRoutes) => {
        oldRoutes.forEach((routeOptions) => {
            navigation.removeNav(routeOptions.text);
        });
    }, null, 'beforeChange');

    return merge(node, {
        navLinks,
        activeLink,
        dispose: function () {
            routes([]);
        }
    });
}