import autocompleteViewModel from './autocomplete/autocompleteViewModel';
import selectViewModel from './select/selectViewModel';
import dataservice from 'dataservice';
import sandbox from 'scalejs.sandbox';
import moment from 'moment';
import ko from 'knockout';
import _ from 'lodash';

import {
    observable,
    observableArray,
    computed,
    unwrap
} from 'scalejs.mvvm';

var evaluate = sandbox.expression.evaluate,
    has = sandbox.object.has,
    get = sandbox.object.get,
    is = sandbox.type.is,
    merge = sandbox.object.merge;


var inputTypes = {
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

        // Depricated?
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
        readonly = observable(!!options.readonly),
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

        // move out to sandbox?
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
            readonly: readonly
        };

    /*
     * PJSON API (refine)
     */
    function getValue() {
        return inputValue() || '';
    }

    function setValue(data) {
        if (has(data, 'value')) {
            console.error('Use update to set attributes. Use setValue to pass a single value');
            value = data.value;
        }
        // TODO: Refactor - should only accept "value", not "data".
        var wasModifed = inputValue.isModified(),
            setFunc = setValueFunc[node.inputType] || viewmodel.setValue || inputValue;

        inputValue.isModified(wasModifed); //reset isModified
    }

    function update(data) {
        if (data.hasOwnProperty('value')) {
            setValue(data.value);
        }
        if (data.hasOwnProperty('ErrorMessage')) {
            customError(data.ErrorMessage);
        }
    }

    function validate() {
        console.error('Relying on "this" for rendered in validate. REFACTOR');
        inputValue.isModified(true);
        return !inputValue.isValid() && isShown() && this.rendered() && inputValue.severity() === 1;
    }

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

    function setDisabled(value) {
        if (value === 'toggle') {
            disabled(!disabled());
            return;
        }
        disabled(value);
    }

    function setReadonly(bool) {
        readonly(bool)
    }

    function setCheckboxListValue(data) {
        if (Array.isArray(data.value)) {
            inputValue(data.value);
        } else if (data.value !== null && data.value !== undefined) {
            inputValue([data.value]);
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
            delimeter = mapper.delimeter || ' / ';

        return function (val) {
            return {
                text: textFormatter(
                    textKey.map((k) => { val[k]; }).join(delimiter)
                ),
                value: valueKey.map((k) => { return val[k]; }).join(delimeter),
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
    } else {
        console.error("No inputType was found", node.inputType);
    }

    // Checkbox underlying value is Array because of knockout, maybe refactor to a custom binding?
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
    if (options.registered) {
        registeredAction = sandbox.metadataFactory.createViewModel.call(this, {
            type: 'action',
            actionType: 'ajax',
            options: merge(options.registered, { data: {} })
        });

        inputValue.subscribe(function(newValue) {
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
    if (viewmodel.validations) {
        validations = merge(validations, viewmodel.validations);
    }
    inputValue = inputValue.extend(validations);

    // allows us to set values on an input from expression
    // usecase: issuerId coming from noticeboard
    if (options.valueExpression) {
        computedValueExpression = computed(() => {
            if (options.allowSet === false) {
                inputValue(); // re-eval when inputValue is set
            }
            return evaluate(options.valueExpression, context.getValue);
        });
        setValue(computedValueExpression());
        computedValueExpression.subscribe(setValue(value));
        subs.push(computedValueExpression)
    }

    // Insert Zeros Option?
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
        setDisabled,
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
            //sandbox.utils.disposalAll(subs)(); TODO
            (subs || []).forEach(function (sub) {
                sub.dispose && sub.dispose();
            });
        }
    });
};



    // implements an input of type
    // text, select, date, radio, checkbox, checkboxList   

    //TODO: Refactor Session
    //- createJSDocs
    //- revisit and de-tangle bindings
    //- refactor validations so that the tooltip works without inputText wrapper in the inputType template
    //- remove knockout require
    //- move dataservice to sandbox
    //- move tooltip/helpText in options
    //- move tooltip into pattern object (if pattern is true, use message from validation obj)
    //
    // ...add more refactor session goals here!

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
     * @param {array} [node.options.values]
     *  The values that can be chosen from for inputTypes that have selections (e.g. radio, checkboxList)
     * @param {boolean} [node.hidden=false]
     *  Whether or not to hide the input
     * @param {object} [node.options.validations]
     *  KO validations object to validate the inputValue
     * @param {boolean} [node.options.validations.required]
     *  Required validation for ko - also will show * next to label indicating it is required
     * @param {boolean} [node.options.disabled]
     *  Disables the input
     * @param {object|string|boolean} [node.options.pattern]
     *  Sets an inputmask for the input. If a string, this is the mask. If an object, gets passed as is.
     *  If boolean = true, uses pattern validation.
     */