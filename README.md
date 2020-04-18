# create-store

[![Version Badge][version-image]][project-url]
[![Build Status][build-image]][build-url]
[![License][license-image]][license-url]

> Composable stores for reactive programming

## Install

Download the [CJS](https://github.com/ryanmorr/create-store/raw/master/dist/create-store.cjs.js), [ESM](https://github.com/ryanmorr/create-store/raw/master/dist/create-store.esm.js), [UMD](https://github.com/ryanmorr/create-store/raw/master/dist/create-store.umd.js) versions or install via NPM:

```sh
npm install @ryanmorr/create-store
```

## Usage

Easily create customizable observable stores that allow you control every aspect of it's behavior and API, including how it's created, how and when it's internal value is read and written, and how subscribers are handled. This allows you to create stores with specific functionality and still maintain interoperability with different reactive libraries.

```javascript
import createStore from '@ryanmorr/create-store';

// Define a store with a callback function that is provided a function to get the
// internal value, a function to set the internal value, a function to add
// subscribers, and the subscribers array as the 4 parameters
const store = createStore((get, set, subscribe, subscribers) => {

    // Return a function for creating store instances with custom arguments
    return (initialValue) => {

        // Set the initial value upon creation
        set(initialValue);

        // This return object exposes the external API for interacting
        // with a store instance
        return {

            // Add `get` method
            get,

            // Add `set` method
            set(...args) {

                // The `set` function supports multiple arguments that will all be
                // passed to the subscribers when called, only the first argument
                // will be set to the new internal value
                set(...args);
            },

            // By default, the `subscribe` function is automatically added to the
            // return object unless it is explicitly overridden
            subscribe(callback) {

                // The `subscribe` function returns an `unsubscribe` function for the
                // subscriber when called
                const unsubscribe = subscribe(callback);

                // Override `unsubscribe` and return it as a method of an object instead
                // of a function
                return {
                    unsubscribe() {
                        unsubscribe();

                        // The `subscribers` array is live, it's useful for executing
                        // code when the first subscriber is added or the last is removed
                        if (subscribers.length === 0) {
                            
                        }
                    }
                };
            }
        };
    };
});

// Create an instance of the store with an initial value
const value = store('foo');

// Add a subscriber
const subscriber = value.subscribe((newValue) => console.log(newValue));

// Get the stored value
value.get(); //=> "foo"
// Set the stored value
value.set('bar');
// Get the new stored value
value.get(); //=> "bar"

// Remove subscriber
subscriber.unsubscribe();
```

## Examples

You can make all kinds of different observable stores, for example, here's a basic function-based store:

```javascript
const store = createStore((get, set) => (value) => {
    set(value);
    return (...args) => {
        if (args.length === 1) {
            set(args[0]);
        }
        return get();
    };
});

const value = store('foo');

const subscribe = value.subscribe((val) => console.log(val));

value(); //=> "foo"
value('bar');
value(); //=> "bar"
```

And how about a computed store to go with it:

```javascript
const computed = createStore((get, set) => (deps, callback) => {
    const setValue = () => set(callback(deps.map((dep) => dep())));
    deps.forEach((dep) => dep.subscribe(setValue));
    setValue();
    return get;
});

const firstName = store('John');
const lastName = store('Doe');
const fullName = computed([firstName, lastName], ([f, l]) => `${f} ${l}`);

const subscribe = fullName.subscribe((name) => console.log(name));

fullName(); //=> "John Doe"
firstName('Jane');
fullName(); //=> "Jane Doe"
lastName('Smith');
fullName(); //=> "Jane Smith"
```

Or maybe a simple toggle store:

```javascript
const toggle = createStore((get, set) => (on = false) => {
    set(on);
    return {
        isOn: get,
        on: () => set(true),
        off: () => set(false),
        toggle: () => set(!get())
    };
});

const toggler = toggle();

const subscribe = toggler.subscribe((on) => console.log(on));

toggler.on();
toggler.isOn(); //=> true
toggler.off();
toggler.isOn(); //=> false
toggler.toggle();
toggler.isOn(); //=> true
```

Don't forget your Redux-style reducer store:

```javascript
const reduce = createStore((get, set) => (reducer, initialState) => {
    set(initialState);
    return {
        getState: get,
        dispatch: (action) => set(reducer(get(), action))
    };
});

function reducer(state, action) {
    switch (action.type) {
        case 'increment':
            return {count: state.count + 1};
        case 'decrement':
            return {count: state.count - 1};
        default:
            return state;
    }
}

const state =  {count: 0};
const counter = reduce(reducer, state);

const subscribe = counter.subscribe((state) => console.log(state));

counter.dispatch({type: 'increment'});
counter.getState(); //=> {count: 1}
counter.dispatch({type: 'decrement'});
counter.getState(); //=> {count: 0}
```

## License

This project is dedicated to the public domain as described by the [Unlicense](http://unlicense.org/).

[project-url]: https://github.com/ryanmorr/create-store
[version-image]: https://badge.fury.io/gh/ryanmorr%2Fcreate-store.svg
[build-url]: https://travis-ci.org/ryanmorr/create-store
[build-image]: https://travis-ci.org/ryanmorr/create-store.svg
[license-image]: https://img.shields.io/badge/license-Unlicense-blue.svg
[license-url]: UNLICENSE