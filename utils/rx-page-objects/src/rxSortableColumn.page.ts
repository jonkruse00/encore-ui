'use strict';
import {ElementFinder, promise} from 'protractor';
import {Promise, rxComponentElement} from './rxComponent';

export enum SORT_TYPE {
    DESCENDING = -1,
    UNSORTED = 0,
    ASCENDING = 1,
}

/**
 * Functions for interacting with sortable columns. See the example below for a typical
 * pattern you can use in your page objects for generating sortable columns. All examples in the function
 * documentation below will assume that this example has been set up and executed.
 *
 * @example
 *
 *     var myTable = {
 *         get eleTableContainer() { return $('#my-table'); },
 *
 *         column: function (name) {
 *             var column = this.eleTableContainer.element(by.cssContainingText($('rx-sortable-column'), name));
 *             return new rxSortableColumn(column);
 *         }
 *     };
 */
export class rxSortableColumn extends rxComponentElement {
    get btnSort(): ElementFinder {
        return this.$('.sort-action');
    }

    /**
     * The name of the column.
     *
     * @example
     *
     *     it('should have the right name', function () {
     *         expect(myTable.column('Start Date').name).to.eventually.equal('Start Date');
     *     });
     */
    getName(): Promise<string> {
        return this.$('.sort-action .display-value').getText();
    }

    /**
     * Will repeatedly click the sort button until the column is sorted ascending.
     *
     * @example
     *
     *     it('should sort the column ascending', function () {
     *         var column = myTable.column('Stuff');
     *         column.sortAscending();
     *         column.data.then(function (data) {
     *             expect(data.sort()).to.eventually.eql(data);
     *         });
     *     });
     */
    sortAscending(): Promise<void> {
        return this.sort(SORT_TYPE.ASCENDING);
    }

    /**
     * Will repeatedly click the sort button until the column is sorted descending.
     *
     * @example
     *
     *     it('should sort the column descending', function () {
     *         var column = myTable.column('Stuff');
     *         column.sortDescending();
     *         column.data.then(function (data) {
     *             expect(data.sort().reverse()).to.eventually.eql(data);
     *         });
     *     });
     */
    sortDescending(): Promise<void> {
        return this.sort(SORT_TYPE.DESCENDING);
    }

    /**
     * The current sort direction of the column.
     * @see [[SORT_TYPE]]
     */
    getSortDirection(): Promise<SORT_TYPE> {
        let sortIcon = this.$('.sort-direction-icon');

        return sortIcon.isPresent().then(present => {
            if (!present) {
                // Wrapping this in a promise for consistent return types.
                // necessary to avoid typescript warnings in the simplest possible way.
                return promise.fulfilled(SORT_TYPE.UNSORTED);
            }
            return sortIcon.getAttribute('class').then(className => {
                return (className.indexOf('ascending') > -1 ? SORT_TYPE.ASCENDING : SORT_TYPE.DESCENDING);
            });
        });
    }

    /**
     * Prefer using [[rxSortableColumn.sortAscending]] and [[rxSortableColumn.sortDescending]] over this.
     * This method is provided mostly for the purposes of providing an override target for custom subclassed,
     * sortable columns.
     */
    protected sort(desiredSort: SORT_TYPE): Promise<void> {
        this.btnSort.click();
        return this.getSortDirection().then(sortDirection => {
            if (sortDirection !== desiredSort) {
                this.btnSort.click();
            }
        });
    };
}
