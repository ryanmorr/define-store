export default function createStore(setup) {
    return (...initArgs) => {
        let value;
        const subscribers = [];
        const get = () => value;
        const set = (...setArgs) => {
            value = setArgs[0];
            subscribers.slice().forEach((subscriber) => subscriber(...setArgs));
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
        const store = constructor(...initArgs);
        if (!store.subscribe) {
            store.subscribe = subscribe;
        }
        return store;
    };
}
