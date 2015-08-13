/**
 * @file `model-thin` storage adapter for Google Cloud Datastore.
 * @author David Rekow <d@davidrekow.com>
 */

var gcloud = require('gcloud'),
  Model = require('model-thin');

/**
 * @interface DatastoreKey
 */

/**
 * @type {Array}
 * @name DatastoreKey#path
 */

/**
 * @type {string=}
 * @name DatastoreKey#namespace
 */


module.exports = {
  ds: null,

  /**
   * @param {Object} config
   * @param {string} config.projectId
   * @param {string=} config.namespace
   * @param {string=} config.apiEndpoint
   */
  configure: function (config) {
    this.ds = gcloud.datastore.dataset(config);
    this.configured = true;
  },

  /**
   * @param {Model}
   * @return {DatastoreKey}
   */
  key: function (model) {
    var path = [model.kind];

    if (model.id()) {
      path.push(model.id())
    }

    return this.ds.key({
      path: path,
      namespace: model.constructor.namespace || this.ds.namespace
    });
  },

  /**
   * @param {Model}
   * @param {function(Error=)=} cb
   */
  persist: function (model, cb) {
    var key = this.key(model),
      data = model._prop,
      entities = [], entity;

    for (var k in data) {
      if (data[k] instanceof Model) {
        entity = data[k];
        data[k] = this.key(data[k]);

        if (entity._changed) {
          entities.push({
            key: data[k],
            data: entity._prop
          });
        }
      }
    }

    entities.push({
      key: key,
      data: data
    });

    this.ds.save(entities, function (err) {
      if (err) {
        cb(err);
      }

      model.id(key.path[key.path.length - 1]);

      if (cb) {
        cb();
      }
    });
  },

  /**
   * @param {Model} model
   * @param {function(?Error, ?=)=} cb
   */
  remove: function (model, cb) {
    this.ds.delete(this.key(model), cb);
  },

  /**
   * @param {Model} model
   * @param {function(?Error, Model=)} cb
   */
  retrieve: function (model, cb) {
    this.ds.get(this.key(model), function (err, entity) {
      if (err) {
        return cb(err);
      }

      if (!entity) {
        return cb({
          code: 404,
          message: 'Not found'
        });
      }

      cb(null, model.set(entity.data));
    });
  },

  /**
   * @param {Query} queryOpts
   * @param {function(?Error, Array.<Object>=, string=)} cb
   */
  query: function (queryOpts, cb) {
    var query = this.ds.createQuery(
      queryOpts.namespace || this.ds.namespace,
      queryOpts.kind),
      cursor, filters;

    if (queryOpts.select) {
      query.select(queryOpts.select);
    }

    if (filters) {
      filters = queryOpts.filter;

      for (var k in filters) {
        if (k === 'ancestor' || k === 'hasAncestor') {
          query.hasAncestor(filters[k]);
        } else {
          query.filter(k, filters[k]);
        }
      }
    }

    if (queryOpts.group) {
      query.groupBy(queryOpts.group);
    }

    if (queryOpts.limit) {
      query.limit(queryOpts.limit);
    }

    if (queryOpts.sort) {
      query.order(queryOpts.sort);
    }

    if (queryOpts.cursor) {
      cursor = queryOpts.cursor;

      if (cursor.start) {
        query.start(cursor.start);
      }
      if (cursor.end) {
        query.end(cursor.end);
      }
    }

    if (queryOpts.offset) {
      query.offset(queryOpts.offset);
    }

    this.ds.runQuery(query, function (err, entities, cursor) {
      if (err) {
        return cb(err);
      }

      cb(null, entities, cursor);
    }, cb);
  },

  /**
   * @param {Object.<{key: DatastoreKey, data: Object}>} entity
   * @param {function(new:Model)} kind
   * @return {Model}
   */
  toModel: function (entity, kind) {
    var model = new kind(entity.data);
    model.id(entity.key.path[entity.key.path.length - 1])
    return model;
  }
};
