'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _scalejs = require('scalejs');

var _jsFormat = require('js-format');

var format = _interopRequireWildcard(_jsFormat);

require('knockout-jqautocomplete/build/knockout-jqAutocomplete');

require('ko-bindings/showAllAuto');

require('ko-bindings/timepicker');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

exports.default = {
    'input-input': function inputInput() {
        var pattern,
            tooltipShown = this.tooltipShown,
            shake = this.shake,
            value = this.inputValue;

        if (typeof this.pattern === 'string') {
            pattern = {
                mask: this.pattern
            };
        } else {
            pattern = this.pattern;
        }
        if (pattern) {
            pattern.onKeyValidation = function (result) {
                tooltipShown(!result);
                shake(!result);
            };
            pattern.placeholder = ' ';
        }

        return {
            value: value,
            validationElement: false,
            hasFocus: this.hasFocus,
            disable: this.readonly() || this.disabled(),
            css: { 'animated shake': this.shake },
            attr: {
                readonly: this.readonly(),
                maxlength: this.maxlength,
                'data-id': this.id
            },
            inputmask: pattern
        };
    },
    'input-time': function inputTime(ctx) {
        var tooltipShown = this.tooltipShown,
            shake = this.shake,
            value = this.inputValue,
            timeFormat = this.timeFormat,
            css = { 'animated shake': shake };

        if (this.classes) {
            css[this.classes] = true;
        }
        return {
            timepicker: {
                data: value,
                timeFormat: timeFormat
            },
            validationElement: false,
            hasFocus: this.hasFocus,
            disable: this.readonly() || this.disabled(),
            css: css,
            attr: {
                readonly: this.readonly(),
                'data-id': this.id,
                title: value
            }
        };
    },
    'input-autocomplete': function inputAutocomplete(ctx) {
        var pattern,
            tooltipShown = this.tooltipShown,
            value = this.inputValue,
            disabled = this.readonly() ? true : false;
        var disableHasFocus = ctx.$parents.filter(function (parent) {
            return parent.disableHasFocus;
        })[0];
        if (typeof this.pattern === 'string') {
            pattern = {
                mask: this.pattern
            };
        } else {
            pattern = this.pattern;
        }
        if (pattern) {
            pattern.onKeyValidation = function (result) {
                tooltipShown(!result);
            };
        }

        return {
            jqAuto: {
                value: value,
                source: this.autocompleteSource,
                valueProp: 'value',
                labelProp: 'label',
                inputProp: this.inputProp || 'label'
                //disabled: disabled
                //Note: pasing disabled to the jquery autocomplete control might have unexpected behaviour
                //the options get passed straight thru to the jquery autocomplete
                //if disabled changes, will the binding be re-initialized? Not sure
                //this is why i created this issue to ask the creator of bindings
                //https://github.com/rniemeyer/knockout-classBindingProvider/issues/23

            },
            attr: {
                readonly: this.readonly(),
                'data-id': this.id
            },
            hasFocus: !disableHasFocus && this.hasFocus,
            validationElement: false,
            showAllAuto: (0, _scalejs.has)(this.options.showAllSearch) ? this.options.showAllSearch : '',
            disable: disabled // use knockout disable binding - its sufficient. See "showAllAuto" binding for more details
        };
    },
    'input-multiselect': function inputMultiselect() {
        return {
            tokeninputValue: this.inputValue,
            tokeninputSource: this.values().map(function (x) {
                return {
                    id: x.value || x,
                    name: x.text || x
                };
            }),
            tokeninputDisable: this.readonly
        };
    },
    'input-datepicker': function inputDatepicker(ctx) {
        var options = this.options,
            hover = this.hover,
            pattern;

        //when will datepicker be anything but a date? do we need the pattern?
        // if (typeof this.pattern === 'string') {
        //     pattern = {
        //         mask: this.pattern
        //     };
        // } else if (this.pattern) {
        //     pattern = this.pattern;
        // } else {
        pattern = {
            alias: 'date'
        };
        // }
        pattern.autoUnmask = false; // do we still need?
        // pattern.insertMode = true;

        var obj = {
            hover: this.hover,
            datepicker: {
                data: this.inputValue,
                rawFormat: options.rawFormat || 'YYYY-MM-DD',
                format: options.format || 'MM/DD/YYYY',
                maxDate: options.maxDate,
                minDate: options.minDate,
                enabledDate: options.enabledDate,
                disableWeekends: options.disableWeekends,
                errorObservable: this.customError,
                errorMessage: options.disabledDateMessage,
                utc: options.utc
            },
            validationElement: false,
            hasFocus: this.hasFocus,
            disable: this.readonly,
            attr: {
                readonly: this.readonly(),
                maxlength: this.maxlength,
                placeholder: this.datePlaceholder,
                'data-id': this.id
            },
            inputmask: pattern
        };
        return obj;
    },
    'input-validation-checker': function inputValidationChecker(ctx) {
        var value = this.inputValue,
            shake = this.shake,
            tooltipShown = this.tooltipShown,
            customError = this.customError;

        var resetShake = function resetShake() {
            if (customError.peek()) {
                return true; // dont shake if there is still a server error
            }
            if (value.isValid && value.isValid() && value.isModified()) {
                shake(false);
                tooltipShown(false);
            }
            if (value.isValid && !value.isValid() && value.isModified()) {
                shake(true);
                tooltipShown(true);
            }
            return true;
        };

        return {
            event: {
                blur: resetShake,
                change: resetShake
            },
            css: {
                'animated shake': this.shake,
                'error': value.isModified() && !value.isValid() && value.severity() === 1,
                'warning': value.isModified() && !value.isValid() && value.severity() === 2,
                'validated': value.isModified() && !value.isValid() && value.severity() === 3
            }
        };
    },
    'input-select': function inputSelect(ctx) {
        // if values contains a string, throw an error
        (this.values() || []).forEach(function (val) {
            if (typeof val === 'string') {
                console.error('Values must not contain strings!!', ctx);
            }
        });

        return {
            value: this.inputValue,
            hasFocus: this.hasFocus,
            validationElement: false,
            options: this.values,
            attr: {
                disabled: this.readonly,
                'data-id': this.id
            },
            optionsText: 'text',
            optionsValue: 'value',
            valueAllowUnset: true
        };
    },
    'input-checkbox': function inputCheckbox() {
        return {
            foreach: this.values,
            attr: {
                'data-id': this.id
            }

        };
    },
    'input-checkbox-button': function inputCheckboxButton(ctx) {
        return {
            checked: this.values,
            value: this.options.checked,
            attr: {
                disabled: this.readonly(),
                id: this.id
            }
        };
    },
    'input-checkbox-button-group': function inputCheckboxButtonGroup(ctx) {
        return {
            value: this['value'],
            attr: {
                disabled: ctx.$parent.readonly()
            },
            checked: ctx.$parent.inputValue
        };
    },
    'input-radio': function inputRadio() {
        if (this.values().length === 0) {
            this.values([{ text: 'Yes', value: (0, _scalejs.get)(this, 'yesValue', true) }, { text: 'No', value: (0, _scalejs.get)(this, 'noValue', false) }]);
        }

        var values = this.values().map(function (val) {
            if (typeof val === 'string') {
                return {
                    text: val,
                    value: val
                };
            }
            return val;
        });

        return {
            foreach: values,
            attr: {
                'data-id': this.id
            }
        };
    },
    'input-radio-button': function inputRadioButton(ctx) {
        return {
            value: this.value,
            checked: ctx.$parent.inputValue,
            attr: {
                disabled: ctx.$parent.readonly()
            },
            event: {
                // for 508
                keyup: function keyup(d, e) {
                    if (e.keyCode === 13) {
                        if (ctx.$parent.inputValue() === this.value) {
                            ctx.$parent.inputValue(undefined);
                        } else {
                            ctx.$parent.inputValue(this.value);
                        }
                    }
                }
            }
        };
    },
    'input-validation': function inputValidation(ctx) {
        var inputValue = this.inputValue,
            visible = !this.tooltip ? inputValue.isModified() && !inputValue.isValid() : inputValue.isModified() && !inputValue.isValid() && !this.hasFocus();

        if (!inputValue.isValid) {
            return {}; // no validation on input, no binding needed
        }

        return {
            visible: visible,
            text: inputValue.error,
            css: {
                'validation-message': true,
                'error': inputValue.severity() === 1,
                'warning': inputValue.severity() === 2,
                'validated': inputValue.severity() === 3
            }
        };
    },
    'input-tooltip': function inputTooltip() {
        var value = this.inputValue;

        return {
            visible: this.tooltipShown() && this.hasFocus() && this.tooltip,
            text: this.tooltip,
            css: {
                'validation-message': true,
                'tooltip': true,
                'error': value.isModified() && !value.isValid() && value.severity() === 1,
                'warning': value.isModified() && !value.isValid() && value.severity() !== 1
            }
        };
    },
    'input-color-text': function inputColorText() {
        var value = this.inputValue;

        return {
            css: {
                'color-error': value.isModified() && !value.isValid() && value.severity() === 1,
                'color-warning': value.isModified() && !value.isValid() && value.severity() !== 1,
                'color-validated': value.isModified() && !value.isValid() && value.severity() !== 1
            }
        };
    },
    'input-labels': function inputLabels() {
        var label = this.label,
            required = this.required ? '<span class="input-required-label">*</span> ' : '';

        var showLabel = true;
        if (this.options) {
            showLabel = this.options.showLabel === false ? false : showLabel;
        }

        return {
            html: required + label,
            visible: showLabel
        };
    },
    'input-labels-only': function inputLabelsOnly() {
        return {
            text: this.getValue()
        };
    },
    'input-autosize': function inputAutosize() {
        return {
            autosize: true,
            attr: {
                disabled: this.readonly()
            }
        };
    }
};
//# sourceMappingURL=inputBindings.js.map