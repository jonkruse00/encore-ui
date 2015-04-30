/*jshint unused:false*/

// This file is used to help build the 'demo' documentation page and should be updated with example code
function rxPaginateCtrl ($scope, $q, $timeout, $filter, rxPaginateUtils, PageTracking, rxSortUtil, SelectFilter) {
    $scope.pager = PageTracking.createInstance({ itemsPerPage: 3 });

    var os = ['Ubuntu 12.04', 'Red Hat Enterprise Linux 6.4', 'CentOS 6.4', 'Ubuntu 13.04'];
    var makeServers = function (serverCount) {
        var servers = [];
        for (var i = 1; i < serverCount + 1; i++) {
            var server = {
                id: i,
                name: 'Server ' + i,
                os: os[i % os.length]
            };
            servers.push(server);
        }
        return servers;
    };

    $scope.servers = makeServers(21);

    $scope.removeServers = function () {
        if ($scope.servers.length > 2) {
            $scope.servers = $scope.servers.splice(2);
        }
    };

    $scope.addServers = function () {
        $scope.servers = $scope.servers.concat(makeServers(2));
    };
    
    var allLazyServers = makeServers(701);

    var serverInterface = {
        getItems: function (pageNumber, itemsPerPage, params) {
            var deferred = $q.defer();
            var filterText = params.filterText;
            var sortColumn = params.sortColumn;
            var sortDirection = params.sortDirection;

            if (sortColumn === 'name') {
                sortColumn = 'id';
            }

            if (sortDirection === 'DESCENDING') {
                sortColumn = '-' + sortColumn;
            }

            $timeout(function () {
                var first = pageNumber * itemsPerPage;
                var added = first + itemsPerPage;
                var last = (added > allLazyServers.length) ? allLazyServers.length : added;

                var filteredServers = $filter('filter')(allLazyServers, filterText);
                filteredServers = $scope.osFilter.applyTo(filteredServers);
                filteredServers = $filter('orderBy')(filteredServers, sortColumn);

                // Return 100 items more than the user's `itemsPerPage`. i.e. if the
                // user is asking for 25 items per page, return 125 in total
                var lazyServers = filteredServers.slice(first, last + 100);
                    
                var response = {
                    items: lazyServers,
                    pageNumber: pageNumber,
                    totalNumberOfItems: filteredServers.length
                };

                if (filterText === 'error') {
                    deferred.reject();
                } else {
                    deferred.resolve(response);
                }
            }, 1000);
            return deferred.promise;
        }
    };

    $scope.sort = rxSortUtil.getDefault('name', false);
    $scope.sortCol = function (predicate) {
        return rxSortUtil.sortCol($scope, predicate);
    };
    $scope.data = { searchText: '' };
    $scope.clearFilter = function () {
        $scope.data.searchText = '';
    };
    $scope.osFilter = SelectFilter.create({
        properties: ['os'],
        available: {
            os: os
        }
    });
    $scope.serverInterface = serverInterface;
    $scope.pagedServers = PageTracking.createInstance({ itemsPerPage: 25 });
}
