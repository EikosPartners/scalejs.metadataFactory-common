export default {
    'grid-basic-search-input': function () {
        return {
            textInput: this.context.search,
            event: {
                focus: () => this.placeholder(false),
                blur: () => {
                    if (!this.context.search()) {
                        this.placeholder(true);
                    }
                }
            }
        };
    }
};