import { getRegisteredTypes } from 'scalejs.metadataFactory';
import 'chai';

import 'listAdvanced/listAdvancedModule';

describe('listAdvancedModule test', function () {
    it('registers the listAdvanced viewModel', function () {
        expect(getRegisteredTypes()).to.include('listAdvanced');
    });
});
