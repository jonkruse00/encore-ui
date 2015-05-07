var Page = require('astrolabe').Page;
var _ = require('lodash');
var rxMultiSelectPage = require('../rxSelectFilter.page').rxMultiSelect;
var rxSelectFilterPage = require('../rxSelectFilter.page').rxSelectFilter;
var exercise = require('../rxSelectFilter.exercise');

describe('rxMultiSelect', function () {

    before(function () {
        demoPage.go('#/component/rxSelectFilter');
    });

    describe('exercises', exercise.rxMultiSelect({
        inputs: ['Type A', 'Type B', 'Type C']
    }));

});

var table = Page.create({
    getDataForColumn: {
        value: function (column) {
            return element.all(by.repeater('ticket in').column(column)).map(function (cell) {
                return cell.getText();
            }).then(_.uniq).then(_.sortBy);
        }
    },

    accounts: {
        get: function () {
            return this.getDataForColumn('ticket.account');
        }
    },

    statuses: {
        get: function () {
            return this.getDataForColumn('ticket.status');
        }
    }
});

describe('rxSelectFilter', function () {
    var rxSelectFilter;

    before(function () {
        demoPage.go('#/component/rxSelectFilter');
        rxSelectFilter = rxSelectFilterPage.main;
    });

    it('shows all the table data', function () {
        rxSelectFilter.apply({
            Account: { All: true },
            Status: { All: true }
        });

        expect(table.accounts).to.eventually.eql(['A', 'B']);
        expect(table.statuses).to.eventually.eql(['IN_PROGRESS', 'NEW', 'TRANSFERRED', 'VENDOR']);
    });

    it('filters the table data by the status', function () {
        rxSelectFilter.apply({
            Status: { All: false, Transferred: true }
        });

        expect(table.accounts).to.eventually.eql(['A', 'B']);
        expect(table.statuses).to.eventually.eql(['TRANSFERRED']);
    });

    it('filters the table data by the account', function () {
        rxSelectFilter.apply({
            Account: { All: false, B: true },
            Status: { All: true }
        });

        expect(table.accounts).to.eventually.eql(['B']);
        expect(table.statuses).to.eventually.eql(['TRANSFERRED', 'VENDOR']);
    });
});
