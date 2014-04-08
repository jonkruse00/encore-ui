/* jshint node: true */

describe('rxPopover', function () {
    var getTemplateString = function (position) {
        return '<rx-popover position="'+ position + '">' +
               '    <rx-popover-trigger>trigger</rx-popover-trigger>' +
               '    <rx-popover-content>content</rx-popover-content>' +
               '</rx-popover>';
    };
    var el, scope, compile, rootScope, controller, contentScope;

    var rootPopoverEl, triggerDirectiveEl, triggerContentEl, contentDirectiveEl, popoverWrapperEl,
        popoverArrow, popoverBody;
    beforeEach(function () {
        module('encore.ui.rxPopover');
        module('modules/rxPopover/templates/rxPopover.html');

        inject(function ($rootScope, $compile, $templateCache) {
            var mainTemplate = $templateCache.get('modules/rxPopover/templates/rxPopover.html');
            $templateCache.put('/modules/rxPopover/templates/rxPopover.html', mainTemplate);

            rootScope = $rootScope;
            compile = $compile;
            scope = $rootScope.$new();
        });
        el = helpers.createDirective(getTemplateString('bottom'), compile, scope);

        // Save the different parts of the popover
        rootPopoverEl = helpers.getChildDiv(el, 'rx-popover', 'class');
        triggerDirectiveEl = rootPopoverEl.find('rx-popover-trigger');
        contentDirectiveEl = rootPopoverEl.find('rx-popover-content');

        triggerContentEl = helpers.getChildDiv(triggerDirectiveEl, 'rx-popover-trigger', 'class');
        popoverWrapperEl = helpers.getChildDiv(contentDirectiveEl, 'rx-popover-container', 'class');
        popoverArrow = helpers.getChildDiv(popoverWrapperEl, 'arrow', 'class');
        popoverBody = helpers.getChildDiv(popoverWrapperEl, 'popover-content', 'class');

        // get the controller and child scopes
        controller = el.controller('rxPopover');
        contentScope = contentDirectiveEl.scope();
    });

    afterEach(function () {
        scope = null;
        el = null;
        rootPopoverEl = null;
        triggerDirectiveEl = null;
        triggerContentEl = null;
        contentDirectiveEl = null;
        popoverWrapperEl = null;
        popoverArrow = null;
        popoverBody = null;
    });

    it('should instantiate directive correctly', function () {
        expect(el).to.not.be.empty;
        expect(controller).to.not.be.empty;
    });

    it('should render template correctly', function () {
        expect(rootPopoverEl).to.not.be.empty;
        expect(triggerDirectiveEl).to.not.be.empty;
        expect(triggerContentEl).to.not.be.empty;
        expect(contentDirectiveEl).to.not.be.empty;
        expect(popoverWrapperEl).to.not.be.empty;
        expect(popoverArrow).to.not.be.empty;
        expect(popoverBody).to.not.be.empty;

        expect(rootPopoverEl.hasClass('rx-popover')).to.be.true;
        expect(rootPopoverEl.hasClass('rx-popover-bottom')).to.be.true;
        expect(triggerContentEl.hasClass('rx-popover-trigger')).to.be.true;
        expect(popoverWrapperEl.hasClass('rx-popover-container')).to.be.true;
        expect(popoverArrow.hasClass('arrow')).to.be.true;
        expect(popoverBody.hasClass('popover-content')).to.be.true;
    });

    it('should transclude trigger content', function () {
        expect(triggerContentEl.text()).to.equal('trigger');
    });

    it('should transclude popover content', function () {
        expect(popoverBody.text()).to.equal('content');
    });

    it('should return the current position', function () {
        expect(controller.getPosition()).to.equal('bottom');
    });

    it('should show the active state', function () {
        expect(contentScope.active).to.be.false;
        contentScope.show();
        expect(contentScope.active).to.be.true;
    });

    it('should hide the active state', function () {
        expect(contentScope.active).to.be.false;
        contentScope.show();
        expect(contentScope.active).to.be.true;
        contentScope.hide();
        expect(contentScope.active).to.be.false;
    });


    it('should throw error when position is not an expected value', function () {
        var errorWrapper = function () {
            helpers.createDirective(getTemplateString('bottomRight'), compile, scope);
        };
        expect(errorWrapper).to.throw();
    });

    it('should calculate top position when positioned left', function () {
        scope = rootScope.$new();
        el = helpers.createDirective(getTemplateString('left'), compile, scope);
        var content = helpers.getChildDiv(el.find('rx-popover-content'), 'rx-popover-container', 'class'),
            trigger = helpers.getChildDiv(el.find('rx-popover-trigger'), 'rx-popover-trigger', 'class');

        var height = content.prop('offsetHeight'),
            triggerHeight = trigger.prop('offsetHeight');

        var top = Math.floor((height - triggerHeight)/-2),
            renderedTop = parseInt(content.css('top'));
        expect(top).to.equal(renderedTop);
    });
});