/// <reference path="nano.d.ts" />
/// <reference path="../express/express.d.ts" />

import nano = require('nano');

nano('http://localhost:5984');

nano.db.create('alice');

nano.db.use('alice');

{
  let server = nano<nano>('http://localhost:5984');

  // clean up the database we created previously
  server.db.destroy('alice', function() {
    // create a new database
    server.db.create('alice', function() {
      // specify the database we are going to use
      var alice = nano.use('alice');
      // and insert a document in it
      alice.insert({ crazy: true }, 'rabbit', function(err, body, header) {
        if (err) {
          console.log('[alice.insert] ', err.message);
          return;
        }
        console.log('you have inserted the rabbit.')
        console.log(body);
      });
    });
  });
}

{
  let db = nano<nano.DatabaseScope>(
    { "url"             : "http://localhost:5984/foo"
    , "requestDefaults" : { "proxy" : "http://someproxy" }
    , "log"             : function (id, args) {
        console.log(id, args);
      }
    });


}
