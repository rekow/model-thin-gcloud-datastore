# model-thin-gcloud-datastore

A Google Cloud Datastore storage adapter for the [`model-thin`](https://www.npmjs.com/package/model-thin) data layer, using the [gcloud-node](https://github.com/GoogleCloudPlatform/gcloud-node) library behind the scenes.

## installation 

Install alongside [`model-thin`](https://www.npmjs.com/package/model-thin) via `npm install model-thin-gcloud-datastore`, or as a dependency:

```json
dependencies: {
  "model-thin": ">=0.4.1",
  "model-thin-gcloud-datastore": "^1.3.0"
}
```

## usage and configuration

```javascript
var datastore = require('model-thin-gcloud-datastore');
```

Before use the adapter needs to be configured with your project's ID:

```javascript
datastore.configure({
  projectId: 'my-project'
});
```

A `namespace` and `apiEndpoint` property can also be provided on the config object to further customize the adapter.

If not running on Google Compute Engine, additional credentials need to be provided. See the [Authorization](https://github.com/GoogleCloudPlatform/gcloud-node#user-content-authorization) section of the `gcloud-node` readme for instructions.

Once configured, the adapter can be selected according to the `model-thin` [adapter API](https://github.com/davidrekow/model-thin#adapters).

Check out the [`query` method](https://github.com/davidrekow/model-thin-gcloud-datastore/blob/master/index.js#L129:L185) for a look at how passed query options are utilized, and see the [datastore query docs](https://googlecloudplatform.github.io/gcloud-node/#/docs/datastore/query) for the expected values.
