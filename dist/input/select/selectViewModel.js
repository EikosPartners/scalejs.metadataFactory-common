'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = selectViewModel;

var _knockout = require('knockout');

var _scalejs = require('scalejs.expression-jsep');

var _scalejs2 = require('scalejs');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *  select is a type of input that lets the 
 *  user select the value from dropdown options
 * 
 * @module input-select
 * 
 * @param {object} node
 *  The configuration specs for the component.
 * @param {string} node.options
 *  Options specific to this component
 * @param {bool} [node.options.addBlank=true] 
 *  Whether or not to add a blank to the beginning of the select options
 * @param {object|array} node.options.values
 *  Specifies either an array of values to use or an object describing the values
 * @param {string} node.options.values.fromArray
 *  A string to be evaluated that will be used to map the values
 * @param {string|array} node.options.values.textKey
 *  A string or array which refers to the text key (i.e. the label) for the options
 * @param {string} node.options.values.valueKey
 *  A string which referes to the value key for the options
 * @param {string} [node.options.values.delimeter=' / ']
 *  A delimeter for the label if the textKey is an array
 * @param {string} [node.options.values.textFormatter]
 *  The name of a function to format the label for the option (i.e. dateFormatter)
 *  
 */
function selectViewModel(node, inputViewModel) {
    var context = this,
        options = node.options || { values: [] },

    // inputViewModel
    inputValue = inputViewModel.inputValue,
        mapItem = inputViewModel.mapItem,
        format = inputViewModel.format,
        subs = inputViewModel.subs,
        values = inputViewModel.values,

    // props           
    addBlank = !(0, _scalejs2.has)(options.addBlank) || options.addBlank,
        currentFilter = (0, _knockout.observable)(),
        computedValues;

    if (!options.values) {
        console.warn('select input type being used without values');
        options.values = [];
    }

    /** 
     * Helper function to check if the array has the value
     * 
     * @param {array}   valuesArr   Array to check for value
     * @param           value       The value to check in array
     */
    function arrayHasValue(valuesArr, valueOrObjectToCheck) {
        var valueToCheck = (0, _scalejs2.get)(valueOrObjectToCheck, 'value', valueOrObjectToCheck);
        return valuesArr.some(function (value) {
            return (0, _scalejs2.get)(value, 'value', value) === valueToCheck;
        });
    }

    /** 
     * Helper function to takes valuesArr and a value.
     * If the array does not contain the value, it unshifts it
     * 
     * @param {array}   valuesArr   Array to check for value
     * @param           value       The value to unshift if not found
     */
    function unshiftToValues(valuesArr, value) {
        var hasValue = arrayHasValue(valuesArr, value);

        if (!hasValue && (0, _scalejs2.has)(value) && value != '') {
            valuesArr.unshift({
                text: format(value),
                value: value
            });
        }
        return valuesArr;
    }

    /** 
     * Sets the values if the options.values is an array.
     * Maps any string values to { text, value }
     */
    function setValuesFromOptionsArray() {
        values((addBlank ? [''] : []).concat(options.values.slice()).map(function (val) {
            return (0, _scalejs2.is)(val, 'string') ? { text: val, value: val } : val;
        }));
    }

    /** 
     * Sets the values if the options.values is an object and options.values.fromArray exists.
     * fromArray is an expression which is evaluated to retrieve the values from context
     */
    function setValuesFromOptionsObject() {
        // create a sub to subscribe to changes in values
        subs.push((0, _knockout.computed)(function () {
            var value = inputValue.peek(),
                newValues = _lodash2.default.toArray((0, _scalejs.evaluate)(options.values.fromArray, context.getValue) || []).filter(function (item) {
                return (0, _scalejs2.has)(item);
            }).map(mapItem(options.values));

            newValues = (addBlank || newValues.length === 0 ? [{ text: '', value: '' }] : []).concat(newValues);

            values(unshiftToValues(newValues, value));
        }).extend({ deferred: true }));
    }

    /** 
     * setValue is Utilized by the form to set the value of the input after initialization
     * If the value is not already in the values array, it will be unshifted
     * 
     * @param {object|value}    data    Either an object with a value or the value to be set
     */
    function setValue(data) {
        var value = (0, _scalejs2.is)(data, 'object') && data.hasOwnProperty('value') ? data.value : data;
        values(unshiftToValues(values(), value));
        inputValue(value);
    }

    /** 
     * Function which is utilized by rules engine
     * Sets the currentFilter observable
     * This will make the computedValues return only the valuesToKeep
     * 
     * @param {array}   valuesToKeep    Array of values that will kept in the filter
     */
    function filterValues(valuesToKeep) {
        currentFilter(valuesToKeep);
        // changing the currentFilter can change the values
        // this in turn, changing the inputValue. But for some reason, its not enough to trigger bindings.
        // manually provoke a change to isModified, so validation bindings get re-evaled.
        inputValue.isModified.valueHasMutated();
    }

    /**
     * Initialize the values observable either with array or with object
     */
    if (Array.isArray(options.values)) {
        setValuesFromOptionsArray();
    }
    if (options.values.fromArray) {
        setValuesFromOptionsObject();
    }

    /**
     * If currentFilter is defined, return only values which match
     */
    computedValues = (0, _knockout.computed)({
        read: function read() {
            if (!currentFilter()) {
                return values();
            }
            return values().filter(function (v) {
                var value = v.value; // || v; //we used to expect { value: ''} or '', now we always do mapping first
                return currentFilter().indexOf(value) !== -1;
            });
        },
        write: function write(newValues) {
            values(newValues);
        }
    });

    return {
        values: computedValues,
        setValue: setValue,
        filterValues: filterValues
    };
};
//# sourceMappingURL=selectViewModel.js.map