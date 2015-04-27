/* jshint node: true */

describe('rxMultiSelect', function () {
    var scope, compile, rootScope, createDirective;
    var transcludedTemplate = '<rx-multi-select ng-model="types">' +
                              '<rx-select-option value="A">Type A</rx-select-option>' +
                              '<rx-select-option value="B">Type B</rx-select-option>' +
                              '<rx-select-option value="C">Type C</rx-select-option>' +
                              '</rx-multi-select>';
    var optionsTemplate = '<rx-multi-select ng-model="types" options="options"></rx-multi-select>';

    beforeEach(function () {
        module('encore.ui.rxSelectFilter');

        module('templates/rxMultiSelect.html');
        module('templates/rxSelectOption.html');

        inject(function ($rootScope, $compile) {
            rootScope = $rootScope;
            scope = $rootScope.$new();
            compile = $compile;
        });

        scope.options = ['A', 'B', 'C'];

        createDirective = function (template) {
            return helpers.createDirective(template, compile, scope);
        };
    });

    [transcludedTemplate, optionsTemplate].forEach(function (template, i) {

        describe(i === 0 ? 'without options attribute' : 'with options attribute', function () {
            var isolateScope, el;
           
            beforeEach(function () {
                el = createDirective(template);
                isolateScope = el.isolateScope();
            });

            it('hides the menu', function () {
                expect(isolateScope.listDisplayed).to.be.false;
            });

            it('toggles the visibility of the menu when clicked', function () {
                el.children().click();
                expect(isolateScope.listDisplayed).to.be.true;

                el.children().click();
                expect(isolateScope.listDisplayed).to.be.false;
            });

            it('does not toggle the visibility of the menu when a child element is clicked', function () {
                el.children().children().click();
                expect(isolateScope.listDisplayed).to.be.false;
            });

            describe('controller', function () {
                var ctrl;

                beforeEach(function () {
                    ctrl = el.controller('rxMultiSelect');
                });

                it('initializes the model with an empty array if not defined', function () {
                    expect(scope.types).to.eql([]);
                });

                it('tracks its options (except "all")', function () {
                    expect(ctrl.options).to.eql(['A', 'B', 'C']);

                    ctrl.addOption('D');
                    expect(ctrl.options).to.eql(['A', 'B', 'C', 'D']);

                    ctrl.addOption('all');
                    expect(ctrl.options).to.eql(['A', 'B', 'C', 'D']);
                });

                it('selects and unselects a single option', function () {
                    ctrl.select('A');
                    scope.$digest();
                    expect(scope.types).to.eql(['A']);

                    ctrl.unselect('A');
                    scope.$digest();
                    expect(scope.types).to.eql([]);
                });

                it('selects and unselects all options', function () {
                    ctrl.select('all');
                    scope.$digest();
                    expect(scope.types).to.eql(['A', 'B', 'C']);

                    ctrl.unselect('all');
                    scope.$digest();
                    expect(scope.types).to.eql([]);
                });

                it('determines if an option is selected', function () {
                    expect(ctrl.isSelected('A')).to.be.false;

                    ctrl.select('A');
                    scope.$digest();
                    expect(ctrl.isSelected('A')).to.be.true;
                });

                it('determines if all options are selected', function () {
                    expect(ctrl.isSelected('all')).to.be.false;

                    ctrl.select('all');
                    scope.$digest();
                    expect(ctrl.isSelected('all')).to.be.true;
                });
            });

            describe('preview', function () {
                var ctrl;

                beforeEach(function () {
                    ctrl = el.controller('rxMultiSelect');
                });

                it('is set to "None" when no options are selected', function () {
                    expect(isolateScope.preview).to.equal('None');
                });

                it('is set to the option\'s label when one option is selected', function () {
                    var label = el[0].querySelector('rx-select-option[value="A"]').textContent.trim();
                    ctrl.select('A');
                    scope.$digest();
                    expect(isolateScope.preview).to.equal(label);
                });

                it('is set to "Multiple" when more than one but not all options are selected', function () {
                    ctrl.select('A');
                    ctrl.select('B');
                    scope.$digest();
                    expect(isolateScope.preview).to.equal('Multiple');
                });

                it('is set to "All" when all options are selected', function () {
                    ctrl.select('all');
                    scope.$digest();
                    expect(isolateScope.preview).to.equal('All');
                });

            });

        });

    });
});

describe('SelectFilter', function () {
    var filter;

    beforeEach(function () {
        module('encore.ui.rxSelectFilter');

        inject(function (SelectFilter) {
            filter = SelectFilter.create({
                properties: ['status', 'type'],
                selected: {
                    status: ['ENABLED']
                }
            });
        });
    });

    describe('.init', function () {

        beforeEach(function () {
            filter.init([
                { status: 'ENABLED', type: 'COMPUTER' },
                { status: 'DISABLED', type: 'SWITCH' }
            ]);
        });

        it('determines the available options for each property', function () {
            expect(filter.available).to.eql({
                status: ['ENABLED', 'DISABLED'],
                type: ['COMPUTER', 'SWITCH']
            });
        });

        it('selects all the options if not already specified', function () {
            expect(filter.selected).to.eql({
                status: ['ENABLED'],
                type: ['COMPUTER', 'SWITCH']
            });
        });

    });

    describe('.isItemValid', function () {

        beforeEach(function () {
            filter.selected.type = ['COMPUTER'];
        });

        it('returns true when all the properties are selected', function () {
            expect(filter.isItemValid({
                status: 'ENABLED',
                type: 'COMPUTER'
            })).to.be.true;
        });

        it('returns false when any property is not selected', function () {
            expect(filter.isItemValid({
                status: 'DISABLED',
                type: 'COMPUTER'
            }), 'DISABLED, COMPUTER').to.be.false;

            expect(filter.isItemValid({
                status: 'DISABLED',
                type: 'SWITCH'
            }), 'DISABLED, SWITCH').to.be.false;

            expect(filter.isItemValid({
                status: 'ENABLED',
                type: 'SWITCH'
            }), 'ENABLED, SWITCH').to.be.false;
        });
    });

    describe('.applyTo', function () {

        beforeEach(function () {
            filter.init = sinon.stub();
            filter.isItemValid = sinon.stub().returns(false);
        });

        it('initializes the filter on the first run only', function () {
            filter.applyTo([]);
            filter.applyTo([]);
            filter.applyTo([]);

            expect(filter.init).to.have.been.calledOnce;
        });

        it('filters the array', function () {
            expect(filter.applyTo(['a', 'b', 'c'])).to.eql([]);
            expect(filter.isItemValid).to.have.been.calledThrice;
        });
    });
});
