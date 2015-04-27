/*jshint node:true*/
var Page = require('astrolabe').Page;
var _ = require('lodash');

var selectOptionFromElement = function (optionElement) {

    return Page.create({

        /**
         * @memberof rxMultiSelect.option
         * @returns {string} The text inside of the current option.
         */
        text: {
            get: function () {
                return optionElement.getText();
            }
        },

        /**
           Selects the option in the dropdown.
           @memberof rxMultiSelect.option
           @function
           @returns {undefined}
         */
        select: {
            value: function () {
                return this.isSelected().then(function (selected) {
                    if (!selected) {
                        optionElement.$('input').click();
                    }
                });
            }
        },

        /**
           Unselects the option in the dropdown.
           @memberof rxMultiSelect.option
           @function
           @returns {undefined}
         */
        unselect: {
            value: function () {
                return this.isSelected().then(function (selected) {
                    if (selected) {
                        optionElement.$('input').click();
                    }
                });
            }
        },

        /**
           @memberof rxMultiSelect.option
           @returns {string} The value bound to the option.
         */
        value: {
            get: function () {
                return optionElement.getAttribute('value');
            }
        },

        /**
           @memberof rxMultiSelect.option
           @function
           @returns {Boolean} Whether or not the option is currently selected.
         */
        isSelected: {
            value: function () {
                return optionElement.$('input').isSelected();
            }
        }

    });
};

/**
 * @namespace
 */
var rxMultiSelect = {

    /**
       Close the menu
       @memberof rxMultiSelect
       @function
       @returns {undefined}
     */
    closeMenu: {
        value: function () {
            var self = this;
            this.isOpen().then(function (isOpen) {
                if (isOpen) {
                    self.rootElement.$('.rx-multi-select').click();
                }
            });
        }
    },

    /**
       Open the menu
       @memberof rxMultiSelect
       @function
       @returns {undefined}
     */
    openMenu: {
        value: function () {
            var self = this;
            this.isOpen().then(function (isOpen) {
                if (!isOpen) {
                    self.rootElement.$('.rx-multi-select').click();
                }
            });
        }
    },

    /**
       @memberof rxMultiSelect
       @function
       @returns {boolean} - Whether or not the menu is visible.
     */
    isOpen: {
        value: function () {
            return this.rootElement.$('ul').isDisplayed();
        }
    },

    /**
       @memberof rxMultiSelect
       @returns {string} The preview text for the dropdown.
     */
    preview: {
        get: function () {
            // getText() will include the text of the options as well as the preview
            return this.rootElement.getText().then(function (text) {
                return text.split('\n')[0];
            });
        }
    },

    /**
       @memberof rxMultiSelect
       @returns {string[]} The text of each option element in the dropdown.
     */
    options: {
        get: function () {
            return this.rootElement.$$('rx-select-option').map(function (optionElement) {
                return selectOptionFromElement(optionElement).text;
            });
        }
    },

    /**
       @memberof rxMultiSelect
       @returns {string[]} The value of each option element in the dropdown.
     */
    values: {
        get: function () {
            return this.rootElement.$$('rx-select-option').map(function (optionElement) {
                return selectOptionFromElement(optionElement).value;
            });
        }
    },

    /**
       @memberof rxMultiSelect
       @returns {optionTexts[]} Array of strings representing the currently selected options.
     */
    selectedOptions: {
        get: function () {
            this.openMenu();
            return this.rootElement.$$('rx-select-option').reduce(function (accumulator, optionElement) {
                var option = selectOptionFromElement(optionElement);
                return option.isSelected().then(function (isSelected) {
                    if (isSelected) {
                        return option.text.then(function (text) {
                            accumulator.push(text);
                            return accumulator;
                        });
                    } else {
                        return accumulator;
                    }
                });
            }, []);
        }
    },

    /**
       @namespace
       @memberof rxMultiSelect
       @param {string} optionText - Partial or total string matching the desired option.
       @returns {rxMultiSelect.option} Page object representing an option.
     */
    option: {
        value: function (optionText) {
            var optionElement = this.rootElement.element(by.cssContainingText('rx-select-option', optionText));
            return selectOptionFromElement(optionElement);
        }
    },

    /**
       @memberof rxMultiSelect
       @function
       @param {string[]} optionTexts - Array of partial or total strings matching the desired options to select.
       @returns {undefined}
     */
    select: {
        value: function (optionTexts) {
            var self = this;
            this.openMenu();
            optionTexts.forEach(function (optionText) {
                self.option(optionText).select();
            });
        }
    },

    /**
       @memberof rxMultiSelect
       @function
       @param {string[]} optionTexts - Array of partial or total strings matching the desired options to unselect.
       @returns {undefined}
     */
    unselect: {
        value: function (optionTexts) {
            var self = this;
            this.openMenu();
            optionTexts.forEach(function (optionText) {
                self.option(optionText).unselect();
            });
        }
    }

};

/**
 * @exports encore.rxMultiSelect
 */
exports.rxMultiSelect = {

    /**
       @function
       @param {WebElement} rxMultiSelectElement - WebElement to be transformed into an rxMultiSelectElement object.
       @returns {rxMultiSelect} Page object representing the rxSelectFilter object.
     */
    initialize: function (rxMultiSelectElement) {
        rxMultiSelect.rootElement = {
            get: function () { return rxMultiSelectElement; }
        };
        return Page.create(rxMultiSelect);
    },

    /**
       @returns {rxMultiSelect} Page object representing the _first_ rxMultiSelect object found on the page.
    */
    main: (function () {
        rxMultiSelect.rootElement = {
            get: function () { return $('rx-multi-select'); }
        };
        return Page.create(rxMultiSelect);
    })()

};

/**
   @namespace
 */
var rxSelectFilter = {

    /**
       @function
       @param {string} label - The label of the rxMultiSelect dropdown.
       @returns {rxMultiSelect} Page object representing the rxSelectFilter object.
     */
    multiSelectByLabel: {
        value: function (label) {
            var selectWrapper = element(by.cssContainingText('.select-wrapper', label));
            return exports.rxMultiSelect.initialize(selectWrapper.$('rx-multi-select'));
        }
    },

    /**
       @function
       @param {Object} filterData - Key-value pairs of the rxMultiSelects' labels and their options to select.
                                    The value is an object, where the keys are the options and the values indicate
                                    if the option should be selected or unselected.
       @returns {undefined}
       @example
       ```js
        multiSelect.filter({
            Account: {
                All: false,
                B: true
            }
        });
       ```
     */
    apply: {
        value: function (filterData) {
            var self = this;
            _.each(filterData, function (options, label) {
                var multiSelect = self.multiSelectByLabel(label);
                _.each(options, function (shouldSelect, option) {
                    if (shouldSelect) {
                        multiSelect.select([option]);
                    } else {
                        multiSelect.unselect([option]);
                    }
                });
                multiSelect.closeMenu();
            });
        }
    }

};

/**
   @exports encore.rxSelectFilter
 */
exports.rxSelectFilter = {

    /**
       @function
       @param {WebElement} rxSelectFilterElement - WebElement to be transformed into an rxSelectFilterElement object.
       @returns {rxSelectFilter} Page object representing the rxSelectFilter object.
     */
    initialize: function (rxSelectFilterElement) {
        rxSelectFilter.rootElement = {
            get: function () { return rxSelectFilterElement; }
        };
        return Page.create(rxSelectFilter);
    },

    /**
       @returns {rxSelectFilter} Page object representing the _first_ rxSelectFilter object found on the page.
    */
    main: (function () {
        rxSelectFilter.rootElement = {
            get: function () { return $('rx-select-filter'); }
        };
        return Page.create(rxSelectFilter);
    })()

};
