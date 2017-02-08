'use strict';

var _scalejs = require('scalejs.expression-jsep');

var _knockout = require('knockout');

var _knockout2 = _interopRequireDefault(_knockout);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

require('ep-knockout.validation');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/*
* made validation engine its own file to support more complex logic
*/

// set the generic validation on the knockout binding
_knockout2.default.validation.init({
    insertMessages: false,
    messagesOnModified: true,
    decorateElement: false,
    decorateElementOnModified: false,
    decorateInputElement: false
});

_knockout2.default.validation.rules.expression = {
    validator: function validator(val, p) {
        var params = p.params ? p.params : p,
            getValue = params[1],
            validator = this;
        // option 1: params[0] is not an array so it is just the term
        if (!Array.isArray(params[0])) {
            return _scalejs.evaluate.apply(undefined, _toConsumableArray(params));
        }
        // option 2: params[0] is an array so it is many terms
        return params[0].every(function (e) {
            var isValid = _scalejs.evaluate.call(null, e.term, getValue);
            if (!isValid) {
                validator.message = e.message;
            }
            return isValid;
        });
    },
    message: 'Expression is not correct'
};

_knockout2.default.validation.rules.autocomplete = {
    validator: function validator(val, p) {
        if (!val) {
            return true; // if the value is undefined, then we ignore the validation.
        }

        return _lodash2.default.findIndex(p, ['value', val]) > -1;
    },
    message: 'Expression is not correct'
};

_knockout2.default.validation.rules.customError = {
    validator: function validator(val, error) {
        if (error) {
            this.message = error;
            return false;
        }
        return true;
    },
    message: 'Value is not valid'
};

var patternValidator = _knockout2.default.validation.rules.pattern.validator;
_knockout2.default.validation.rules.pattern.validator = function (val, params) {
    var validator = this;
    if (Array.isArray(params)) {
        return params.every(function (param) {
            var isValid = patternValidator(val, param.params);
            if (!isValid) {
                validator.message = param.message;
            }
            return isValid;
        });
    }
    return patternValidator(val, params);
};

_knockout2.default.validation.registerExtenders();
//# sourceMappingURL=validationEngine.js.map