/// <reference path="kue.d.ts" />

import kue = require('kue');

var queue = kue.createQueue();

var job = queue.create('email', {
    title: 'welcome email for tj'
  , to: 'tj@learnboost.com'
  , template: 'welcome-email'
}).save( function(err){
   if( !err ) console.log( job.id );
});

queue.create('email', {
    title: 'welcome email for tj'
  , to: 'tj@learnboost.com'
  , template: 'welcome-email'
}).priority('high').save();

queue.create('email', {
     title: 'welcome email for tj'
   , to: 'tj@learnboost.com'
   , template: 'welcome-email'
 }).priority('high').attempts(5).save();

 // Honor job's original delay (if set) at each attempt, defaults to fixed backoff
job.attempts(3).backoff( true )

// Override delay value, fixed backoff
job.attempts(3).backoff( {delay: 60*1000, type:'fixed'} )

// Enable exponential backoff using original delay (if set)
job.attempts(3).backoff( {type:'exponential'} )

// Use a function to get a customized next attempt delay value
job.attempts(3).backoff( function( attempts, delay ){
  return 123;
})

queue.create('email', {title: 'email job with TTL'}).ttl(300).save();

job.log('$%d sent to %s', 123, 'Bob');

job.progress(6, 10);

var job = queue.create('video conversion', {
    title: 'converting loki\'s to avi'
  , user: 1
  , frames: 200
});

job.on('complete', function(result){
  console.log('Job completed with data ', result);

}).on('failed attempt', function(errorMessage, doneAttempts){
  console.log('Job failed');

}).on('failed', function(errorMessage){
  console.log('Job failed');

}).on('progress', function(progress, data){
  console.log('\r  job #' + job.id + ' ' + progress + '% complete with data ', data );

});

queue.on('job enqueue', function(id, type){
  console.log( 'Job %s got queued of type %s', id, type );

}).on('job complete', function(id, result){
  kue.Job.get(id, function(err, job){
    if (err) return;
    job.remove(function(err){
      if (err) throw err;
      console.log('removed completed job #%d', job.id);
    });
  });
});

var emailJob = queue.create('email', {
    title: 'Account renewal required'
  , to: 'tj@learnboost.com'
  , template: 'renewal-email'
}).delay(250)
  .priority('high')
  .save();

interface Email {
  to: string;
}

queue.process<Email>('email', function(job, done){
  sendEmail(job.data.to, done);
});

function isValidEmail(address: string): boolean { return true; }

function sendEmail(address: string, done: kue.ErrBack) {
  if(!isValidEmail(address)) {
    //done('invalid to address') is possible but discouraged
    return done(new Error('invalid to address'));
  }
  // email send stuff...
  done();
}

queue.process('email', 20, function(job, done){
  // ...
});

queue.process('email', function(job: any, ctx: kue.Context, done: kue.ErrBack){
  ctx.pause( 5000, function(err){
    console.log("Worker is paused... ");
    setTimeout( function(){ ctx.resume(); }, 10000 );
  });
});

interface Slide {
  width: number;
  height: number;
}

interface SlideShow {
  slides: Slide[]
}

function renderSlide(slide: Slide, callback: (err?: any) => void): void {}

queue.process<SlideShow>('slideshow pdf', 5, function(job, done){
  var slides = job.data.slides
    , len = slides.length;

  function next(i: number) {
    var slide = slides[i]; // pretend we did a query on this slide id ;)
    job.log('rendering %dx%d slide', slide.width, slide.height);
    renderSlide(slide, function(err){
      if (err) return done(err);
      job.progress(i, len, {nextSlide : i == len ? 'itsdone' : i + 1});
      if (i == len) done()
      else next(i + 1);
    });
  }

  next(0);
});

process.once( 'SIGTERM', function () {
  queue.shutdown( 5000, function(err) {
    console.log( 'Kue shutdown: ', err||'' );
    process.exit( 0 );
  });
});

queue.on( 'error', function( err ) {
  console.log( 'Oops... ', err );
});

queue.watchStuckJobs();

queue.inactiveCount( function( err, total ) { // others are activeCount, completeCount, failedCount, delayedCount
  if( total > 100000 ) {
    console.log( 'We need some back pressure here' );
  }
});

queue.failedCount( 'my-critical-job', function( err, total ) {
  if( total > 10000 ) {
    console.log( 'This is tOoOo bad' );
  }
});

queue.inactive( function( err, ids ) { // others are active, complete, failed, delayed
  // you may want to fetch each id to get the Job object out of it...
});

kue.Job.rangeByState( 'failed', 0, 10, 'asc', function( err, jobs ) {
  // you have an array of maximum n Job objects here
});

kue.Job.rangeByType( 'my-job-type', 'failed', 0, 10, 'asc', function( err, jobs ) {
  // you have an array of maximum n Job objects here
});

queue.active( function( err, ids ) {
  ids.forEach( function( id ) {
    kue.Job.get( id, function( err, job ) {
      // Your application should check if job is a stuck one
      job.inactive();
    });
  });
});

queue.create('email').removeOnComplete( true ).save();

kue.Job.rangeByState( 'complete', 0, 19, 'asc', function( err, jobs ) {
  jobs.forEach( function( job ) {
    job.remove( function(){
      console.log( 'removed ', job.id );
    });
  });
});

var q = kue.createQueue({
  prefix: 'q',
  redis: {
    port: 1234,
    host: '10.0.50.20',
    auth: 'password',
    db: 3, // if provided select a non-default redis db
    options: {
      // see https://github.com/mranney/node_redis#rediscreateclient
    }
  }
});

var q = kue.createQueue({
  redis: 'redis://example.com:1234?redis_option=value&redis_option=value'
});

var q = kue.createQueue({
  prefix: 'q',
  redis: {
    socket: '/data/sockets/redis.sock',
    auth: 'password',
    options: {
      // see https://github.com/mranney/node_redis#rediscreateclient
    }
  }
});

kue.app.listen(3000);

kue.app.set('title', 'My Application');

queue.create('email', {
    title: 'welcome email for tj'
  , to: 'tj@learnboost.com'
  , template: 'welcome-email'
}).searchKeys( ['to', 'title'] ).save();

q = kue.createQueue({
  disableSearch: false
});
