/**
 * @file Example configuration and usage.
 */

var Model = require('model-thin');

var Person = Model.create('Person', {
  name: String,
  age: Number,
  greet: function () {
    return 'Hi, my name is ' + this.name + ' and I\'m ' + this.age + ' years old.';
  }
});

Person.defineProperty('parent', Person);

var datastore = require('./index');

/**
 * The Datastore needs to know your project id (found in the Google Developer Console).
 * You can also customize namespace and endpoint settings (see the `configure` method of
 * the adapter for type and naming information).
 *
 * This example will run but no operations will work, as the configuration isn't real.
 */
datastore.configure({
  projectId: 'my-project'
});

/**
 * You can install and use an anonymous adapter directly.
 */
Person.useAdapter(datastore);

/**
 * You can also expose the adapter by name via the {@link Model#adapters} method.
 */
Model.adapters('gcloud-datastore', datastore);
Person.useAdapter('gcloud-datastore');
