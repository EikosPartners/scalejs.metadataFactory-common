'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = {
    'grid-basic-search-input': function gridBasicSearchInput() {
        var _this = this;

        return {
            textInput: this.context.search,
            event: {
                focus: function focus() {
                    return _this.placeholder(false);
                },
                blur: function blur() {
                    if (!_this.context.search()) {
                        _this.placeholder(true);
                    }
                }
            }
        };
    }
};
//# sourceMappingURL=gridBasicFilterBindings.js.map