'use strict';
angular.module('billingApp', ['ngRoute', 'ngResource', 'encore.ui', 'encore.ui.tpls',
        'rxSwitch', 'encore.ui.rxPopover', 'billingSvcs', 'paymentSvcs', 'supportSvcs',
        'customerAdminSvcs', 'constants', 'productConstants'])

    .config(function ($httpProvider, $routeProvider, $locationProvider) {
        // Add Interceptors for auth
        $httpProvider.interceptors.push('TokenInterceptor');
        $httpProvider.interceptors.push('UnauthorizedInterceptor');

        //#TODO: To be replaced once account search is implemented, only temporary for dev
        $routeProvider
            .when('/overview/:accountNumber', {
                templateUrl: 'views/billing/overview.html',
                controller: 'OverviewCtrl'
            })
            .when('/transactions/:accountNumber', {
                templateUrl: 'views/billing/transactions.html',
                controller: 'TransactionsCtrl'
            })
            .when('/transactions/:accountNumber/:transactionType/:transactionNumber', {
                templateUrl: 'views/billing/transactionDetails.html',
                controller: 'TransactionDetailsCtrl'
            })
            .when('/usage/:accountNumber', {
                templateUrl: 'views/usage/usage.html',
                controller: 'UsageCtrl'
            })
            .when('/payment/:accountNumber/options', {
                templateUrl: 'views/payment/options.html',
                controller: 'OptionsCtrl'
            })
            .otherwise({
                //#TODO: this is temporary until we get a more solid solution
                redirectTo: '/overview/473500'
            });
        $locationProvider.html5Mode(true).hashPrefix('!');
    }).run(function ($http, $rootScope, $window, Auth, Environment) {
        var environment = Environment.get().name;

        if (environment !== 'local' && !Auth.isAuthenticated()) {
            $window.location = '/login?redirect=' + $window.location.pathname;
            return;
        }

        // Forces JSON only
        $http.defaults.headers.common['Accept'] = 'application/json';

        $rootScope.userName = Auth.getUserName();

        // TODO: Here we used to have the menu for billing, need to replace
        // With the new menu options from encore in order to be able to override it via the App.

    }).controller('LoginModalCtrl', function ($scope, Auth, Environment, rxNotify) {
        $scope.environment = Environment.get().name;

        var authenticate = function (credentials, success, error) {
            //override the body here
            var body = {
                'auth': {
                    'RAX-AUTH:domain': {
                        'name': 'Rackspace'
                    },
                    'RAX-AUTH:rsaCredentials': {
                        'username': credentials.username,
                        'tokenKey': credentials.token
                    }
                }
            };

            return Auth.loginWithJSON(body, success, error);
        };
        $scope.user = {};
        $scope.login = function () {
            return authenticate($scope.user, function (data) {
                Auth.storeToken(data);
            }, function () {
                rxNotify.add('Invalid Username or RSA Token', { type: 'warning' });
                $scope.user.token = '';
            });
        };
    });