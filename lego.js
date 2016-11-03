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
    var friends = clone(collection);

    Array.from(arguments)
        .slice(1)
        .sort(function (a, b) {
            return b.priority - a.priority;
        })
        .forEach(function (operator) {
            friends = operator.func(friends);
        });

    return friends;
};

exports.select = function () {
    var selectedFields = Array.from(arguments);
    var func = function (friends) {
        var friendsWithSelectedFields = friends.map(function (friend) {
            var friendWithSelectedFields = {};
            for (var property in friend) {
                if (!friend.hasOwnProperty(property)) {
                    continue;
                }

                if (selectedFields.includes(property)) {
                    friendWithSelectedFields[property] = friend[property];
                }
            }

            return friendWithSelectedFields;
        });

        return friendsWithSelectedFields;
    };

    return {
        func: func,
        priority: 3
    };
};

exports.filterIn = function (property, values) {
    var func = function (friends) {
        return friends.filter(function (friend) {
            if (friend.hasOwnProperty(property)) {
                return values.includes(friend[property]);
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
    var func = function (friends) {
        friends = friends.sort(function (a, b) {
            if (a.hasOwnProperty(property) && b.hasOwnProperty(property)) {
                return a[property] > b[property] ? 1 : -1;
            }

            return 0;
        });
        if (order === 'desc') {
            return friends.reverse();
        }

        return friends;
    };

    return {
        func: func,
        priority: 4
    };
};

exports.format = function (property, formatter) {
    var func = function (friends) {
        friends.forEach(function (friend) {
            if (friend.hasOwnProperty(property)) {
                friend[property] = formatter(friend[property]);
            }
        });

        return friends;
    };

    return {
        func: func,
        priority: 1
    };
};

exports.limit = function (count) {
    var func = function (friends) {
        return friends.slice(0, count);
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
            return collection.filter(function (condition) {
                return conditions.some(function (conditionalTest) {
                    return conditionalTest.func([condition]).length > 0;
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
            return collection.filter(function (condition) {
                return conditions.every(function (conditionalTest) {
                    return conditionalTest.func([condition]).length > 0;
                });
            });
        };

        return {
            func: func,
            priority: 5
        };
    };
}
