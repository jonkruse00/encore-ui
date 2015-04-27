[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

A select dropdown for table filtering.

# Services

## SelectFilter

This service exposes an object with single method, `create`, used to create instances of a `SelectFilter`.  It is configurable via three attributes:
- `properties`: A list of the properties to create a filter control for.  Assuming the source data is an array of objects, a property is equivalent to an object's key.
- `available`: An object that tracks which options are available for a property. It has the form:
```
{
      property1: ['value1-1', 'value1-2'],
      property2: ['value2-1', 'value2-2', 'value2-3']
}
```
If not provided, this object will be automatically populated the first time `apply` is called.
- `selected`: An object that tracks which options are selected for a property. It has the same form as the `available` object, but the array values indicate which options are selected, and as such are strict subsets of their `available` counterparts.  If not provided, this object defaults to a clone of `available`, meaning that all options are selected by default.

Instances of `SelectFilter` have an `applyTo` method, which applies the filter's internal state of selected options to the array. This will not often be called directly, instead used by the `Apply` filter (see below).

```js
var filter = SelectFilter.create({
    properties: ['property1', 'property2']
});
var filteredArray = filter.applyTo(inputArray);
```

# Directives

## rxSelectFilter

Uses an instance of `SelectFilter` to create a set of `<rx-multi-select>`s that modify the instance object.

## rxMultiSelect

A replacement for `<select multiple>` when space is an issue, such as in the header of a table.

The options for the control can be specified by passing an array of strings to the `options` attribute (corresponding to the options' values) or using `<rx-select-option>`s. An 'All' option is automatically set as the first option for the dropdown, which allows all options to be toggled at once.

This component requires the `ng-model` attribute and binds the model to an array of the selected options.

## rxSelectOption

`<rx-select-option>` is to `<rx-multi-select>` as `<option>` is to `<select>`.

Just like `<option>`, it has a `value` attribute and uses the element's content for the label. If the label is not provided, it defaults to a titleized version of `value`.

```html
<rx-select-option value="DISABLED">Disabled</rx-select-option>
```

# Filters

## Apply

Merely applies an instance of `SelectFilter` to an input array.

```html
<tr ng-repeat="item in list | Apply:filter">
```

## titleize

Converts a string to a title case, stripping out underscores and capitalizing words. This is used to generate the text for an `<rx-select-option>` with no content.
