import { notify } from 'scalejs.messagebus';

export default {
    'grid-advanced-filter-template': function () {
        return {
            template: {
                name: 'metadata_item_template',
                data: this.advancedFilter
            },
            visible: this.filterIsVisible
        };
    },
    'grid-advanced-filter-clickOff': function () {
        const id = this.id;
        return {
            event: {
                keypress: (data, e) => {
                    if (e.keyCode === 13) {
                        e.target.dispatchEvent(new Event('change'));
                        notify(`${id}.filter`);
                        return false;
                    }
                    return true;
                }
            },
            clickOff: {
                handler: () => this.filterIsVisible(false),
                excludes: ['ui-autocomplete']
            },
            css: this.classes
        };
    },
    'grid-advanced-filter-toggle': function () {
        return {
            click: () => this.filterIsVisible(!this.filterIsVisible()),
            text: this.filterText
        };
    }
};