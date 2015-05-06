[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

A multi-select dropdown for table filtering.

# Services

## SelectFilter

This service exposes an object with single method, `create()`, used to create instances of a `SelectFilter`.  It is configurable via three options:
- `properties`: A list of the properties to create a filter control for.  Assuming the source data is an array of objects, a property is equivalent to an object's key.
  ```
  SelectFilter.create({
      properties: ['year']
  });
  ```
- `available` (optional): An object that tracks which options are available for a property. It has the form:
  ```
  SelectFilter.create({
      // other options...
      available: {
          year: [2013, 2014, 2015],
      }
  });
  ```
Note that the key of the object matches a value in the `properties` array.
- `selected` (optional): An object that tracks which options are selected for a property. It has the same form as the `available` object, but the arrays indicate which options are selected, and as such are strict subsets of their `available` counterparts.
  ```
  SelectFilter.create({
      // other options...
      selected: {
          year: [2014],
      }
  });
  ```

### Option Defaults

Every property that is listed in `properties` but not provided as a key to `available` will be automatically populated the first time `applyTo()` (see below) is called.
```
var filter = SelectFilter.create({
    properties: ['year']
});

filter.applyTo([{
    eventId: 1,
    year: 2013
}, {
    eventId: 2,
    year: 2014
}, {
    eventId: 3,
    year: 2013
}]);
// filter.available is { year: [2013, 2014] }
```
**Note:** There is an implied requirement that, when relying on the auto-populated filter, the input array will have at least one item for every available option.  For example, this may not be the case when used with server-side pagination.


Every property that is listed in `properties` but not provided as a key to `selected` is initialized to have all options selected (by looking them up in `available`).  If property is also not provided to `available`, its initialization is delayed until the first call of `applyTo()`.

```
var filter = SelectFilter.create({
    properties: ['year'],
    available: {
        year: [2013, 2014, 2015]
    }
});
// filter.selected is { year: [2013, 2014, 2015] }
```


### Instances

Instances of `SelectFilter` have an `applyTo()` method, which applies the filter's internal state of selected options to the array. This will not often be called directly, instead used by the `Apply` filter (see below).  As stated previously, the first call of `applyTo()` will initialize any `properties` that have not been defined in `available` or `selected`.

```js
var filter = SelectFilter.create({
    properties: ['year'],
    selected: {
        year: [2014]
    }
});

var filteredArray = filter.applyTo([{
    eventId: 1,
    year: 2013
}, {
    eventId: 2,
    year: 2014
}, {
    eventId: 3,
    year: 2013
}]);
// filteredArray is [{ eventId: 2, year: 2014 }]
```

The instance will also have all of the constructor options as public properties, so that they can be watched or changed.


# Directives

## rxSelectOption

`<rx-select-option>` is to `<rx-multi-select>` as `<option>` is to `<select>`.

Just like `<option>`, it has a `value` attribute and uses the element's content for the label. If the label is not provided, it defaults to a titleized version of `value`.

```
<rx-select-option value="DISABLED">Disabled</rx-select-option>
```


## rxMultiSelect

A replacement for `<select multiple>` when space is an issue, such as in the header of a table.

The options for the control can be specified by passing an array of strings (corresponding to the options' values) to the `options` attribute of the directive or using `<rx-select-option>`s. An 'All' option is automatically set as the first option for the dropdown, which allows all options to be toggled at once.

The following two dropdowns are equivalent.
```
<!-- $scope.available = [2014, 2015] -->
<rx-multi-select ng-model="selected" options="available"></rx-multi-select>

<rx-multi-select ng-model="selected">
    <rx-select-option value="2014"></rx-select-option>
    <rx-select-option value="2015"></rx-select-option>
</rx-multi-select>
```

This component requires the `ng-model` attribute and binds the model to an array of the selected options.


## rxSelectFilter

Uses an instance of `SelectFilter` to create a set of `<rx-multi-select>`s that modify the instance object.
```
// In the controller
$scope.filter = SelectFilter.create({
    // options...
});

// In the template
<rx-select-filter filter="filter"></rx-select-filter>
```

# Filters

## Apply

Merely calls the `applyTo()` method of a `SelectFilter` instance to an input array.

```html
<tr ng-repeat="item in list | Apply:filter">
```

## titleize

Converts a string to a title case, stripping out underscores and capitalizing words. This is used to generate the text for an `<rx-select-option>` with no content.


# Styling

Remember to adhere to the Null Pattern for [tables](#/styleguide/tables) in Encore UI.  When there are no results to populate the table, the table content should say "No [x] were found."  However, if the table is empty because of the applied filters, the message should instead say "No results match those criteria."  This has been included in the demo below for an example implemtation.
