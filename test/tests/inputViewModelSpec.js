
import { registerViewModels, createViewModel, createViewModels } from 'scalejs.metadataFactory';
import { createMetadataDomStub } from 'utils';
import ko from 'knockout';
import _ from 'lodash';
import 'chai';

import inputViewModel from 'input/inputViewModel';


let expect = chai.expect,
    domStub;


const node = {
    "type": "input"
};

describe('inpputViewModel test', function () {
    this.timeout(0); //disable timeout for dev

    before(function () {
        registerViewModels({
            input: inputViewModel
        });

        domStub = createMetadataDomStub(node);
    });

    after(function () {
        domStub.dispose();
    });

    it('does something', function () {
        console.log(domStub.node);
        expect(true).to.equal(true);
    });
});


