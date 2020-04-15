export default function createStore(setup) {
    let value;
    const subscribers = [];
    const get = () => value;
    const set = (val) => {
        value = val;
        emit(value);
        return value;
    };
    const subscribe = (subscriber, immediate = false) => {
        if (!subscribers.includes(subscriber)) {
            subscribers.push(subscriber);
            if (immediate === true) {
                subscriber(value, null);
            }
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
            };
        }
    };
    const emit = (val) => {
        subscribers.slice().forEach((subscriber) => subscriber(val));
    };
    const constructor = setup(get, set, subscribe, subscribers);
    const callback = (val = null) => {
        const inner = constructor(val);
        inner.subscribe = subscribe;
        return inner;
    };
    return callback;
}
