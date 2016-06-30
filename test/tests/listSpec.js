import { getRegisteredTypes } from 'scalejs.metadataFactory';
import 'chai';

import 'list/listModule';

describe('listModule test', function () {
    it('registers the list viewModel', function () {
        expect(getRegisteredTypes()).to.include('list');
    });
});
