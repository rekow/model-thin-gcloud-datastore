/**
 * @file `model-thin` storage adapter for Google Cloud Datastore.
 * @author David Rekow <d@davidrekow.com>
 */

var gcloud = require('gcloud')

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
    var key = this.key(model);

    this.ds.save({
      key: key,
      data: model._prop
    }, function (err) {
      if (err) {
        cb(err);
      }

      model.id(key.path[key.path.length - 1]);
      cb();
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
      filters = queryOpts.filters;

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

    this.ds.runQuery(query, cb);
  }
};