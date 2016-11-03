'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;

exports.query = function (collection) {
    var friends = collection.slice();
    console.info(friends);
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
        return friends.sort(function (a, b) {
            if (a.hasOwnProperty(property) && b.hasOwnProperty(property)) {
                if (order === 'desc') {
                    return a[property] < b[property] ? 1 : -1;
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
    console.info(count);
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
