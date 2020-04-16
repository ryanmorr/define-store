export default function createStore(setup) {
    return (...args) => {
        let value;
        const subscribers = [];
        const get = () => value;
        const set = (...args) => {
            value = args[0];
            subscribers.slice().forEach((subscriber) => subscriber(...args));
            return value;
        };
        const subscribe = (callback) => {
            if (!subscribers.includes(callback)) {
                subscribers.push(callback);
                callback(value);
                return () => {
                    const index = subscribers.indexOf(callback);
                    if (index !== -1) {
                        subscribers.splice(index, 1);
                    }
                };
            }
        };
        const constructor = setup(get, set, subscribe, subscribers);
        const store = constructor(...args);
        store.subscribe = subscribe;
        return store;
    };
}
