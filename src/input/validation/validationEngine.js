import { evaluate } from 'scalejs.expression-jsep';
import ko from 'knockout';
import _ from 'lodash';
import 'ep-knockout.validation';

/*
* made validation engine its own file to support more complex logic
*/

// set the generic validation on the knockout binding
ko.validation.init({
    insertMessages: false,
    messagesOnModified: true,
    decorateElement: false,
    decorateElementOnModified: false,
    decorateInputElement: false
});

ko.validation.rules.expression = {
    validator: function (val, p) {
        const params = p.params ? p.params : p,
            getValue = params[1],
            validator = this;
        // option 1: params[0] is not an array so it is just the term
        if (!Array.isArray(params[0])) {
            return evaluate(...params);
        }
        // option 2: params[0] is an array so it is many terms
        return params[0].every((e) => {
            const isValid = evaluate.call(null, e.term, getValue);
            if (!isValid) {
                validator.message = e.message;
            }
            return isValid;
        });
    },
    message: 'Expression is not correct'
};

ko.validation.rules.autocomplete = {
    validator: function (val, p) {
        if (!val) {
            return true; // if the value is undefined, then we ignore the validation.
        }

        return _.findIndex(p, ['value', val]) > -1;
    },
    message: 'Expression is not correct'
};

ko.validation.rules.customError = {
    validator: function (val, error) {
        if (error) {
            this.message = error;
            return false;
        }
        return true;
    },
    message: 'Value is not valid'
};

const patternValidator = ko.validation.rules.pattern.validator;
ko.validation.rules.pattern.validator = function (val, params) {
    const validator = this;
    if (Array.isArray(params)) {
        return params.every((param) => {
            const isValid = patternValidator(val, param.params);
            if (!isValid) {
                validator.message = param.message;
            }
            return isValid;
        });
    }
    return patternValidator(val, params);
};

ko.validation.registerExtenders();