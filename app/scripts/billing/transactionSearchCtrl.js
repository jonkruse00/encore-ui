angular.module('billingApp')
    /**
    * @ngdoc object
    * @name billingApp.TransactionSearchCtrl
    * @description
    * The controller used to search for an account via transaction
    *
    * @requires $scope - The $scope variable for interacting with the UI.
    * @requires $routeParams - AngularJS service which provides access to route paramters
    * @requires rxPromiseNotifications - EncoreUI service which displays notifications
    * @requires billingSvcs.Transaction - Service for CRUD operations for the Transaction resource.
    */
    .controller('TransactionSearchCtrl', function ($scope, $routeParams, $location, rxNotify, rxPromiseNotifications,
        Transaction, STATUS_MESSAGES) {

        // Check if search entry is an Auth ID
        function isAuthId (term) { 
            return term.indexOf('-') === -1;
        }

        // Check if search entry is payment or invoice
        function getPaymentType (term) {
            return term[0].toLowerCase() === 'b' ? 'INVOICE' : 'PAYMENT';
        }

        var term = $routeParams.term;
        var type = isAuthId(term) ? 'PAYMENT' : getPaymentType(term);
        var query = isAuthId(term) ? { gatewayTxRefNum: term } : { tranRefNum: term, tranType: type };

        $scope.result = Transaction.search(query,
            function (res) {
                if (res.billingAccounts && res.billingAccounts.billingAccount.length === 1) {
                    // Remove account prefix
                    var account = res.billingAccounts.billingAccount[0].accountNumber.slice(4);
                    var paymentId = 1234;
                    // Redirect to transaction details page on successful fetch
                    $location.path('/transactions/' + account + '/' + type.toLowerCase() + '/' + paymentId);
                    return;
                }
            }, function (err) {
                if (err.status !== 404) {
                    rxNotify.add(STATUS_MESSAGES.transactions.error, { type: 'error' });
                } else {
                    rxNotify.add('Transaction not found', { type: 'error' });
                }
            });

        rxPromiseNotifications.add($scope.result.$promise, {
            loading: STATUS_MESSAGES.transactions.search
        });

    });
