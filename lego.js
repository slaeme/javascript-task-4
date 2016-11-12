'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;

function cloneObject(obj) {
    var copy = {};
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) {
            copy[attr] = clone(obj[attr]);
        }
    }

    return copy;
}

function cloneArray(array) {
    var copy = [];
    for (var i = 0, len = array.length; i < len; i++) {
        copy[i] = clone(array[i]);
    }

    return copy;
}

function clone(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    if (obj instanceof Array) {
        return cloneArray(obj);
    }
    if (obj instanceof Object) {
        return cloneObject(obj);
    }
}

exports.query = function (collection) {
    var cloneCollection = clone(collection);

    Array.from(arguments)
        .slice(1)
        .sort(function (a, b) {
            return b.priority - a.priority;
        })
        .forEach(function (operator) {
            cloneCollection = operator.func(cloneCollection);
        });

    return cloneCollection;
};

exports.select = function () {
    var selectedFields = Array.from(arguments);
    var func = function (collection) {
        return collection.map(function (itemCollection) {
            var collectionWithSelectedFields = {};
            for (var property in itemCollection) {
                if (!itemCollection.hasOwnProperty(property)) {
                    continue;
                }

                if (selectedFields.includes(property)) {
                    collectionWithSelectedFields[property] = itemCollection[property];
                }
            }

            return collectionWithSelectedFields;
        });
    };

    return {
        func: func,
        priority: 3
    };
};

exports.filterIn = function (property, values) {
    var func = function (collection) {
        return collection.filter(function (itemCollection) {
            if (itemCollection.hasOwnProperty(property)) {
                return values.includes(itemCollection[property]);
            }

            return false;
        });
    };

    return {
        func: func,
        priority: 5
    };
};

exports.sortBy = function (property, order) {
    var func = function (collection) {
        var cloneCollection = clone(collection);

        return cloneCollection.sort(function (a, b) {
            if (a.hasOwnProperty(property) && b.hasOwnProperty(property)) {
                if (order === 'desc') {
                    return a[property] > b[property] ? -1 : 1;
                }

                return a[property] > b[property] ? 1 : -1;
            }

            return 0;
        });
    };

    return {
        func: func,
        priority: 4
    };
};

exports.format = function (property, formatter) {
    var func = function (collection) {
        return collection.map(function (element) {
            if (element.hasOwnProperty(property)) {
                element[property] = formatter(element[property]);
            }

            return element;
        });
    };

    return {
        func: func,
        priority: 1
    };
};

exports.limit = function (count) {
    var func = function (collection) {
        var cloneCollection = clone(collection);

        return cloneCollection.slice(0, count);
    };

    return {
        func: func,
        priority: 2
    };
};

if (exports.isStar) {

    exports.or = function () {
        var conditions = Array.from(arguments);
        var func = function (collection) {
            return collection.filter(function (itemCollection) {
                return conditions.some(function (conditional) {
                    return conditional.func([itemCollection]).length;
                });
            });
        };

        return {
            func: func,
            priority: 5
        };
    };

    exports.and = function () {
        var conditions = Array.from(arguments);
        var func = function (collection) {
            return collection.filter(function (itemCollection) {
                return conditions.every(function (conditional) {
                    return conditional.func([itemCollection]).length;
                });
            });
        };

        return {
            func: func,
            priority: 5
        };
    };
}
