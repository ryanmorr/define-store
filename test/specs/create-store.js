import { expect } from 'chai';
import sinon from 'sinon';
import createStore from '../../src/create-store';

describe('create-store', () => {
    it('should create a basic function-based observable store', () => {
        const store = createStore((get, set, subscribe, subscribers) => (value) => {
            expect(get).to.be.a('function');
            expect(set).to.be.a('function');
            expect(subscribe).to.be.a('function');
            expect(subscribers).to.be.an('array');

            set(value);
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
});
