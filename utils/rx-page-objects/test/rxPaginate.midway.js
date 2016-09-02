var Page = require('astrolabe').Page;

// rowFromElement and table are anonymous page objects to assist with table data
var rowFromElement = function (rowElement) {
    return Page.create({

        name: {
            get: function () {
                return rowElement.element(by.binding('name')).getText();
            }
        },

        os: {
            get: function () {
                return rowElement.element(by.binding('os')).getText();
            }
        },
    });
};

var repeaterString = 'server in pagedServers.items';
var tableSelector = '.demo-api-pagination';
var table = Page.create({

    tblResults: {
        get: function () {
            return element.all(by.repeater(repeaterString));
        }
    },

    count: {
        value: function () {
            return this.tblResults.count();
        }
    },

    row: {
        value: function (rowIndex) {
            return rowFromElement(this.tblResults.get(rowIndex));
        }
    },

    column: {
        value: function (columnName) {
            var column = element(by.cssContainingText(tableSelector + ' rx-sortable-column', columnName));
            return encore.rxSortableColumn.initialize(column, repeaterString);
        }
    },

    textFilter: {
        get: function () {
            return encore.rxSearchBox.initialize($('rx-search-box')).term;
        },
        set: function (filterTerm) {
            encore.rxSearchBox.initialize($('rx-search-box')).term = filterTerm;
        }
    },

    selectFilter: {
        value: function (filterData) {
            encore.rxSelectFilter.initialize($('rx-select-filter')).apply(filterData);
        }
    },

    pagination: {
        get: function () {
            return encore.rxPaginate.initialize($('.demo-api-pagination .rx-paginate'));
        }
    }

});

describe('rxPaginate', function () {

    before(function () {
        demoPage.go('#/components/rxPaginate');
    });

    describe('Non present pagination exercise', encore.exercise.rxPaginate({
        instance: encore.rxPaginate.initialize($('#does-not-exist')),
        isPresent: false
    }));

    describe('UI pagination exercises', encore.exercise.rxPaginate({
        pageSizes: [3, 50, 200, 350, 500],
        defaultPageSize: 3,
        instance: encore.rxPaginate.initialize($('.demo-ui-pagination .rx-paginate'))
    }));

    describe('API pagination exercises', encore.exercise.rxPaginate({
        pageSizes: [25, 50, 200, 350, 500],
        defaultPageSize: 25,
        pages: 30,
        instance: table.pagination
    }));

    describe('Filter and sort tests', function () {
        var nameColumn = table.column('Name');
        var osColumn = table.column('OS');

        beforeEach(function () {
            encore.rxMisc.scrollToElement(table.tblResults);
            table.textFilter = '';
            table.selectFilter({
                Os: { All: true }
            });
            nameColumn.sortAscending();
        });

        it('should get new items when filter text is entered', function () {
            table.textFilter = 'Ubuntu';
            expect(table.row(0).name).to.eventually.equal('Server 3');
            expect(table.row(0).os).to.eventually.equal('Ubuntu 13.04');
        });

        it('should get new items when the select filter is used', function () {
            table.selectFilter({
                Os: {
                    All: false,
                    Centos: true
                }
            });
            expect(table.row(0).name).to.eventually.equal('Server 2');
            expect(table.row(0).os).to.eventually.equal('CentOS 6.4');
        });

        it('should sort the Name column descending', function () {
            nameColumn.sortDescending();
            expect(table.row(0).name).to.eventually.equal('Server 701');
        });

        it('should sort the OS column descending', function () {
            osColumn.sortDescending();
            expect(table.row(0).os).to.eventually.equal('Ubuntu 13.04');
        });

    });
});
