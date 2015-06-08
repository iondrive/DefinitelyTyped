/// <reference path="../express/express.d.ts" />
/// <reference path="../redis/redis.d.ts" />

declare module 'kue' {
  import express = require('express');
  import redis = require('redis');

  module kue {
    interface QueueOptions {
      prefix?: string;
      redis?: string | {
        socket?: string;
        port?: number;
        host?: string;
        auth?: string;
        db?: number;
        options?: redis.ClientOpts;
        createClientFactory?: () => any;
      };
      jobEvents?: boolean;
      disableSearch?: boolean;
    }

    interface ErrBack {
      (err?: any): void;
    }

    interface Context {
      pause(milliseconds: number, callback?: ErrBack): void;
      resume(): void;
    }

    interface ProcessFunction<T, R> {
      (job: Job<T>, done: (err: any, result?: R) => void): void;
      (job: Job<T>, ctx: Context, done: (err: any, result?: R) => void): void;
    }

    interface BackoffOptions {
      delay?: number;
      type?: string;
    }

    interface BackoffFunction {
      (attempts: number, delay: number): number;
    }
  }

  class Job<T> {
    id: string;
    data: T;
    result: any;

    /**
     * Initialize a new `Job` with the given `type` and `data`.
     */
    constructor(type: string, data: T);

    on(event: string, callback: (...args: any[]) => void): Job<T>;

    /**
     * Return JSON-friendly object.
     */
    toJSON(): string;

    /**
     * Log `str` with sprintf-style variable args.
     *
     * Examples:
     *
     *    job.log('preparing attachments');
     *    job.log('sending email to %s at %s', user.name, user.email);
     *
     * Specifiers:
     *
     *   - %s : string
     *   - %d : integer
     */
    log(str: string, ...args: any[]): Job<T>;

    /**
     * Set job `key` to `val`.
     */
    set(key: string, val: string, callback?: (err: any) => void): Job<T>;

    /**
     * Get job `key`
     */
    get(key: string, callback?: (err: any, val: string) => void): Job<T>;

    /**
     * Set the job progress by telling the job
     * how `complete` it is relative to `total`.
     * data can be used to pass extra data to job subscribers
     */
    progress(complete: number, total: number, data?: any): Job<T>;
    progress(complete: number, data?: any): Job<T>;
    progress(): number;

    /**
     * Set the job delay in `ms`.
     */
    delay(ms: number): Job<T>;
    delay(): number;

    removeOnComplete(flag: boolean): Job<T>;
    removeOnComplete(): boolean;

    backoff(flag: boolean): Job<T>;
    backoff(options: kue.BackoffOptions): Job<T>;
    backoff(fn: kue.BackoffFunction): Job<T>;
    backoff(): boolean | kue.BackoffOptions | kue.BackoffFunction;

    ttl(ms: number): Job<T>;

    /**
     * Set or get the priority `level`, which is one
     * of "low", "normal", "medium", and "high", or
     * a number in the range of -10..10.
     */
    priority(level: string): Job<T>;
    priority(): string;

    /**
     * Increment attempts, invoking callback `fn(remaining, attempts, max)`.
     */
    attempt(fn: (err: any, remaining: number, attempts: number, max: number) => void): Job<T>;

    /**
     * Set max attempts to `n`.
     */
    attempts(n: number): Job<T>;

    searchKeys(keys: string[]): Job<T>;
    searchKeys(keys: string): Job<T>;
    searchKeys(): string[];

    /**
     * Remove the job and callback `fn(err)`.
     */
    remove(fn?: kue.ErrBack): Job<T>;

    /**
     * Set state to `state`.
     */
    state(state: string, fn?: kue.ErrBack): Job<T>;

    /**
     * Set the job's failure `err`.
     */
    error(err: Error): Job<T>;

    /**
     * Set state to "complete", and progress to 100%.
     */
    complete(fn?: kue.ErrBack): Job<T>;

    /**
     * Set state to "failed".
     */
    failed(fn?: kue.ErrBack): Job<T>;

    /**
     * Set state to "inactive".
     */
    inactive(fn?: kue.ErrBack): Job<T>;

    /**
     * Set state to "active".
     */
    active(fn?: kue.ErrBack): Job<T>;

    /**
     * Set state to "delayed".
     */
    delayed(fn?: kue.ErrBack): Job<T>;

    /**
     * Save the job, optionally invoking the callback `fn(err)`.
     */
    save(fn?: kue.ErrBack): Job<T>;

    /**
     * Update the job and callback `fn(err)`.
     */
    update(fn?: kue.ErrBack): Job<T>;

    /**
     * Subscribe this job for event mapping.
     */
    update(fn?: kue.ErrBack): Job<T>;

    static disableSearch: boolean;

    static jobEvents: boolean;

    /**
     * Default job priority map.
     */
    static priorities: { [priority: string]: number };

    /**
     * Get with the range `from`..`to` and invoke callback `fn(err, jobs)`.
     */
    static range<T>(from: number, to: number, order: string, fn: (err: any, jobs: Job<T>[]) => void): void;

    /**
     * Get jobs of `state`, with the range `from`..`to` and invoke callback `fn(err, jobs)`.
     */
    static rangeByState<T>(state: string, from: number, to: number, order: string, fn: (err: any, jobs: Job<T>[]) => void): void;


    /**
     * Get jobs of `type` and `state`, with the range `from`..`to` and invoke callback `fn(err, jobs)`.
     */
    static rangeByType<T>(type: string, state: string, from: number, to: number, order: string, fn: (err: any, jobs: Job<T>[]) => void): void;

    /**
     * Get job with `id` and callback `fn(err, job)`.
     */
    static get<T>(id: string, fn: (err: any, job: Job<T>) => void): void;

    /**
     * Remove job `id` if it exists and invoke callback `fn(err)`.
     */
    static remove(id: string, fn: kue.ErrBack): void;

    /**
     * Get log for job `id` and callback `fn(err, log)`.
     */
    static log(id: string, fn: (err: any, log: string[]) => void): void;
  }

  class Queue {
    /**
     * Initialize a new job `Queue`.
     */
    constructor(options?: kue.QueueOptions);

    /**
     * Create a `Job` with the given `type` and `data`.
     */
    create<T>(type: string, data?: any): Job<T>;
    createJob<T>(type: string, data?: any): Job<T>;

    /**
     * Proxy to auto-subscribe to events.
     */
    on(event: string, callback: (...args: any[]) => void): Queue;

    /**
     * Runs a LUA script to diff inactive jobs ZSET cardinality
     * and helper pop LIST length each `ms` milliseconds and syncs helper LIST.
     */
    watchStuckJobs(ms?: number): void;

    /**
     * Get setting `name` and invoke `fn(err, res)`.
     */
    setting(name: string, fn: (err: any, res: string) => void): Queue;

    /**
     * Process jobs with the given `type`, invoking `fn(job)`.
     */
    process<T>(type: string, concurrency: number, fn: (job: Job<T>, callback: kue.ErrBack) => void): void;
    process<T>(type: string, concurrency: number, fn: (job: Job<T>, ctx: kue.Context, callback: kue.ErrBack) => void): void;
    process<T>(type: string, fn: (job: Job<T>, callback: kue.ErrBack) => void): void;
    process<T>(type: string, fn: (job: Job<T>, ctx: kue.Context, callback: kue.ErrBack) => void): void;

    /**
     * Graceful shutdown
     */
    shutdown(timeout: number, type: string, callback: kue.ErrBack): Queue;
    shutdown(timeout: number, callback: kue.ErrBack): Queue;
    shutdown(callback: kue.ErrBack): Queue;

    /**
     * Get the job types present and callback `fn(err, types)`.
     */
    types(fn: (err: any, types: string[]) => void): Queue;

    /**
     * Return job ids with the given `state`, and callback `fn(err, ids)`.
     */
    state(state: string, fn: (err: any, ids: string[]) => void): Queue;

    /**
     * Get queue work time in milliseconds and invoke `fn(err, ms)`.
     */
    workTime(dn: (err: any, ms: number) => void): Queue;

    /**
     * Get cardinality of jobs with given `state` and `type` and callback `fn(err, n)`.
     */
    cardByType(type: string, state: string, fn: (err: any, n: number) => void): Queue;

    /**
     * Get cardinality of `state` and callback `fn(err, n)`.
     */
    card(state: string, fn: (err: any, n: number) => void): Queue;

    /**
     * Completed jobs.
     */
    complete(fn: (err: any, ids: string[]) => void): Queue;

    /**
     * Failed jobs.
     */
    failed(fn: (err: any, ids: string[]) => void): Queue;

    /**
     * Inactive jobs (queued).
     */
    inactive(fn: (err: any, ids: string[]) => void): Queue;

    /**
     * Active jobs (mid-process).
     */
    active(fn: (err: any, ids: string[]) => void): Queue;

    /**
     * Delayed jobs.
     */
    delayed(fn: (err: any, ids: string[]) => void): Queue;

    /**
     * Completed jobs of type `type` count.
     */
    completeCount(type: string, fn: (err: any, n: number) => void): Queue;
    completeCount(fn: (err: any, n: number) => void): Queue;

    /**
     * Failed jobs of type `type` count.
     */
    failedCount(type: string, fn: (err: any, n: number) => void): void;
    failedCount(fn: (err: any, n: number) => void): void;

    /**
     * Inactive jobs (queued) of type `type` count.
     */
    inactiveCount(type: string, fn: (err: any, n: number) => void): void;
    inactiveCount(fn: (err: any, n: number) => void): void;

    /**
     * Active jobs (mid-process) of type `type` count.
     */
    activeCount(type: string, fn: (err: any, n: number) => void): void;
    activeCount(fn: (err: any, n: number) => void): void;

    /**
     * Delayed jobs of type `type` count.
     */
    delayedCount(type: string, fn: (err: any, n: number) => void): void;
    delayedCount(fn: (err: any, n: number) => void): void;

    /**
     * Test mode for convenience in test suites
     */
    testMode: {
      /**
       *   Array of jobs added to the queue
       */
      jobs: Job<any>[],

      /**
       *   Enable test mode.
       */
      enter(): void;

      /**
       *   Disable test mode.
       */
      exit(): void;

      /**
       *   Clear the array of queued jobs
       */
      clear(): void;
    };

    /**
     * Library version.
     */
    static version: string;

    /**
     * Expose `Job`.
     */
    static Job: typeof Job;

    /**
     * Server instance (that is lazily required)
     */
    static app: express.Application;

    /**
     * Expose the RedisClient factory.
     */
    static redis: redis.RedisClient;

    /**
     * Create a new `Queue`.
     */
    static createQueue(options?: kue.QueueOptions): Queue;

    /**
     * Store workers
     */
    static workers: any[];
  }

  // module Queue {
  //   var Job: typeof Job;
  // }

  var kue: typeof Queue;
  export = kue;
}
