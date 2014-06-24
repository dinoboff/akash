# akash ![alt text](https://travis-ci.org/ChrisBoesch/akash.svg?branch=gh-pages "Logo Title Text 1")

The Angularjs-based GUI for ChrisBoesch.com.

## Setup

### Requirements

- git
- node and npm

Using "nitrous.io", you would just need to create a Node box and
[add your box public ssh key to github](http://help.nitrous.io/github-add-key/).


### Installation

Fork https://github.com/ChrisBoesch/akash and clone it:
```
git clone git@github.com:your-gihub-user-name/akash.git
cd akash
```

Then install dependencies:
```
npm install -g grunt-cli
npm install
```

### Update you repository

You should add the main akash repository
```
git remote add upstream https://github.com/ChrisBoesch/akash.git
```

To merge changes from the main repository (note that akash main branch
is "gh-pages" and not "master):
```
git fetch upstream gh-pages
git merge upstream/gh-pages
```


## Development

To run the development server on port 8888:
```
grunt dev
```
If you run it on Nitrous, use "preview" > "Port 8888" menu.

To run the unit tests continuously:
```
grunt autotest:unit
```

You will usually have two console tabs open with one run the development server
and the other one running the the unit tests after every changes.

To run e2e test and update screenshots (in phantomjs):
```
grunt test:e2e
```

To run the e2e tests in chrome (cannot be run on Nitrous):
```
grunt autotest:e2e
```

To run all tests and test the project against JSHint:
```
grunt test
```

The two e2e tasks are useful when writing e2e tests, to debug them. It's a good
idea to run the last one running all tests before committing your changes; it
will run the tests like Travis will do (any pull request have to pass their
tests in Travis before being merged into the main repository).

## Conventions

If your contributions fail to follow those convention, Travis tests might fail
and your pull request be denied. The grunt task with test them with
[JSHint](http://www.jshint.com/docs/options/) using settings defined in
`.jshintrc`.

You may need overwrite those settings because some 3rd party api follow
different convention. To do so, add a comment at the top of the function
that need different settings something like:
```
/* jshint camelcase: false */
```


### indent

Use 2 spaces to indent JavaScript code.


### curly brace

Always use curly braces around blocks


### Equality tests

Use only `===` and `!==` for equality tests.


### Quote

Use single quote for string literals.


### No trailing space

You should leave trailing white space in your code. Most text editor have
an option to remote them when saving files or to at least show them.

To show them in Nitrous.io IDE, go to "View" > "Show Trailing white space".


### Variable names

Use camel case to name your variables. e.g.:
```
var someVariable;
```


### Variables definitions

You should always define variable (using  `var` or as a function argument)
before using it.

If you are going to use global variables, you should annotate them in comments
at the top of the file or a function. e.g. Jamine tests will usually include
at the top of the file:
```
/* global describe, beforeEach, it, inject, expect */
```

An alternative, when using libraries like jQuery, is to inject angular
`$window` to access the global scope:
```
angular('someModule', []).controller('SomeCtrl', ['$window', function($window){
  var $ = $window.jQuery;
  [...]
}])
```

### Unused variables

The tests will complain if they find any unused variables, it the single you
might have misspell a variable call.


### Strict mode

Your functions should operate in [strict mode](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions_and_function_scope/Strict_mode).

Note that you shouldn't invoke the strict mode at the top of the file, but
inside your functions.

The easiest way to do it is to wrap all the code in a function that you invoke
immediately:
```
(function(){
  'use strict';

  // All code inside this function, including function definitions,
  // will operate in strict mode.

})();
```

The other advantage is that you won't pollute the global scope with your
variables.


### Implicit annotation

You should not rely on implicite annotation When defining components to inject.
Implicite annotation let angular injector infer the component to
inject from the argument name but since argument name will change in some build
process, they will become meaningless.

Instead you should use `$inject` property annotation or inline array
annotation:
```
someModule.factory('greeter', ['$window', function($window) {
  // ...
}]);
'''
See [Angularjs dependency injection guide](https://code.angularjs.org/1.2.16/docs/guide/di#dependency-annotation)
for more details.


## Project layout

Features assets, including tests, html partials and css rules, are grouped
together inside subsection or component folders.

For example `app/userdetails` is a subsection regrouping angular modules,
tests, a css style style sheet and two html partials for the users' profile
page (and the form to update its settings).

`app/components/users` is a components used by many akash modules to request
edit or validate users' info.

```
|-.bowerrc               Tells bower where to install dependencies.
|-.gitignore
|-.jshintrc              JS Hint config.
|-.travis.yml            Travis config.
|-Gruntfile.js           Task to build akash, run its test and run the dev server.
|-LICENSE
|-README.md
|-app/                   Akash source.
|---app-config.js        Akash angularjs app config.
|---app-controllers.js   Generic COntrollers. Can be used to quickly add a new
                         controller.
|---app-fixtures.js      Fixtures for e2e tests and dev servers.
|---app-mock.js          Mock OEP, Code School and Treehouse API responses.
|---app-services.js      Very few services should be defines here.
|---app-templates.js     A dummy empty modules. Is replaced during the build process
                         by cached html partials.
|---app.css              Styles for elements defined in index.html
|---app.js               Akash Angularjs app
|---index.html           Defines html layout, navigation bar, list akash
                         depencies and assets (scripts and stylesheet) and
                         bootstrap the angularjs app.
|---admin/               Admin subsection.
|---components/          Akash components.
|-----card/              Services and directives about report cards.
|-----debounce/          A debounce service.
|-----user/              Services and directives about OEP users.
|-----utils/             Miscellinous utility fountions (debounce should be moved there).
|---lib/                 Dependencies. Installed via bower (`bower install`).
                         See bower.json for the list of dependencies.
|---navbar/              Navbar subsection.
|---ranks/               Ranks subsection.
|---suggestions/         Suggestions subsection (contact form).
|---userdetails/         User details (setting form and profile page).
|-config/                Test config files.
|-screenshots/           Akash screenshot
```


## Adding new features

Let's say you would like to add a page listing schools participating to oep.

The steps to add this new features are:

1. add a new subsection, that we will call "schools", and which will be located in
`app/schools`.
2. add a new module to hold the controllers to list the schools.
it will be call `oep.schools.controllers` and will be located at `app/schools/schools-controller.js`.
3. add the  unit tests to test the controller. It will be located at
`app/schools/schools-controller.specs.js`
4. edit karma config to load the schools subsection files.
5. add a html partial rendering the school list and the form.
6. edit `index.html` to load `app/schools/schools-controller.js`.
7. edit `app.js` to add a new requirement to the oep module and to add a new
route for our new page.
8. edit `index.html` to add a link to our new page.
9. Write e2e tests for our new page.

Optionally, if the page have to query new API endpoints, it would need to append
an existing service (or create a new one) and edit app-mock.js to mock the new
API endpoint.

### a New subsection

We will create the new subsection directory and empty files for our controllers,
partials and tests.
```
cd ~/path/to/akash
mkdir app/schools
touch app/schools/schools-list.html
touch app/schools/schools-controllers.js
touch app/schools/schools-controllers.specs.js
touch app/schools/schools.e2e.specs.js
```

### A new controller

Because it's the first controller for that subsection, we need to create
a new angular module. We will use the following format to name it:
`appname.subsectionname.typeofcomponent` or `oep.schools.controllers`.

```
(function() {
  'use strict';

  angular.module('oep.schools.controllers', [])

  ;

})();
```

This controller is quite simple. It just need to query a list of schools and
pass it the partial scope.

```
(function() {
  'use strict';

  angular.module('oep.schools.controllers', []).

  controller('OepSchoolListCtrl', [
    function() {
      this.schools = [];
    }
  ])

  ;

})();
```
We will be using the new "controller As" syntax. The controller instance
is added to the scope and the data is passed to the scope by assigning it to
controller properties; in this case via `schools` property.

Akash already query the list of school on to other pages using the oepUsersApi.
We will use the same api client on this page.

```
(function() {
  'use strict';

  angular.module('oep.schools.controllers', ['oep.user.services']).

  controller('OepSchoolListCtrl', ['oepUsersApi',
    function(oepUsersApi) {
      // create a reference to the controller object to access it from
      // the promise handler below.
      var self = this;

      this.schools = null;
      oepUsersApi.availableSchools().then(function(schools) {
        self.schools = schools;
      });
      // TODO: handle errors.
    }
  ])

  ;

})();
```
`oepUsersApi` is define in the `oep.user.services` module; we had it the
the list of requirement of `oep.schools.controllers`. And we can now inject it
in our controller.


### Testing our controller

Let's open `app/schools/schools-controllers.specs.js` and start with
the typical Jasmine boilerplate:
```
/* jshint camelcase: false */
/* global describe, module, beforeEach, inject, it, expect */
(function() {
  'use strict';

  describe('oep.schools.controllers', function() {
    var $controller, $scope;

    beforeEach(module('oep.schools.controllers'));

    beforeEach(inject(function(_$controller_, $rootScope) {
      $controller = _$controller_;
      $scope = $rootScope;
    }));
  });

})();
```
Before each test, we first make sure the modules we will be using will be accessible
to the injector using the `module` global function.

We then inject and save the references to some components we will be using in our tests.
Because we are testing controllers we get `$controller` which will instantiate
controller for us. We will also get `$rootScope`; it's often needed to deal
with asynchronous tasks.

We can now write a suite for our controller:

```
/* jshint camelcase: false */
/* global describe, module, beforeEach, inject */
(function() {
  'use strict';

  describe('oep.schools.controllers', function() {
    var $controller, $scope, $q;

    beforeEach(module('oep.schools.controllers'));

    beforeEach(inject(function(_$controller_, $rootScope, _$q_) {
      $controller = _$controller_;
      $scope = $rootScope;
      $q = _$q_;
    }));

    describe('OepSchoolListCtrl', function() {
      var usersApi, schoolListDeferred, ctrl;

      beforeEach(function(){
        schoolListDeferred = $q.defer();
        usersApi = {
          availableSchools: function() {
            return schoolListDeferred.promise;
          }
        };
        ctrl = $controller('OepSchoolListCtrl', {'oepUsersApi': usersApi});
      });
    });
  });

})();
```

We first need to create the mock api client. It will have one method,
`availableSchools`, and will return a promise that we can control for the test.
Using $controller, we can create an instance of our controller in which we
inject our mocked client.

Finally, we can tests the controller `schools` property gets populated once
our api call resolve:
```
/* jshint camelcase: false */
/* global describe, module, beforeEach, inject, it, expect */
(function() {
  'use strict';

  describe('oep.schools.controllers', function() {
    var $controller, $scope, $q;

    beforeEach(module('oep.schools.controllers'));

    beforeEach(inject(function(_$controller_, $rootScope, _$q_) {
      $controller = _$controller_;
      $scope = $rootScope;
      $q = _$q_;
    }));

    describe('OepSchoolListCtrl', function() {
      var usersApi, schoolListDeferred, ctrl;

      beforeEach(function(){
        schoolListDeferred = $q.defer();
        usersApi = {
          availableSchools: function() {
            return schoolListDeferred.promise;
          }
        };
        ctrl = $controller('OepSchoolListCtrl', {'oepUsersApi': usersApi});
      });

      it('should have a schools property set to null while loading', function() {
        expect(ctrl.schools).toBeNull();
      });

      it('should populate the school property once the api call resolve', function() {
        schoolListDeferred.resolve([]);
        $scope.$digest();
        expect(ctrl.schools).toEqual([]);
      });
    });
  });

})();
```

### Karma config

Karma is our unit test runner. You can run your test using `grunt test:unit`.
However, if you were to run it now, it wouldn't run the 2 new tests above.
You need to make it load your tests first.

Karma config file used by grunt is located in `config/karma.conf.js`. Look
for the `files` property. You will need to add `app/schools/*.js` to that
array of file pattern karma should load.

`grunt test:unit` should now run your tests.


### HTML partial

Let's now populate `app/schools/schools-list.html`:
```
<h1>School list</h1>

<ul>
    <li ng-repeat="school in ctrl.schools">{{school.name}}</li>
</ul>
```
The partial expect the controller to be injected as `ctrl` and to hold a list
of school in `ctrl.schools`, and it expect each school to have a name property.


### Include the controller module

We're getting closer to integrate our new controller into the app; it needs
to load it. Open `app/index.html` and locate the following comment:
```<!-- Add akash scripts here -->```

Just before add :
```<script src="schools/schools-controllers.js"></script>```

It should beinside a list of script between:
```
  <!-- build:js(app) app.js -->
  [...]
  <!-- endbuild -->
```
During the build process that list of file will be grouped together into
`app.js`.


### New route

Everything is in place to add a new route.

First edit `app.js` and the `oep` module to add `oep.schools.controllers`
as a dependency:
```
  angular.module(
    'oep', [
      'oep.schools.controllers',
      ...
    ]
  ).
'''

Then add a new route:
```
  config(['$routeProvider',
    function($routeProvider) {
      $routeProvider.
      when('/schools', {
        templateUrl: 'schools/schools-list.html',
        controller: 'OepSchoolListCtrl',
        controllerAs: 'ctrl',
      }).
    [...]
```
Run `grunt dev` and visit http://0.0.0.0:8888/#/schools
(or use the preview menu on Nitrous). You should see a list of school.

You should now open index.html and add a link to `#/schools` somewhere,
maybe in the nav-bar.


### E2E tests

TODO. see `app/userdetails/userdetails.e2e.specs.js` in the meantime.


### New endpoint

TODO: add form to add a new school, a new controller to handle the form, new
methods to the API client to interact with the new endpoint and extend
the mocked api.


## Build

Only relevant for deployment.


### debug target

Built in `debug/`, it works like `app` except for `index.html`
which won't mock api responses.
```
grunt debug
```


### build target

Built in `build/` with the scripts, stylesheet and html partials concatenated
together and without mocked api responses.
```
grunt build
```

The number of requests are therefore limited to few scripts and stylesheets.


### dist target

Built in `dist/`. Like the build target but assets are also also compressed.
```
grunt dist
```
