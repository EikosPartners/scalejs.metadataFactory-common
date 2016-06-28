import { getRegisteredTypes } from 'scalejs.metadataFactory';
import 'chai';

import 'globalNavigation/globalNavigationModule';

describe('globalNavigationModule test', function () {
    it('registers the globalNavigation viewModel', function () {
        expect(getRegisteredTypes()).to.include('globalNavigation');
    });
});
