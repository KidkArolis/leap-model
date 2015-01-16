module("Immutability");

function create() {
    var model = new SuchModel.DeepModel({
        id: 123,
        user: {
            type: 'Spy',
            name: {
                first: 'Sterling',
                last: 'Archer'
            }
        }
    });

    return model;
}

test("get: returns deep cloned attributes", function() {
    var model = create();

    var name = model.get('user.name');
    deepEqual(name, {
        first: 'Sterling',
        last: 'Archer'
    });

    // attempt to pollute the model
    // by modifying values by reference
    name.first = 'Lana';
    name.last = 'Kane';

    deepEqual(model.get('user.name'), {
        first: 'Sterling',
        last: 'Archer'
    });
});

test("set: deep clones attributes before setting to the model", function() {
    var model = create();

    var user = model.get('user');

    var nextUser = {
        type: 'Agent',
        name: {
            first: 'Lana',
            last: 'Kane'
        }
    };

    model.set('user', nextUser);

    notEqual(model.get('user'), nextUser);

    // attempt to pollute the model
    // by modifying values after setting on the model
    nextUser.type = 'Secretary';
    nextUser.name.first = 'Cheryl';
    nextUser.name.last = 'Tunt';

    deepEqual(model.get('user'), {
        type: 'Agent',
        name: {
            first: 'Lana',
            last: 'Kane'
        }
    });
});

test("toJSON: deep clones attributes before returning", function() {
    var model = create();

    var modelJSON = model.toJSON();

    // attempt to pollute the model
    modelJSON.user.type = 'Secretary';

    deepEqual(model.get('user.type'), 'Spy');
});

// - @restorer