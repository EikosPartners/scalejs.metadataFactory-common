/*global define,sandbox */
import sandbox from 'scalejs.sandbox';
import autocompleteViewModel from './autocomplete/autocompleteViewModel';
import selectViewModel from './select/selectViewModel';
import dataservice from 'dataservice';
import _ from 'lodash';
import ko from 'knockout';
import moment from 'moment';
    
    // imports
    var observable = sandbox.mvvm.observable,
        observableArray = sandbox.mvvm.observableArray,
        computed = sandbox.mvvm.computed,
        evaluate = sandbox.expression.evaluate,
        merge = sandbox.object.merge,
        extend = sandbox.object.extend,
        has = sandbox.object.has,
        get = sandbox.object.get,
        is = sandbox.type.is,
        unwrap = ko.unwrap,
        inputTypes = {
            autocomplete: autocompleteViewModel,
            select: selectViewModel
        }

    // inputViewModel
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
    export default function inputViewModel(node) {
        var options = node.options || {},
            keyMap = node.keyMap || {},
            context = this || {},
            inputValue = createInputValue(),
            // values are used in radio, checkbox, checkboxList
            values = observableArray(Array.isArray(options.values) ? options.values : []),
            isShown = observable(!node.hidden),
            hasFocus = observable(),
            validations = options.validations || null,
            required = validations ? validations.required : false,
            context = this || {},
            disabled = observable(options.disabled),
            readonly = createReadonly(),
            maxlength = validations && validations.maxLength,
            pattern = options.pattern === true ?  getPattern() : options.pattern,
            tooltipShown = observable(false), //for patterns
            shake = observable(false),
            customError = observable(),
            //specific datepicker
            hover = observable(),
            datePlaceholder = node.inputType === 'datepicker' && ko.pureComputed(function () {
                var placeholder = !hover() || hasFocus() ? '' : 'mm/dd/yyyy';
                return placeholder;
            }),
            setValueFuncs,
            visible,
            validations,
            subs = [],
            wasModified,
            computedValueExpression,
            formatters = {
                dateFormatter: dateFormatter
            },
            format = options.values && options.values.textFormatter ? formatters[options.values.textFormatter] : _.identity,
            registeredAction,
            viewmodel = {
                mapItem: mapItem,
                inputValue: inputValue,
                hasFocus: hasFocus,
                format: format,
                subs: subs,
                readonly: readonly
            };

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

        function createReadonly() {
            if (options.readonly) {
                return observable(options.readonly)
            } else if (context.readonly) {
                return observable(context.readonly())
            } else {
                return observable(false)
            }
        }

        function dateFormatter(date) {
            return moment(date).format('MM/DD/YYYY');
        }

        function mapItem(mapper) {
            var textKey = Array.isArray(mapper.textKey) ? mapper.textKey : [mapper.textKey],
                valueKey = Array.isArray(mapper.valueKey) ? mapper.valueKey : [mapper.valueKey],
                delimeter = mapper.delimeter || ' / ',
                textFormatter = formatters[mapper.textFormatter] || _.identity

            return function (val) {
                return {
                    text: textFormatter(textKey.map(function(k) {
                        return val[k];
                    }).join(mapper.delimiter || ' / ')),
                    value: valueKey.map(function(k) {
                        return val[k];
                    }).join(mapper.delimiter || ' / '),
                    original: val
                }
            }
        }

        // validates the input by setting isModified to true
        // returns true if the input has an error
        function validate() {
           inputValue.isModified(true);
           return !inputValue.isValid() && isShown() && this.rendered() && inputValue.severity() === 1;
        }

        // implicitly determine pattern if there is a validation
        function getPattern() {
            if (validations && validations.pattern) {
                return {
                    alias: 'Regex',
                    regex: validations.pattern.params
                };
            }
        }

        // returns the message to be displayed (based on validations)
        function visibleMessage() {
            var inputMessage, message;
            
            if (!inputValue.isModified() || inputValue.isValid() || !this.rendered() || !isShown()) {
                // the user has yet to modify the input
                // or there is no message. return nothing
                return;
            }

            inputMessage = inputValue.error();
            inputMessage = inputMessage[inputMessage.length -1] === '.' ? inputMessage : inputMessage + '.';            

            if (inputMessage === 'Required.') {
                message = (node.errorLabel || node.label) + ' is required.';
            } else {
                message = (node.errorLabel || node.label) + ' is invalid. ' + inputMessage;
            }

            return {
                message: message,
                severity: inputValue.severity(),
                onClick: function () {
                    hasFocus(true);
                }
            };
        }


        // default getValue function just unwraps inputValue
        // todo: refactor 'inputValue' to 'data'
        function getValue() {
            return inputValue() || '';
        }

        function setValue(data) {
            var value = is(data, 'object') ? data.value : data,
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
            if(!wasModifed) { inputValue.isModified(false); }
        }

        // to replace setValue accepts object or value
        function update(data) {
            if(data.hasOwnProperty('value')) {
                setValue(data.value);
            }
            if(data.hasOwnProperty('ErrorMessage')) {
                customError(data.ErrorMessage);
            }
        }

        function assignDate(value, params) {
            if (!is(params, 'object')) {
                console.error('Assign date only supports object params', params);
                return;
            }
            var newDate = moment(value).add(params).format(options.rawFormat || 'YYYY-MM-DD');
           setValue(newDate);
        }

        function setDisabled(value) {
            if(value === 'toggle') {
                disabled(!disabled());
                return;
            }
            disabled(value);
        }

        function setReadonly (bool) {
          readonly(bool)
        }

        if (inputTypes[node.inputType]) {
            extend(viewmodel, inputTypes[node.inputType].call(context, node, viewmodel));
        }

        if (node.inputType === 'checkbox') {
            values.subscribe(function (newValues) {
                if(newValues.indexOf(options.checked) !== -1) {
                    inputValue(options.checked);
                } else {
                    inputValue(options.unchecked);
                }
            });
            if(inputValue() === options.checked) {
              values.push(options.checked);
            }
        }

        // make min/max date into observables
        if (options.minDate) {
            options.minDate = ko.observable(options.minDate);
        }

        if (options.maxDate) {
            options.maxDate = ko.observable(options.maxDate);
        }

        // make sure this was bound
        if(!context.metadata) {
            console.error('context not being passed to input viewmodel', node);
        }

        if (options.registered){
            registeredAction = sandbox.metadataFactory.createViewModel.call(this, {
                type: 'action',
                actionType: 'ajax',
                options: merge(options.registered, { data: {} })
            });

            inputValue.subscribe(function (newValue) {
                registeredAction.options.data[node.id] = newValue; //our own sub gets called before context is updated
                if(newValue !== ''){
                    registeredAction.action({ callback: function (error, data) {
                        Object.keys(data).forEach(function (key) {
                            if(!context.dictionary && !context.data) {
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
                    }});
                }
            });
        }

        // add validations to the inputvalue
        validations = merge(_.cloneDeep(options.validations), { customError:  customError });
        if (validations.expression) {
            validations.expression.params = [
                options.validations.expression.message ?
                    options.validations.expression.term
                    : options.validations.expression,
                context.getValue
            ]
        }
        if(viewmodel.validations) {
            validations = merge(validations, viewmodel.validations);
        }
        inputValue = inputValue.extend(validations);

        // specific setValueFunc for checkboxList
        setValueFuncs = {
            checkboxList: function (data) {
                if(Array.isArray(data.value)) {
                    inputValue(data.value);
                } else if(data.value !== null && data.value !== undefined) {
                    inputValue([data.value]);
                } else {
                    inputValue([]);
                }
            }
        };

        // visible binding using expressions and context's getValue func
        if (has(node.visible)) {
            is(node.visible, 'boolean') ? isShown(node.visible) : (visible = computed(function() {
                return evaluate(node.visible, context.getValue || function () {
                    console.error('Cannot use visible binding without context get value', node);
                });
            }));
            // isShown is an observable that can be updated by rules so when visible changes so must isShown
            isShown(visible());
            visible.subscribe(isShown);
        }

        // allows us to set values on an input from expression
        // usecase: issuerId coming from noticeboard
        if (options.valueExpression) {
            computedValueExpression = computed(function () {
                if (options.allowSet === false) {
                    inputValue(); // re-eval when inputValue is set
                }
                return evaluate(options.valueExpression, context.getValue);
            });
            setValue(computedValueExpression());
            computedValueExpression.subscribe(function(value) {
                setValue(value);
            });
            subs.push(computedValueExpression)
        }
        
        if (get(options, 'pattern.alias') === 'percent') {
            inputValue.subscribe(function (value) {
                if(value && isFinite(Number(value))) {
                    inputValue(Number(value).toFixed(3));
                }
            });
        }

        shake.subscribe(function(){
            if(shake()) {
                setTimeout(shake.bind(null,false), 1000);
            }
        });

        return merge(node, viewmodel, {
            inputValue: inputValue,
            values: viewmodel.values || values,
            visibleMessage: visibleMessage,
            customError: customError,
            hasFocus: hasFocus,
            hover: hover,
            datePlaceholder: datePlaceholder,
            assignDate: assignDate,
            setDisabled: setDisabled,
            isShown: isShown,
            required: required,
            readonly: readonly,
            setReadonly: viewmodel.setReadonly || setReadonly,
            disabled: disabled,
            maxlength: maxlength,
            pattern: pattern,
            tooltipShown: tooltipShown,
            shake: shake,
            validate: viewmodel.validate || validate,
            options: options,
            context: this,
            error: inputValue.error,
            getValue: viewmodel.getValue || getValue,
            setValue: setValue,
            update: update,
            dispose: function () {
                if(viewmodel.dispose) {
                    viewmodel.dispose();
                }
                (subs || []).forEach(function(sub) {
                    sub.dispose && sub.dispose();
                });
            }
        });
    };

