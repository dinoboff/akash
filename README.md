# akash ![alt text](https://travis-ci.org/ChrisBoesch/akash.svg?branch=gh-pages "Logo Title Text 1")

The Angularjs-based GUI for ChrisBoesch.com.

## Setup
Fork https://github.com/ChrisBoesch/akash and clone it:
```
git clone git@github.com:your-gihub-user-name/akash.git
cd akash
git remote add upstream git@github.com:SingaporeClouds/akash.git
```

Then install dependencies:
```
npm install -g grunt-cli
npm install
```


## Development

To run the development server on port 8.8.8.8:
```
grunt dev
```

To run tests:
```
grunt test
```

To run the unit tests continuously:
```
grunt autotest:unit
```

to run e2e test only and update screenshots (in phantomjs):
```
grunt test:e2e
```

To run the e2e tests continuously in chrome (cannot be run on Nitrous):
```
grunt autotest:e2e
```


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


## Build

Only relevant for deployement.


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

This process will shorten variables names. As result, you should not
rely on implicite annotation When defining components to inject
implicite annotation let angular injector infer the component to
inject from the argument name but since argument name will change
they will become meaningless.

Instead you should use `$inject` property annotation or inline array
annotation:
```
someModule.factory('greeter', ['$window', function($window) {
  // ...
}]);
'''
See [Angularjs dependency injection guide](https://code.angularjs.org/1.2.16/docs/guide/di#dependency-annotation)
for more details.
