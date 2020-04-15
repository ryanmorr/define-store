export default function createStore(setup) {
    let value = null;
    const subscribers = [];
    const get = () => value;
    const set = (...args) => {
        value = args[0];
        emit(...args);
        return value;
    };
    const subscribe = (subscriber, immediate = false) => {
        if (!subscribers.includes(subscriber)) {
            subscribers.push(subscriber);
            if (immediate === true) {
                subscriber(value);
            }
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
            };
        }
    };
    const emit = (...args) => {
        subscribers.slice().forEach((subscriber) => subscriber(...args));
    };
    const constructor = setup(get, set, subscribe, subscribers);
    const callback = (...args) => {
        const inner = constructor(...args);
        inner.subscribe = subscribe;
        return inner;
    };
    return callback;
}
