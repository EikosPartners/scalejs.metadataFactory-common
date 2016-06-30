import { getRegisteredTypes, createViewModel } from 'scalejs.metadataFactory';
import 'chai';

import 'globalNavigation/globalNavigationModule';

describe('globalNavigationModule test', function () {
    it('registers the globalNavigation viewModel', function () {
        expect(getRegisteredTypes()).to.include('globalNavigation');
    });

    it('creates the viewmodel for globalNavigation', function () {
        const node = {
                "type": "globalNavigation"
            },
            globalNavigation = createViewModel(node);

            expect(globalNavigation).to.have.property('navLinks');
    });
});
