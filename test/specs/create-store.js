import { expect } from 'chai';
import sinon from 'sinon';
import createStore from '../../src/create-store';

describe('create-store', () => {
    it('should create a function-based store', () => {
        const store = createStore((get, set) => (value) => {
            expect(get).to.be.a('function');
            expect(set).to.be.a('function');

            set(value);
            return (...args) => {
                if (args.length === 1) {
                    set(args[0]);
                }
                return get();
            };
        });

        const value = store('foo');
        expect(value).to.be.a('function');
        expect(value()).to.equal('foo');
        expect(value('bar')).to.equal('bar');
        expect(value()).to.equal('bar');
    });

    it('should return a default inner value of undefined', () => {
        const store = createStore((get, set) => () => {
            return (...args) => {
                if (args.length > 0) {
                    set(...args);
                }
                return get();
            };
        });

        const value = store();
        expect(value()).to.equal(undefined);
    });

    it('should support subscribers to be called immediately and when the value changes', () => {
        const store = createStore((get, set) => (value) => {
            set(value);
            return (...args) => {
                if (args.length > 0) {
                    set(args[0]);
                }
                return get();
            };
        });

        const value = store('foo');

        const spy1 = sinon.spy();
        const spy2 = sinon.spy();

        value.subscribe(spy1);
        expect(spy1.callCount).to.equal(1);
        expect(spy1.args[0][0]).to.equal('foo');

        value.subscribe(spy2);
        expect(spy2.callCount).to.equal(1);
        expect(spy2.args[0][0]).to.equal('foo');

        value('bar');

        expect(spy1.callCount).to.equal(2);
        expect(spy1.args[1][0]).to.equal('bar');
        expect(spy2.callCount).to.equal(2);
        expect(spy2.args[1][0]).to.equal('bar');
        expect(spy1.calledBefore(spy2)).to.equal(true);
        
        value('baz');

        expect(spy1.callCount).to.equal(3);
        expect(spy1.args[2][0]).to.equal('baz');
        expect(spy2.callCount).to.equal(3);
        expect(spy2.args[2][0]).to.equal('baz');
    });

    it('should not allow the same function to subscribe more than once', () => {
        const store = createStore((get, set) => (value) => {
            set(value);
            return (...args) => {
                if (args.length > 0) {
                    set(args[0]);
                }
                return get();
            };
        });

        const value = store('foo');

        const spy = sinon.spy();

        value.subscribe(spy);
        value.subscribe(spy);
        value.subscribe(spy);

        expect(spy.callCount).to.equal(1);

        value('baz');

        expect(spy.callCount).to.equal(2);
    });

    it('should remove a subscriber', () => {
        const store = createStore((get, set) => (value) => {
            set(value);
            return (...args) => {
                if (args.length > 0) {
                    set(args[0]);
                }
                return get();
            };
        });

        const value = store('foo');

        const spy = sinon.spy();

        const unsubscribe = value.subscribe(spy);

        expect(spy.callCount).to.equal(1);

        value('bar');

        expect(spy.callCount).to.equal(2);
        
        unsubscribe();
        value('baz');

        expect(spy.callCount).to.equal(2);
    });

    it('should allow subscribers to remove themselves without disrupting others', () => {
        const store = createStore((get, set) => (value) => {
            set(value);
            return (...args) => {
                if (args.length > 0) {
                    set(args[0]);
                }
                return get();
            };
        });

        const value = store('foo');

        let unsubscribe;
        let doUnsubscribe = false;

        const spy1 = sinon.spy();
        const spy2 = sinon.spy(() => {
            if (doUnsubscribe) {
                unsubscribe();
            }
        });
        const spy3 = sinon.spy();

        value.subscribe(spy1);
        unsubscribe = value.subscribe(spy2);
        value.subscribe(spy3);

        expect(spy1.callCount).to.equal(1);
        expect(spy2.callCount).to.equal(1);
        expect(spy3.callCount).to.equal(1);

        value('bar');

        expect(spy1.callCount).to.equal(2);
        expect(spy2.callCount).to.equal(2);
        expect(spy3.callCount).to.equal(2);
        
        doUnsubscribe = true;
        value('baz');

        expect(spy1.callCount).to.equal(3);
        expect(spy2.callCount).to.equal(3);
        expect(spy3.callCount).to.equal(3);

        value('qux');

        expect(spy1.callCount).to.equal(4);
        expect(spy2.callCount).to.equal(3);
        expect(spy3.callCount).to.equal(4);
    });

    it('should return the new value within a subscriber', () => {
        const store = createStore((get, set) => (value) => {
            set(value);
            return (...args) => {
                if (args.length > 0) {
                    set(args[0]);
                }
                return get();
            };
        });

        const value = store('foo');

        const spy = sinon.spy(() => {
            if (spy.callCount === 1) {
                expect(value()).to.equal('foo');
            } else {
                expect(value()).to.equal('bar');
            }
        });

        value.subscribe(spy);
        expect(spy.callCount).to.equal(1);

        value('bar');
        expect(spy.callCount).to.equal(2);
    });

    it('should support multiple args to set and subscribers', () => {
        const store = createStore((get, set) => () => {
            return (...args) => {
                if (args.length > 0) {
                    set(...args);
                }
                return get();
            };
        });

        const value = store();
        expect(value()).to.equal(undefined);
        expect(value(1, 2, 3, 4, 5)).to.equal(1);
        expect(value()).to.equal(1);

        const spy = sinon.spy();
        value.subscribe(spy);
        expect(spy.callCount).to.equal(1);
        expect(spy.args[0].length).to.equal(1);
        expect(spy.args[0][0]).to.equal(1);

        value('foo', 'bar', 'baz');
        expect(value()).to.equal('foo');
        expect(spy.callCount).to.equal(2);
        expect(spy.args[1].length).to.equal(3);
        expect(spy.args[1][0]).to.equal('foo');
        expect(spy.args[1][1]).to.equal('bar');
        expect(spy.args[1][2]).to.equal('baz');
    });

    it('should support multiple instances of a store', () => {
        const store = createStore((get, set) => (value) => {
            set(value);
            return (...args) => {
                if (args.length > 0) {
                    set(...args);
                }
                return get();
            };
        });

        const value1 = store('foo');
        const value2 = store(1);

        expect(value1()).to.equal('foo');
        expect(value2()).to.equal(1);

        const spy1 = sinon.spy();
        const unsubscribe1 = value1.subscribe(spy1);
        expect(spy1.callCount).to.equal(1);

        const spy2 = sinon.spy();
        value2.subscribe(spy2);
        expect(spy2.callCount).to.equal(1);

        value1('bar');
        expect(value1()).to.equal('bar');
        expect(spy1.callCount).to.equal(2);
        expect(spy1.args[1][0]).to.equal('bar');
        expect(value2()).to.equal(1);
        expect(spy2.callCount).to.equal(1);

        value2(2);
        expect(value2()).to.equal(2);
        expect(spy2.callCount).to.equal(2);
        expect(spy2.args[1][0]).to.equal(2);
        expect(value1()).to.equal('bar');
        expect(spy1.callCount).to.equal(2);

        unsubscribe1();

        value1('baz');
        expect(value1()).to.equal('baz');
        expect(spy1.callCount).to.equal(2);
        expect(value2()).to.equal(2);
        expect(spy2.callCount).to.equal(2);
    });

    it('should support internal subscriptions', () => {
        const spy = sinon.spy();

        const store = createStore((get, set, subscribe) => (value, callback) => {
            expect(subscribe).to.be.a('function');
            
            set(value);
            subscribe(callback);
            return (...args) => {
                if (args.length > 0) {
                    set(...args);
                }
                return get();
            };
        });

        const value = store('foo', spy);
        expect(spy.callCount).to.equal(1);
        expect(spy.args[0][0]).to.equal('foo');

        value('bar');
        expect(spy.callCount).to.equal(2);
        expect(spy.args[1][0]).to.equal('bar');
    });

    it('should support access to the subscribers array', () => {
        let subscribersArray;

        const store = createStore((get, set, subscribe, subscribers) => () => {
            subscribersArray = subscribers;
            return (...args) => {
                if (args.length > 0) {
                    set(...args);
                }
                return get();
            };
        });

        const value = store('foo');

        expect(subscribersArray).to.be.an('array');
        expect(subscribersArray.length).to.equal(0);

        const spy = sinon.spy();
        const unsubscribe = value.subscribe(spy);

        expect(subscribersArray.length).to.equal(1);
        expect(subscribersArray[0]).to.equal(spy);

        unsubscribe();

        expect(subscribersArray.length).to.equal(0);
    });

    it('should create an object-based store', () => {
        const store = createStore((get, set) => () => {
            return {
                get,
                set
            };
        });

        const value = store();
        expect(value).to.be.an('object');
        expect(value.get).to.be.a('function');
        expect(value.set).to.be.a('function');
        expect(value.get()).to.equal(undefined);
        expect(value.set('foo')).to.equal('foo');
        expect(value.get()).to.equal('foo');

        const spy = sinon.spy();
        expect(value.subscribe).to.be.a('function');
        const unsubscribe = value.subscribe(spy);
        expect(spy.callCount).to.equal(1);

        value.set('bar');
        expect(value.get()).to.equal('bar');
        expect(spy.callCount).to.equal(2);
        expect(spy.args[1][0]).to.equal('bar');

        expect(unsubscribe).to.be.a('function');
        unsubscribe();

        value.set('baz');
        expect(value.get()).to.equal('baz');
        expect(spy.callCount).to.equal(2);
    });
});
