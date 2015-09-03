/// <reference path="../request/request.d.ts" />

declare module 'nano' {
  import request = require('request');

  module nano {
    interface NanoOptions {
      url: string;
      request?: typeof request;
      requestDefaults?: request.Options;
      follow?: Function;
      log?: Function;
      parseUrl?: boolean;
      searchVendor?: string;
    }

    interface NanoRequestOptions {
      db?: string;
      method?: string;
      path?: string;
      doc?: string;
      att?: string;
      qs?: Object;
      content_type?: string;
      headers?: Object;
      body?: Object;
      encoding?: string;
      multipart: Object[];
    }

    // http://docs.couchdb.org/en/latest/api/database/changes.html#get--db-_changes
    interface FollowOptions {
      doc_ids?: string[];
      conflicts?: boolean;
      descending?: boolean;
      feed?: string;
      filter?: string | Function;
      heartbeat?: number;
      include_docs?: boolean;
      attachments?: boolean;
      att_encoding_info?: boolean;
      'last-event-id'?: number;
      limit?: number;
      since?: number | string;
      style?: string;
      timeout?: number;
      view?: string;
    }

    // http://docs.couchdb.org/en/latest/api/server/common.html#db-updates
    interface DbUpdatesQueryParameters {
      feed?: string;
      timeout?: number;
      heartbeat?: boolean;
    }

    interface ResponseCallback {
      (err: Error, body?: any, headers?: any): void;
    }

    interface GenericCallback<T> {
      (err: Error, body?: T, headers?: any): void;
    }

    interface ServerScope {
      <T extends ServerScope | DatabaseScope>(cfg: string): T;
      <T extends ServerScope | DatabaseScope>(cfg: NanoOptions): T;

      db: {
        create(name: string, callback?: ResponseCallback): void;

        get(name: string, callback?: ResponseCallback): void;

        destroy(name: string, callback?: ResponseCallback): void;

        list(callback?: GenericCallback<string[]>): void;

        use(name: string): DatabaseScope;

        scope(name: string): DatabaseScope;

        compact(name: string, ddoc: string, callback?: ResponseCallback): void;
        compact(name: string, callback?: ResponseCallback): void;

        replicate(source: string, target: string, opts: Object, callback?: ResponseCallback): void;
        replicate(source: string, target: string, callback?: ResponseCallback): void;

        changes(name: string, opts: Object, callback?: ResponseCallback): void;
        changes(name: string, callback?: ResponseCallback): void;

        follow(name: string, opts: FollowOptions, callback?: ResponseCallback): void;
        follow(name: string, callback?: ResponseCallback): void;

        followUpdates(opts: FollowOptions, callback?: ResponseCallback): void;
        followUpdates(callback?: ResponseCallback): void;

        updates(opts: DbUpdatesQueryParameters, callback?: ResponseCallback): void;
        updates(callback?: ResponseCallback): void;
      };

      config: {
        url?: string;
        db?: string;
      };

      use(name: string): DatabaseScope;

      scope(name: string): DatabaseScope;

      request(options: NanoRequestOptions, callback?: ResponseCallback): void;

      relax(options: NanoRequestOptions, callback?: ResponseCallback): void;

      dinosaur(options: NanoRequestOptions, callback?: ResponseCallback): void;

      auth(username: string, password: string, callback: ResponseCallback): void;

      session(callback: ResponseCallback): void;

      updates(opts: DbUpdatesQueryParameters, callback?: ResponseCallback): void;
      updates(callback?: ResponseCallback): void;

      followUpdates(opts: FollowOptions, callback?: ResponseCallback): void;
      followUpdates(callback?: ResponseCallback): void;
    }

    interface DatabaseScope {
      info(callback?: ResponseCallback): void;

      replicate(target: string, opts: Object, callback?: ResponseCallback): void;
      replicate(target: string, callback?: ResponseCallback): void;

      compact(ddoc: string, callback?: ResponseCallback): void;
      compact(callback?: ResponseCallback): void;

      changes(opts: Object, callback?: ResponseCallback): void;
      changes(callback?: ResponseCallback): void;

      follow(opts: FollowOptions, callback?: ResponseCallback): void;
      follow(callback?: ResponseCallback): void;

      auth(username: string, password: string, callback: ResponseCallback): void;

      session(callback: ResponseCallback): void;

      insert(doc: Object, docName: string, callback?: ResponseCallback): void;
      insert(doc: Object, opts: Object, callback?: ResponseCallback): void;
      insert(doc: Object, callback?: ResponseCallback): void;

      get(docName: string, opts: Object, callback?: ResponseCallback): void;
      get(docName: string, callback?: ResponseCallback): void;

      head(docName: string, callback?: ResponseCallback): void;

      copy(docSrc: Object, docDest: string, opts: Object, callback?: ResponseCallback): void;
      copy(docSrc: Object, docDest: string, callback?: ResponseCallback): void;

      destroy(docName: string, rev: string, callback?: ResponseCallback): void;

      bulk(docs: Object[], opts: Object, callback?: ResponseCallback): void;

      list(opts: Object, callback?: ResponseCallback): void;
      list(callback?: ResponseCallback): void;

      fetch(docNames: string[], opts: Object, callback?: ResponseCallback): void;
      fetch(docNames: string[], callback?: ResponseCallback): void;

      fetchRevs(docNames: string[], opts: Object, callback?: ResponseCallback): void;
      fetchRevs(docNames: string[], callback?: ResponseCallback): void;

      config: {
        url: string;
        db: string;
      };

      multipart: {
        insert(doc: Object, attachments: Object[], docName: string, callback?: ResponseCallback): void;
        insert(doc: Object, attachments: Object[], opts: Object, callback?: ResponseCallback): void;

        get(docName: string, opts: Object, callback?: ResponseCallback): void;
        get(docName: string, callback?: ResponseCallback): void;
      };

      attachment: {
        insert(docName: string, attName: string, att: Object, contentType: string, opts: Object, callback?: ResponseCallback): void;
        insert(docName: string, attName: string, att: Object, contentType: string, callback?: ResponseCallback): void;

        get(docName: string, attName: string, opts: Object, callback?: ResponseCallback): void;
        get(docName: string, attName: string, callback?: ResponseCallback): void;

        destroy(docName: string, attName: string, opts: Object, callback?: ResponseCallback): void;
      };

      show(ddoc: string, viewName: string, docName: string, opts: Object, callback?: ResponseCallback): void;

      atomic(ddoc: string, viewName: string, docName: string, body: Object, callback?: ResponseCallback): void;

      updateWithHandler(ddoc: string, viewName: string, docName: string, body: Object, callback?: ResponseCallback): void;

      search(ddoc: string, viewName: string, opts: Object, callback?: ResponseCallback): void;

      spatial(ddoc: string, viewName: string, opts: Object, callback?: ResponseCallback): void;

      view(ddoc: string, viewName: string, opts: Object, callback?: ResponseCallback): void;

      viewWithList(ddoc: string, viewName: string, listName: string, opts: Object, callback?: ResponseCallback): void;
    }
  }

  var nano: nano.ServerScope;
  export = nano;
}
