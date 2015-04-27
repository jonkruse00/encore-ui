var rxMultiSelect = require('./rxSelectFilter.page').rxMultiSelect;
var _ = require('lodash');

/**
   rxMultiSelect exercises.
   @exports encore.exercise.rxMultiSelect
   @param {Object} [options=] - Test options. Used to build valid tests.
   @param {string} [options.cssSelector=] - Fallback selector string to initialize widget with.
   @param {Object} [options.inputs=[]] - The options of the select input.
   @example
   ```js
   describe('default exercises', encore.exercise.rxMultiSelect({
       cssSelector: '.my-form rx-multi-select', // select one of many widgets on page
   }));
   ```
 */
exports.rxMultiSelect = function (options) {
    if (options === undefined) {
        options = {};
    }

    options = _.defaults(options, {
        inputs: []
    });

    return function () {
        var component;

        before(function () {
            if (options.cssSelector === undefined) {
                component = rxMultiSelect.main;
            } else {
                component = rxMultiSelect.initialize($(options.cssSelector));
            }
        });

        it('hides the menu initially', function () {
            expect(component.isOpen()).to.eventually.be.false;
        });

        it('shows the menu when clicked', function () {
            component.openMenu();
            expect(component.isOpen()).to.eventually.be.true;
        });

        it('selects no options', function () {
            component.unselect(['All']);
            expect(component.selectedOptions).to.eventually.be.empty;
            expect(component.preview).to.eventually.equal('None');
        });

        it('selects a single option', function () {
            var input = _.first(options.inputs);
            component.select([input]);
            expect(component.selectedOptions).to.eventually.eql([input]);
            expect(component.preview).to.eventually.equal(input);
        });

        it('selects multiple options', function () {
            var inputs = options.inputs.slice(0, 2);
            component.select(inputs);
            expect(component.selectedOptions).to.eventually.eql(inputs);
            expect(component.preview).to.eventually.equal('Multiple');
        });

        it('selects all options', function () {
            component.select(['All']);
            expect(component.selectedOptions).to.eventually.eql(['All'].concat(options.inputs));
            expect(component.preview).to.eventually.equal('All');
        });

        it('unselects all options', function () {
            component.unselect(['All']);
            expect(component.selectedOptions).to.eventually.be.empty;
            expect(component.preview).to.eventually.equal('None');
        });

        it('hides the menu when another element is clicked', function () {
            var parent = component.rootElement.element(by.xpath('..'));
            browser.actions().mouseDown(parent).mouseUp().perform();
            expect(component.isOpen()).to.eventually.be.false;
        });

    };
};
