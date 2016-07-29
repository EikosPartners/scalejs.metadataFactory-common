import { observable, observableArray, computed } from 'knockout';
import { createViewModel } from 'scalejs.metadataFactory';
import { evaluate } from 'scalejs.expression-jsep';
import { has, get, is, merge } from 'scalejs';
import dataservice from 'dataservice';
import { extend } from 'lodash';
import moment from 'moment';
import ko from 'knockout';
import _ from 'lodash';

import autocompleteViewModel from './autocomplete/autocompleteViewModel';
import selectViewModel from './select/selectViewModel';

let inputTypes = {
    autocomplete: autocompleteViewModel,
    select: selectViewModel
}

export default function inputViewModel(node) {
    var // metadata node + context
        options = node.options || {},
        keyMap = node.keyMap || {},
        context = this || {},

        // inputValue: accepts user input via KO Binding
        inputValue = createInputValue(),

        // values which can be chosen from
        values = observableArray(Array.isArray(options.values) ? options.values : []),

        // Depricated? //TODO: Yes isShown is depricated in favor of rendered
        isShown = observable(!node.hidden),

        // 2-way binding with state of focus
        hasFocus = observable(),

        // 1-way binding with state of hover
        hover = observable(),

        // validations
        validations = options.validations || null,
        required = validations ? validations.required : false,
        customError = observable(),

        // attributes
        disabled = observable(!!options.disabled),
        readonly = deriveReadonly(options.readonly),
        maxlength = validations && validations.maxLength,

        // patterns
        pattern = options.pattern === true ? getPattern() : options.pattern,
        tooltipShown = observable(false), //for patterns
        shake = observable(false),

        //specific datepicker
        datePlaceholder = node.inputType === 'datepicker' && ko.pureComputed(function () {
            var placeholder = !hover() || hasFocus() ? '' : 'mm/dd/yyyy';
            return placeholder;
        }),

        // custom setValue functions for input types
        setValueFuncs = {
            checkboxList: setCheckboxListValue
        },

        // subs disposable array
        subs = [],

        // how can we define these more clearly / better? Block Scope?
        wasModified, //Needed?
        computedValueExpression, //Needed?
        registeredAction, //Needed?

        // move out to utility?
        formatters = {
            dateFormatter: dateFormatter
        },
        format = options.values && options.values.textFormatter ? formatters[options.values.textFormatter] : _.identity,

        // BaseViewModel to be passed to Mixins
        viewmodel = {
            mapItem: mapItem,
            inputValue: inputValue,
            hasFocus: hasFocus,
            format: format,
            subs: subs,
            readonly: readonly,
            values: values
        };

    /*
     * PJSON API (refine)
     */
    function getValue() {
        return inputValue() || '';
    }

    function setValue(data) {
        var value = is(data, 'object') ? data.value : data,  // TODO: Refactor - should only accept "value", not "data".
            wasModifed = inputValue.isModified();

         // uses setValueFunc if defined, else updates inputValue
        if (setValueFuncs[node.inputType]) {
            setValueFuncs[node.inputType](data);
        } else if (viewmodel.setValue) {
            viewmodel.setValue(data);
        } else {
            inputValue(value);
        }

        // programtically setting the inputValue will not cause isModified to become true
        if (!wasModifed) { inputValue.isModified(false); }
    }

    function update(data) {
        if (data.hasOwnProperty('value')) {
            setValue(data.value);
        }
        if (data.hasOwnProperty('error')) {
            customError(data.error);
        }
        if (data.hasOwnProperty('values')) {
            values(data.values);
        }
    }

    function validate() {
        console.error('Relying on "this" for rendered in validate. REFACTOR');
        inputValue.isModified(true);
        return !inputValue.isValid() && isShown() && this.rendered() && inputValue.severity() === 1;
    }

    // TODO: How to allow for custom visible message specific to project?
    function visibleMessage() {
        // returns the message to be displayed (based on validations)
        var inputMessage, message,
            severity = inputValue.severity();

        if (!inputValue.isModified() || inputValue.isValid() || !this.rendered() || !isShown()) {
            // the user has yet to modify the input
            // or there is no message. return nothing
            return;
        }

        inputMessage = inputValue.error();
        inputMessage = inputMessage[inputMessage.length - 1] === '.' ? inputMessage : inputMessage + '.';

        if (inputMessage === 'Required.') {
            message = (node.errorLabel || node.label) + ' is required.';
        } else {
            message = (node.errorLabel || node.label) + ' is invalid. ' + inputMessage;
        }

        return {
            message,
            severity,
            onClick() {
                hasFocus(true);
            }
        };
    }

    /*
     * Rule Engine (todo - Refactor out)
     */

    function assignDate(value, params) {
        if (!is(params, 'object')) {
            console.error('Assign date only supports object params', params);
            return;
        }
        var newDate = moment(value).add(params).format(options.rawFormat || 'YYYY-MM-DD');
        setValue(newDate);
    }

    function setReadonly(bool) {
        readonly(bool)
    }

    function setCheckboxListValue(data) {
        if (data && data.value) {
            console.warn('Using depricated setValue { value: <> } interface. Please update code.');
        }
        if (Array.isArray(data)) {
            inputValue(data);
        } else if (data !== null && data !== undefined) {
            console.warn('Setting a checkbox list with a non-array value. Converting to array...');
            inputValue([data]);
        } else {
            inputValue([]);
        }
    }

    /*
     * Internal
     */
    function createInputValue() {
        // checkboxList can have multiple answers so make it an array
        if (node.inputType === 'checkboxList') {
            return observableArray(options.value || []);
        } else {
            // if there is no initial value, set it to empty string,
            // so that isModified does not get triggered for empty dropdowns
            return observable(has(options.value) ? options.value : '');
        }
    }


    function getPattern() {
        // implicitly determine pattern (inputmask) if there is a Regex validation
        if (validations && validations.pattern) {
            return {
                alias: 'Regex',
                regex: validations.pattern.params
            };
        }
    }

    function deriveReadonly(readonlyParam) {
        if (is(readonlyParam, 'string')) {
            let override = observable();
            return computed({
                read: function () {
                    return has(override()) ?
                        override()
                        : evaluate(readonlyParam, context.getValue);
                },
                write: function (value) {
                    override(value);
                }
            });
        }
        return observable(!!readonlyParam);
    }
    /*
     * Utils (can be Refactored to common)
     */

    function dateFormatter(date) {
        return moment(date).format('MM/DD/YYYY');
    }

    function mapItem(mapper) {
        var textKey = Array.isArray(mapper.textKey) ? mapper.textKey : [mapper.textKey],
            valueKey = Array.isArray(mapper.valueKey) ? mapper.valueKey : [mapper.valueKey],
            textFormatter = formatters[mapper.textFormatter] || _.identity,
            delimiter = mapper.delimeter || ' / ';

        return function (val) {
            return {
                text: textFormatter(
                    textKey.map((k) => { return val[k]; }).join(delimiter)
                ),
                value: valueKey.map((k) => { return val[k]; }).join(delimiter),
                original: val
            }
        }
    }


    /*
     * Init
     */

    // Mixin the viewModel specific to the inputType
    if (inputTypes[node.inputType]) {
        extend(viewmodel, inputTypes[node.inputType].call(context, node, viewmodel));
    }
    // Checkbox underlying value is Array because of knockout, maybe refactor to a custom binding?
    // TODO: ^ not sure if this is correct anymore. Checkbox may accept true/false - need to investigate
    if (node.inputType === 'checkbox') {
        values.subscribe((newValues) => {
            if (newValues.indexOf(options.checked) !== -1) {
                inputValue(options.checked);
            } else {
                inputValue(options.unchecked);
            }
        });
        if (inputValue() === options.checked) {
            values.push(options.checked);
        }
    }

    // TODO: Specific to data, move into custom viewModel?
    // make min/max date into observables
    if (options.minDate) {
        viewmodel.minDate = ko.observable(options.minDate);
    }
    if (options.maxDate) {
        viewmodel.maxDate = ko.observable(options.maxDate);
    }

    // Is this needed in the common? Should it be a plugin/mixin?
    /*
        how to define
        {
            type: 'input',
            options: {
                registered: {
                    target: {
                        uri: 'uri/here' <- requests an endpoint
                    }
                }
            }
        }

        data that gets sent
        {
            input_id: input_value
        }

        data that comes back 
        {
            input_to_update: {
                values: [
                    'value1'
                ]
            }
        }
    */

    if (options.registered) {
        registeredAction = createViewModel.call(this, {
            type: 'action',
            actionType: 'ajax',
            options: merge(options.registered, { data: {} })
        });

        inputValue.subscribe(function (newValue) {
            registeredAction.options.data[node.id] = newValue; //our own sub gets called before context is updated
            if (newValue !== '') {
                registeredAction.action({
                    callback: (error, data) => {
                        Object.keys(data).forEach((key) => {
                            if (!context.dictionary && !context.data) {
                                console.warn('Using a registered input when no data/dictionary available in context', node);
                                return;
                            }
                            var node = context.dictionary && context.dictionary()[key];
                            if (node && node.update) {
                                node.update(data[key]);
                            } else if (context.data && has(data[key], 'value')) {
                                context.data()[key] = data[key].value;
                            }
                        });
                    }
                });
            }
        });
    }

    // TODO: Clean up validation Code
    // add validations to the inputvalue
    validations = merge(_.cloneDeep(options.validations), { customError: customError });
    if (validations.expression) {
        validations.expression.params = [
            options.validations.expression.message ?
                options.validations.expression.term
                : options.validations.expression,
            context.getValue
        ]
    }

    if (options.unique && node.inputType !== 'autocomplete') {
        inputValue.subscribe(function (oldValue) {
            context.unique[node.id].remove(oldValue);
        }, null, 'beforeChange');

        inputValue.subscribe(function (newValue) {
            if(context.deleteFlag && context.deleteFlag()) { return; }
            context.unique[node.id].push(newValue);
        });

        if(context.deleteFlag) {
            context.deleteFlag.subscribe(function(deleted) {
                if (deleted) {
                    context.unique[node.id].remove(inputValue());
                }
            });
        }

        context.unique[node.id].subscribe(function (values) {
            var occurances = values.filter(function (value) {
                return value === inputValue();
            }).length;

            customError(occurances > 1 ? 'Identifier must be unique' : undefined);
        })
    }

    if (viewmodel.validations) {
        validations = merge(validations, viewmodel.validations);
    }
    inputValue = inputValue.extend(validations);

    // Allows us to set values on an input from expression
    if (options.valueExpression) {
        computedValueExpression = computed(() => {
            if (options.allowSet === false) {
                inputValue(); // re-eval when inputValue is set
            }
            return evaluate(options.valueExpression, context.getValue);
        });
        setValue(computedValueExpression());
        computedValueExpression.subscribe(function(value){
            setValue(value)
        });

        subs.push(computedValueExpression)
    }

    // TODO: make into insert zeros option?
    if (get(options, 'pattern.alias') === 'percent') {
        inputValue.subscribe((value) => {
            if (value && isFinite(Number(value))) {
                inputValue(Number(value).toFixed(3));
            }
        });
    }

    shake.subscribe((shook) => {
        shook && setTimeout(() => {
            shake(false);
        }, 1000);
    });

    return merge(node, viewmodel, {
        inputValue,
        visibleMessage,
        customError,
        hasFocus,
        hover,
        datePlaceholder,
        assignDate,
        isShown,
        required,
        readonly,
        disabled,
        maxlength,
        pattern,
        tooltipShown,
        shake,
        options,
        setValue,
        update,
        context: this,
        error: inputValue.error,

        // Mixin-Overrides
        getValue: viewmodel.getValue || getValue,
        values: viewmodel.values || values,
        setReadonly: viewmodel.setReadonly || setReadonly,
        validate: viewmodel.validate || validate,

        dispose: function () {
            if (viewmodel.dispose) {
                viewmodel.dispose();
            }
            (subs || []).forEach(function (sub) {
                sub.dispose && sub.dispose();
            });

            if (options.unique) {
                context.unique[node.id].remove(inputValue());
            }
        }
    });
};



    // implements an input of type
    // text, select, date, radio, checkbox, checkboxList

    //TODO: Refactor Session
    //- createJSDocs
    //- revisit and de-tangle bindings
    //- refactor validations so that the tooltip works without inputText wrapper in the inputType template
    //- move tooltip/helpText in options

    /**
     *  input is the component to use when accepting user-input.
     *  This is the best way to create an interactive UI and
     *  autogenerate your underlying data model by using an adapter in the parent chain.
     *
     * @module input
     *
     * @param {object} node
     *  The configuration specs for the component.
     * @param {string} [node.id]
     *  By specifying an "id" on your input, you are automatically adding your input's data to the data context model.
     * @param {object} node.options
     *  The options pertaining to your specific inputType
     * @param {boolean|string} [node.rendered=true]
     *  Boolean or expression to render the input (or not)
     * @param {array} [node.options.values]
     *  The values that can be chosen from for inputTypes that have selections (e.g. radio, checkboxList)
     * @param {object} [node.options.validations]
     *  KO validations object to validate the inputValue
     * @param {boolean} [node.options.validations.required]
     *  Required validation for ko - also will show * next to label indicating it is required
     * @param {boolean|string} [node.options.readonly=false]
     *  Boolean or expression to set the input as readonly
     * @param {boolean} [node.options.disabled]np
     *  Disables the input (different from readonly)
     * @param {object|string|boolean} [node.options.pattern]
     *  Sets an inputmask for the input. If a string, this is the mask. If an object, gets passed as is.
     *  If boolean = true, uses pattern validation.
     * @param {boolean} [node.options.vertical=false]
     *  For multi-option types (e.g. checkboxList, radio), sets the display to block if true for the options
     */
