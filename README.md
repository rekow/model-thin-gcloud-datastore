# model-thin-gcloud-datastore

A Google Cloud Datastore storage adapter for the [`model-thin`](https://www.npmjs.com/package/model-thin) data layer, using the [gcloud-node](https://github.com/GoogleCloudPlatform/gcloud-node) library behind the scenes.

## installation 

Install alongside [`model-thin`](https://www.npmjs.com/package/model-thin) via `npm install model-thin-gcloud-datastore`, or as a dependency:

```json
dependencies: {
  "model-thin": ">=0.3.0",
  "model-thin-gcloud-datastore": "^1.1.1"
}
```

## usage and configuration

```javascript
var datastore = require('model-thin-gcloud-datastore');
```

Before use the adapter needs to be configured with your project's ID, found in the developer console:

```javascript
datastore.configure({
  projectId: 'my-project'
});
```

A `namespace` and `apiEndpoint` property can also be provided on the config object to further customize the adapter.

Once configured, the adapter can be selected directly on a class:

```javascript
Model.useAdapter(datastore);
```

or can be exposed for usage as part of your app init via the `model-thin` adapter API:

```javascript
Model.adapters('datastore', datastore);
...
// elsewhere in the codebase
Model.useAdapter('datastore');
```

Check out the [`query` method](https://github.com/davidrekow/model-thin-gcloud-datastore/blob/master/index.js#L103:L157) for a look at how passed query options are utilized, and see the [datastore query docs](https://googlecloudplatform.github.io/gcloud-node/#/docs/datastore/query) for the expected values.
