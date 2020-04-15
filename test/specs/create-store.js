import { expect } from 'chai';
import sinon from 'sinon';
import createStore from '../../src/create-store';

describe('create-store', () => {
    it('should create a basic function-based observable store', () => {
        const store = createStore((get, set, subscribe, subscribers) => () => {
            expect(get).to.be.a('function');
            expect(set).to.be.a('function');
            expect(subscribe).to.be.a('function');
            expect(subscribers).to.be.an('array');

            return (...args) => {
                if (args.length === 1) {
                    set(args[0]);
                }
                return get();
            };
        });

        const value = store();
        expect(value).to.be.a('function');
        expect(value()).to.equal(null);
        expect(value('foo')).to.equal('foo');
        expect(value()).to.equal('foo');

        const spy = sinon.spy();
        expect(value.subscribe).to.be.a('function');
        const unsubscribe = value.subscribe(spy);
        expect(spy.callCount).to.equal(0);

        value('bar');
        expect(value()).to.equal('bar');
        expect(spy.callCount).to.equal(1);
        expect(spy.args[0][0]).to.equal('bar');

        expect(unsubscribe).to.be.a('function');
        unsubscribe();

        value('baz');
        expect(value()).to.equal('baz');
        expect(spy.callCount).to.equal(1);
    });

    it('should create a basic object-based observable store', () => {
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
        expect(value.get()).to.equal(null);
        expect(value.set('foo')).to.equal('foo');
        expect(value.get()).to.equal('foo');

        const spy = sinon.spy();
        expect(value.subscribe).to.be.a('function');
        const unsubscribe = value.subscribe(spy);
        expect(spy.callCount).to.equal(0);

        value.set('bar');
        expect(value.get()).to.equal('bar');
        expect(spy.callCount).to.equal(1);
        expect(spy.args[0][0]).to.equal('bar');

        expect(unsubscribe).to.be.a('function');
        unsubscribe();

        value.set('baz');
        expect(value.get()).to.equal('baz');
        expect(spy.callCount).to.equal(1);
    });

    it('should return a default inner value of null', () => {
        const store = createStore((get, set) => () => {
            return (...args) => {
                if (args.length > 0) {
                    set(...args);
                }
                return get();
            };
        });

        const value = store();
        expect(value()).to.equal(null);
    });

    it('should create a store with an initial value', () => {
        const store = createStore((get, set) => (value) => {
            set(value);
            return get;
        });

        const value = store('foo');
        expect(value()).to.equal('foo');
    });

    it('should support multiple args to set and subscribers', () => {
        const store = createStore((get, set) => (value = null) => {
            set(value);
            return (...args) => {
                if (args.length > 0) {
                    set(...args);
                }
                return get();
            };
        });

        const value = store();
        expect(value()).to.equal(null);
        expect(value(1, 2, 3, 4, 5)).to.equal(1);
        expect(value()).to.equal(1);

        const spy = sinon.spy();
        value.subscribe(spy);

        value('foo', 'bar', 'baz');
        expect(value()).to.equal('foo');
        expect(spy.callCount).to.equal(1);
        expect(spy.args[0][0]).to.equal('foo');
        expect(spy.args[0][1]).to.equal('bar');
        expect(spy.args[0][2]).to.equal('baz');
    });
});
