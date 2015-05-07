A module for shared functionality across framework components.

## rxDOMHelper
A small set of functions to provide some functionality that isn't present in Angular's jQuery-lite, and other useful DOM-related functions.


## titleize

A filter that converts a string to title case, stripping out underscores and capitalizing words.  For example,
```
{{ 'a simple_STRING' | titleize }}
```
renders the string "A Simple String".


## rxAutoSave
`rxAutoSave` provides a way to store values in a form for later. For instance, if a user is entering values into a form, then accidentally navigate to a new page, we likely want the values to be present again when they click the "Back" button in their browser. By correctly setting up an `rxAutoSave` instance for the form, this can happen automatically. By default, all saved values will be cleared after two days.

`rxAutoSave` is a service intended to be used in controllers. No directives are provided. The intent is that the HTML forms themselves will have no knowledge that their values are being saved. `rxAutoSave` operates by doing a `$watch` on the model values for a given form, storing those model values whenever they change, and loading them on instantation.

The stored data is keyed on the page URL. This means you can track the form state for multiple pages simultaneously. For example, say you have an "Edit" form. The user has gone to edit some values for "Server1", at `"/servers/server1/edit"`, and for "Server2" at `"/servers/server2/edit"`. The edit progress for both servers will be saved independently of each other. `rxAutoSave` will also let you independently store values for multiple forms appearing on the same page.

By default, all values are stored in the browser's `LocalStorage`. This means that if a user logs into a different computer, their stored values will not be present. Use of `SessionStorage` is also supported out-of-the-box. If you wish to save form states elsewhere (for instance, to an API), see the "Storage Location" section below. 

### Setting up your template

Nothing explicit needs to be done in your templates to add support for `rxAutoSave`. The only requirement is that all the `ng-model` values in a given form are stored within one object (`formData` below). For example, say you have the following form in your template:

```
    <form name="demoForm">
        <rx-form-item label="A checkbox field!">
            <input type="checkbox" ng-model="formData.checkbox" />
        </rx-form-item>

        <rx-form-item label="Name">
            <input type="text" ng-model="formData.name"/>
        </rx-form-item>

        <rx-form-item label="Description">
            <textarea rows="10" cols="50" ng-model="formData.description"></textarea>
        </rx-form-item>

    </form>
```

Note that all the models for the form are attributes of the `formData` scope variable.

### Setting up your controller

In your controller, you would have something like this in your initialization:

```
    $scope.formData = {
        checkbox: false,
        name: '',
        description: ''
    };
```

By default, every time this page was loaded, the form would be initialized with an unchecked checkbox, a blank `Name` field and a blank `Description`.

To have `rxAutoSave` automatically save values, first inject `rxAutoSave` into your controller, and modify initialization as follows:

```
    $scope.formData = {
        checkbox: false,
        name: '',
        description: ''
    };

    var autosave = rxAutoSave($scope, 'formData');
```

And that's it! Your `rxAutoSave` instance will watch for any change to `$scope.formData`, and will automatically write those changes to `LocalStorage`. 

A third argument can be passed to `rxAutoSave`, specifying usage options. The default values for these options are:

```
    var autosave = rxAutoSave($scope, 'formData', {
      clearOnSuccess: null,        // Promise
      ttl: 172800,                 // Integer (seconds) - two days default
      load: true,                  // Boolean or Promise that will resolve with a Boolean
      save: true,                  // Boolean or Promise that will resolve with a Boolean
      exclude: [],                 // Array<String>
      storageBackend: LocalStorage // Object
    });
```

All of these options will be described below.


### Multiple Forms on one page

`rxAutoSave` supports independently saving multiple forms on one page. To do this, have each form's model in its own object, and create individual `rxAutoSave` instances for each. i.e.:

```
    $scope.form1Data = {
        checkbox: false,
        name: '',
        description: ''
    };

    $scope.form2Data = {
        customerName: '',
        birthday: ''
    };

    var autosave1 = rxAutoSave($scope, 'form1Data');
    var autosave2 = rxAutoSave($scope, 'form2Data');
```


### Clearing values
If you need to clear the stored values, you can call `autosave.clear()`. This will clear the values from `LocalStorage`, but won't affect your `$scope.formData` values.

More likely, rather than manually calling `autosave.clear()`, you'd like the values to be cleared on a "successful submit". For example, if your user is editing the form described above, and they click a "Submit" button to send the values to a server, `LocalStorage` should be cleared for this form if the server call is a success.

To do this, pass an "options" parameter as the third argument to `rxAutoSave`, setting a promise on the `clearOnSuccess` attribute, i.e.

```
    var autosave = rxAutoSave($scope, 'formData', { clearOnSuccess: serverSubmitPromise });
```

If the `serverSubmitPromise` resolves, then `rxAutoSave` will automatically clear the stored values for `formData` on this page.

When instantiating your controller, there's a good chance that the `clearOnSuccess` promise you're interested in doesn't actually exist yet, i.e. if you want to clear on a successfull submit, you need the submit `promise`. Instances of `rxAutoSave` provide a `clearOnSuccess()` method to accept this promise after instantiation:

```
    var autosave = rxAutoSave($scope, 'formData');
    
    // Take some other actions
    ...

    $scope.onSubmit = function () {
        // Server.save() is some $resource that returns a promise
        var promise = Server.save($scope.formData);
        autosave.clearOnSuccess(promise);
    }

```

### Automatic expiry
Another way to automatically clear values is to set an explict Time-To-Live (TTL) when instantiating your `rxAutoSave` instance. This is done with the `ttl` property of the `opts` object,

```
    // Automatically expire after 24 hours
    var autosave = rxAutoSave($scope, 'formData', { ttl: 86400 });
```

By default, a `ttl` of `172800` (two days) is used.

The `ttl` property takes a length of time in seconds. Whenever something in `formData` changes, the expiry time will be freshly set. With the example above, whenever `formData` is changed, the new expiry time will be set to 24 hours from the time of the change. In addition, we freshly set the expiry time whenever the data is loaded. If `formData` is 12 hours away from expiring, and the user visits the page again, then the expiry will be freshly set to a new 24 hours, whether or not the user makes a change.

If a user visits a page after the data has expired, the data will be cleared from storage and not automatically loaded. (i.e. we're not running a continuous background process to look for expired data, we only check for expiration the next time `rxAutoSave` tries to load the data).

To turn off automatic expiry for a given form, pass a value of `{ ttl: 0 }`. In this case, the data will never expire. You will have to clear it at an appropriate time by using one of the methods mentioned above.

### Preventing automatic loading

If you need to prevent `rxAutoSave` from automatically loading stored values, you can again use the optional third parameter, this time setting `load: false`, i.e.

```
    var autosave = rxAutoSave($scope, 'formData', { load: false });
```

`load:` will accept a boolean, or it can accept a promise that eventually resolves to a boolean. Accepting a promise will let you delay your decision on whether or not to load (for example, asking a user if they want values loaded). Note that if you use a promise, `rxAutoSave` will look at its resolved value. If the resolved value is `true`, then the data will be loaded. If the resolved value is `false`, or the promise fails/rejects, then the data will not be loaded.

### Excluding some values from loading/saving

By default, `rxAutoSave` automatically loads and saves all the stored values for a form. If you want to prevent it from loading/saving _some_ values, you can do:

```
    var autosave = rxAutoSave($scope, 'formData', { exclude: ['description'] });
```

This will tell `rxAutoSave` not to load from or save to the stored `description` value, but everything else in `formData` will be loaded/saved.

### Manual saving

It might be that you don't want your `rxAutoSave` instance to automatically save to the storage backend automatically. In some cases, you might want to disable automatic saving and instead manually tell your instance when it should save. To turn off automatic saving, set up your instance as follows:

```
    var manualsave = rxAutoSave($scope, 'formData', { save: false });
```

Then, whenever you want your `autosave` instance to commit the current model values to storage, do

```
    manualsave.save();
```

As with the `load` parameter, you can pass either a boolean or a promise to `save`.

### Storage location
All values for `rxAutoSave` are by default stored in the browser's `LocalStorage`, and keyed on the URL of the page, with a `rxAutoSave::` prefix. For example, if the above form were present at the URL `'users/JonnyRocket/edit'`, then the form data would be saved into `LocalStorage` at location `'rxAutoSave::users/JonnyRocket/edit'` 

If you wish to use a different storage backend (`SessionStorage`, for instance), use the `storageBackend` parameter:


```
    var autosave = rxAutoSave($scope, 'formData', { storageBackend: SessionStorage });
```

`storageBackend` requires that you pass it an object which has `getObject(key)` and `setObject(key, val)` methods. `LocalStorage` and `SessionStorage` are both provided by EncoreUI, and support this interface.

You can use your own custom backends as well, as long as it supports `getObject(key)` and `setObject(key, val)`.
