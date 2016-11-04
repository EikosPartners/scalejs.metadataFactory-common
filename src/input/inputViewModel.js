import { observable, observableArray, computed } from 'knockout';
import { createViewModel, globalMetadata } from 'scalejs.metadataFactory';
import { evaluate } from 'scalejs.expression-jsep';
import { receive } from 'scalejs.messagebus';
import { has, get, is, merge } from 'scalejs';
import { extend } from 'lodash';
import moment from 'moment';
import ko from 'knockout';
import _ from 'lodash';
import noticeboard from 'scalejs.noticeboard';

import autocompleteViewModel from './autocomplete/autocompleteViewModel';
import selectViewModel from './select/selectViewModel';

const inputTypes = {
    autocomplete: autocompleteViewModel,
    select: selectViewModel,
    multiselect: function (node, inputVM) {
        node.options = merge(node.options || {}, {
            addBlank: false
        }); // do not add blanks in multiselect

        return selectViewModel.call(this, node, inputVM);
    }
};

export default function inputViewModel(n) {
    const // metadata node + context
        node = _.merge({}, globalMetadata().input_defaults || {}, n),
        options = node.options || {},
        context = this || {},

        // values which can be chosen from
        values = observableArray(Array.isArray(options.values) ? options.values : []),

        // Depricated? //TODO: Yes isShown is depricated in favor of rendered
        isShown = observable(!node.hidden),

        // 2-way binding with state of focus
        hasFocus = observable(),

        // 1-way binding with state of hover
        hover = observable(),

        // validations
        required = options.validations ? options.validations.required : false,
        customError = observable(),

        // attributes
        disabled = observable(!!options.disabled),
        readonly = deriveReadonly(options.readonly),
        maxlength = options.validations && options.validations.maxLength,

        // patterns
        pattern = options.pattern === true ? getPattern() : options.pattern,
        tooltipShown = observable(false), // for patterns
        shake = observable(false),

        // specific datepicker
        datePlaceholder = node.inputType === 'datepicker' && ko.pureComputed(() => {
            const placeholder = !hover() || hasFocus() ? '' : 'mm/dd/yyyy';
            return placeholder;
        }),

        // custom setValue functions for input types
        setValueFuncs = {
            checkboxList: setCheckboxListValue,
            multiselect: setCheckboxListValue,
            checkbox: setCheckboxValue
        },

        // subs disposable array
        subs = [],

        // move out to utility?
        formatters = {
            dateFormatter
        },
        format = options.values && options.values.textFormatter ?
            formatters[options.values.textFormatter] :
            _.identity;

    let viewmodel = { },
        validations = options.validations || null,
        computedValueExpression,
        // registered action vars
        registeredAction,
        initialRegisteredAction,
        // inputValue: accepts user input via KO Binding
        inputValue = createInputValue(),
        initial;

    viewmodel = {
        mapItem,
        inputValue,
        hasFocus,
        format,
        subs,
        readonly,
        values
    };

    /*
     * PJSON API (refine)
     */
    function getValue() {
        if (node.inputType === 'checkbox') {
            return inputValue() ?
                get(options, 'checkedValue', true) :
                get(options, 'uncheckedValue', false);
        }
        if (inputValue() === '') {
            return {}.hasOwnProperty.call(options, 'emptyValue') ? options.emptyValue : '';
        }
        if (options.number) {
            return Number(inputValue());
        }
        return inputValue();
    }

    function setValue(data, opts = {}) {
        const value = is(data, 'object') ? data.value : data,  // TODO: Refactor - should only accept "value", not "data".
            wasModified = inputValue.isModified();

        initial = opts.initial;

        if (data === getValue()) {
            return;
        }
         // uses setValueFunc if defined, else updates inputValue
        if (setValueFuncs[node.inputType]) {
            setValueFuncs[node.inputType](data);
        } else if (viewmodel.setValue) {
            viewmodel.setValue(data);
        } else {
            inputValue(value);
        }

        // programtically setting the inputValue will not cause isModified to become true
        if (!wasModified) { inputValue.isModified(false); }

        initial = false;
    }

    function update(data) {
        if ({}.hasOwnProperty.call(data, 'value')) {
            setValue(data.value);
        }
        if ({}.hasOwnProperty.call(data, 'error')) {
            customError(data.error);
        }
        if ({}.hasOwnProperty.call(data, 'values')) {
            values(data.values);
        }
    }

    function validate() {
        // can rely on "this" when properties are garuenteed
        // from MD factory and used with compliance
        inputValue.isModified(true);
        return !inputValue.isValid() && isShown() && this.rendered() && inputValue.severity() === 1;
    }

    // TODO: How to allow for custom visible message specific to project?
    function visibleMessage() {
        // returns the message to be displayed (based on validations)
        const severity = inputValue.severity();
        let inputMessage,
            message;

        if (!inputValue.isModified() || inputValue.isValid() || !this.rendered() || !isShown()) {
            // the user has yet to modify the input
            // or there is no message. return nothing
            return;
        }

        inputMessage = inputValue.error();
        inputMessage = inputMessage[inputMessage.length - 1] === '.' ? inputMessage : `${inputMessage}.`;

        if (inputMessage === 'Required.') {
            message = `${node.errorLabel || node.label} is required.`;
        } else {
            message = `${node.errorLabel || node.label} is invalid. ${inputMessage}`;
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
        const newDate = moment(value).add(params).format(options.rawFormat || 'YYYY-MM-DD');
        setValue(newDate);
    }

    function setReadonly(bool) {
        readonly(bool);
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

    function setCheckboxValue(data) {
        inputValue(data === get(options, 'checkedValue', true));
    }

    /*
     * Internal
     */
    function createInputValue() {
        // checkboxList can have multiple answers so make it an array
        if (['checkboxList', 'multiselect'].includes(node.inputType)) {
            return observableArray(options.value || []);
        }
        // if there is no initial value, set it to empty string,
        // so that isModified does not get triggered for empty dropdowns
        let value = options.value;
        if (node.inputType === 'checkbox') {
            value = (options.value === get(options, 'checkedValue', true));
        }
        return observable(has(options.value) ? value : '');
    }


    function getPattern() {
        // implicitly determine pattern (inputmask) if there is a Regex validation
        if (options.validations && options.validations.pattern) {
            if (!options.validations.pattern.params) {
                console.error('Pattern validation must have params and message', node);
                return;
            }

            return {
                alias: 'Regex',
                regex: options.validations.pattern.params
            };
        }
    }

    function deriveReadonly(readonlyParam) {
        if (is(readonlyParam, 'string')) {
            const override = observable();
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
        const textFormatter = formatters[mapper.textFormatter] || _.identity,
            delimiter = mapper.delimeter || ' / ';

        function formatText(val, key) {
            if (Array.isArray(key)) {
                return key.map(k => val[k]).join(delimiter);
            }
            return val[key];
        }

        return function (val) {
            return {
                text: textFormatter(formatText(val, mapper.textKey)),
                value: formatText(val, mapper.valueKey),
                original: val
            };
        };
    }


    function fetchData() {
        const newValue = inputValue(),
            action = initial ? initialRegisteredAction : registeredAction;
        // our own sub gets called before context is updated
        action.options.data[node.id] = newValue;

        if (newValue !== '') {
            action.action({
                callback: (error, data) => {
                    if (error) {
                        return;
                    }
                    Object.keys(data).forEach((key) => {
                        if (key === 'store') {
                            Object.keys(data[key]).forEach((storeKey) => {
                                const valueToStore = data[key][storeKey];
                                noticeboard.setValue(storeKey, valueToStore);
                            });
                            return;
                        }

                        if (!context.dictionary && !context.data) {
                            console.warn('Using a registered input when no data/dictionary available in context', node);
                            return;
                        }
                        const updateNode = context.dictionary && context.dictionary()[key];
                        if (updateNode && updateNode.update) {
                            updateNode.update(data[key]);
                        }
                    });
                }
            });
        }
    }
    /*
     * Init
     */

    // Mixin the viewModel specific to the inputType
    if (inputTypes[node.inputType]) {
        extend(viewmodel, inputTypes[node.inputType].call(context, node, viewmodel));
    }

    // TODO: Specific to data, move into custom viewModel?
    // make min/max date into observables
    if (options.minDate) {
        viewmodel.minDate = ko.observable(options.minDate);
    }
    if (options.maxDate) {
        viewmodel.maxDate = ko.observable(options.maxDate);
    }

    if (options.registered) {
        registeredAction = createViewModel.call(this, {
            type: 'action',
            actionType: 'ajax',
            options: merge(options.registered.update || options.registered, { data: {} })
        });

        initialRegisteredAction = createViewModel.call(this, {
            type: 'action',
            actionType: 'ajax',
            options: merge(options.registered.initial || options.registered, { data: {} })
        });

        inputValue.subscribe(() => {
            fetchData();
        });

        // listen for 'refresh' event
        subs.push(receive(`${node.id}.refreshRegistered`, (eventOptions) => {
            // console.log('--> refreshing registered', node);
            fetchData(eventOptions);
        }));

        // Updates input component 
        subs.push(receive(`{node.id}.update`, update));

        // make initial call if default value is set--fetchData checks if inputValue() is ''
        fetchData();
    }

    // TODO: Clean up validation Code
    // add validations to the inputvalue
    validations = merge(_.cloneDeep(options.validations), { customError });
    if (validations.expression) {
        if (options.validations.expression.message && !options.validations.expression.term) {
            console.error('[input] if providing a message for expression validation, must also provide term');
            options.validations.expression.term = 'true'; // don't cause exceptions.
        }
        validations.expression.params = [
            options.validations.expression.message ?
                options.validations.expression.term
                : options.validations.expression,
            context.getValue
        ];
    }

    if (options.unique && node.inputType !== 'autocomplete') {
        inputValue.subscribe((oldValue) => {
            context.unique[node.id].remove(oldValue);
        }, null, 'beforeChange');

        inputValue.subscribe((newValue) => {
            if (context.deleteFlag && context.deleteFlag()) { return; }
            context.unique[node.id].push(newValue);
        });

        if (context.deleteFlag) {
            context.deleteFlag.subscribe((deleted) => {
                if (deleted) {
                    context.unique[node.id].remove(inputValue());
                }
            });
        }

        context.unique[node.id].subscribe((newValues) => {
            const occurances = newValues.filter(value =>
                 value === inputValue()
            ).length;

            customError(occurances > 1 ? 'Identifier must be unique' : undefined);
        });
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
        computedValueExpression.subscribe((value) => {
            setValue(value);
        });

        subs.push(computedValueExpression);
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

        dispose() {
            if (viewmodel.dispose) {
                viewmodel.dispose();
            }
            (subs || []).forEach((sub) => {
                sub.dispose && sub.dispose();
            });

            if (options.unique) {
                context.unique[node.id].remove(inputValue());
            }
        }
    });
}


    // implements an input of type
    // text, select, date, radio, checkbox, checkboxList

    // TODO: Refactor Session
    // - createJSDocs
    // - revisit and de-tangle bindings
    // - refactor validations so that the tooltip works without
    // inputText wrapper in the inputType template
    // - move tooltip/helpText in options

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
     *  By specifying an "id" on your input, you are automatically
     * adding your input's data to the data context model.
     * @param {object} node.options
     *  The options pertaining to your specific inputType
     * @param {boolean|string} [node.rendered=true]
     *  Boolean or expression to render the input (or not)
     * @param {array} [node.options.values]
     *  The values that can be chosen from for inputTypes that have selections
     * (e.g. radio, checkboxList)
     * @param {object} [node.options.validations]
     *  KO validations object to validate the inputValue
     * @param {boolean} [node.options.validations.required]
     *  Required validation for ko - also will show * next to label indicating it is required
     * @param {boolean|string} [node.options.readonly=false]
     *  Boolean or expression to set the input as readonly
     * @param {boolean} [node.options.disabled]np
     *  Disables the input (different from readonly)
     * @param {object|string|boolean} [node.options.pattern]
     *  Sets an inputmask for the input. If a string, this is the mask.
     * If an object, gets passed as is.
     *  If boolean = true, uses pattern validation.
     * @param {boolean} [node.options.vertical=false]
     *  For multi-option types (e.g. checkboxList, radio),
     * sets the display to block if true for the options
     */