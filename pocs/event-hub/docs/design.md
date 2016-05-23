Design of Event Hub
-------

__Table of Contents__

<!-- MarkdownTOC -->

- [Work Flow](#work-flow)
  - [Coordination](#coordination)
- [APIs](#apis)
  - [Event Hub APIs](#event-hub-apis)
    - [`register` a service](#register-a-service)
    - [`list` all of the services \(sync\)](#list-all-of-the-services-sync)
    - [`get` a service \(sync\)](#get-a-service-sync)
    - [check if a service `exists` \(sync\)](#check-if-a-service-exists-sync)
    - [`subscribe` the subject from a service](#subscribe-the-subject-from-a-service)
    - [`unregister` a service](#unregister-a-service)
    - [`publish` a message of a service](#publish-a-message-of-a-service)
    - [`notify` the subscribers of a service](#notify-the-subscribers-of-a-service)
    - [Inform the subscribers of a service that a subject is `done`](#inform-the-subscribers-of-a-service-that-a-subject-is-done)
    - [Inform the subscribers of a service that a subject is `error`](#inform-the-subscribers-of-a-service-that-a-subject-is-error)
  - [Event Service APIs \(Internal Only\)](#event-service-apis-internal-only)
    - [`subscribe` the subject from a service \(sync\)](#subscribe-the-subject-from-a-service-sync)
    - [`publish` a message of a service](#publish-a-message-of-a-service-1)
    - [`notify` the subscribers of a service](#notify-the-subscribers-of-a-service-1)
    - [Inform the subscribers of a service that a subject is `done`](#inform-the-subscribers-of-a-service-that-a-subject-is-done-1)
    - [Inform the subscribers of a service that a subject is `error`](#inform-the-subscribers-of-a-service-that-a-subject-is-error-1)
    - [`reset` a service \(sync\)](#reset-a-service-sync)

<!-- /MarkdownTOC -->

<a name="work-flow"></a>
## Work Flow

A service provider can `register` a service to Event Hub.
A service consumer can `subscribe` to a service with 4 kinds of callbacks:

  - `on` when the service `publish` a message.
  - `notify` when the service `notify` a message.
  - `done` when the service send a `done` message.
  - `error` when the service send an `error` message.

A service can be `unregister` from Event Hub.

<a name="coordination"></a>
### Coordination

Any one can retrieve a service from the Event Hub.

One can subscribe any of the `on`, `notify`, `done` and `error` messages of a service.

One can `publish` a message through the service, and optionally provide callbacks to `notify`, `done` and `error` messages of the service.

Once one receives a message of `on`, one can response for it with `notify`, `done` or `error` API.

  - When `notify` message is fired, the `done` callback of the parameters calling `publish` will be call after a `done` message is fired.
  - If no `notify` message is fired after `on`, the `done` callback of the parameters will be called directly.
  - Either `error` message or any error captured by Event Hub will trigger the `error` callbacks.

<a name="apis"></a>
## APIs

Apart from those marked as `sync`, all of the other APIs return promises.

<a name="event-hub-apis"></a>
### Event Hub APIs

<a name="register-a-service"></a>
#### `register` a service

When register a service with a `subject`, in the format below, the corresponding postal topics with affix `*-in-progress`, `*-done` and `*-error` will also be created automatically.

```javascript
register( {
  name: 'subject-name', // [required] subject name for quick referencing
  opts: {
    channel: 'channel-name', // [optional] postal channel, fall back to the default channel when omitted
    topic: 'topic-name' // [required] postal topic
  }
} );
```

<a name="list-all-of-the-services-sync"></a>
#### `list` all of the services (sync)

Return a list of service names.

```javascript
list( );
```

<a name="get-a-service-sync"></a>
#### `get` a service (sync)

Return a service with `publish`, `notify`, `done`, `error` and `unregister` API.

```javascript
get( 'subject-name' );
```

<a name="check-if-a-service-exists-sync"></a>
#### check if a service `exists` (sync)

Return `true`/`false`.

```javascript
exists( 'subject-name' );
```

<a name="subscribe-the-subject-from-a-service"></a>
#### `subscribe` the subject from a service

When subscribe a subject of a service, `on`, `notify`, `done` and `error` callbacks could be provided optionally.

- `on` callback will be called when the message is published.  
- `notify` callback will be called when the `*-in-progress` topic is triggered.  
- `done` callback will be called when the `*-done` topic is triggered.  
- `error` callback will be called when the `*-error` topic is triggered.  

```javascript
subscribe( 'subject-name', {
  on: onMessageCallback,
  notify: notifyCallback,
  done: doneCallback,
  error: errorCallback
} );
```

<a name="unregister-a-service"></a>
#### `unregister` a service

When unregister a service with the `subject` name, the corresponding postal topics with affix `*-in-progress`, `*-done` and `*-error` will also be removed automatically.

```javascript
unregister( 'subject-name' );
```

<a name="publish-a-message-of-a-service"></a>
#### `publish` a message of a service

When publish a message of a service, `data`, `notify`, `done` and `error` callbacks could be provided optionally.

- `notify` callback will be called when the `*-in-progress` topic is triggered.
- `done` callback will be called when the `*-done` topic is triggered.
- `error` callback will be called when the `*-error` topic is triggered.

```javascript
publish( 'subject-name', {
  data: anyData,
  notify: notifyCallback,
  done: doneCallback,
  error: errorCallback
} );
```

<a name="notify-the-subscribers-of-a-service"></a>
#### `notify` the subscribers of a service

Use to trigger the `*-in-progress` topic. `done` and `error` callback could be provided optionally.

- `done` callback will be called when the `*-done` topic is triggered.
- `error` callback will be called when the `*-error` topic is triggered.

```javascript
notify( 'subject-name', {
  data: anyData,
  done: doneCallback,
  error: errorCallback
} );
```

<a name="inform-the-subscribers-of-a-service-that-a-subject-is-done"></a>
#### Inform the subscribers of a service that a subject is `done`

Use to trigger the `*-done` topic.

```javascript
done( 'subject-name', data );
```

<a name="inform-the-subscribers-of-a-service-that-a-subject-is-error"></a>
#### Inform the subscribers of a service that a subject is `error`

Use to trigger the `*-error` topic.

```javascript
error( 'subject-name', data );
```

<a name="event-service-apis-internal-only"></a>
### Event Service APIs (Internal Only)

___NOTE___ _that the service APIs are only supposed to be used by event hub. Use Event Hub APIs instead of Event Service APIs._

<a name="subscribe-the-subject-from-a-service-sync"></a>
#### `subscribe` the subject from a service (sync)

When subscribe a subject of a service, `on`, `notify`, `done` and `error` callbacks could be provided optionally.

- `on` callback will be called when the message is published.  
- `notify` callback will be called when the `*-in-progress` topic is triggered.  
- `done` callback will be called when the `*-done` topic is triggered.  
- `error` callback will be called when the `*-error` topic is triggered.  

```javascript
subscribe( {
  on: onMessageCallback,
  notify: notifyCallback,
  done: doneCallback,
  error: errorCallback
} );
```

<a name="publish-a-message-of-a-service-1"></a>
#### `publish` a message of a service

When publish a message of a service, `data`, `notify`, `done` and `error` callbacks could be provided optionally.

- `notify` callback will be called when the `*-in-progress` topic is triggered.
- `done` callback will be called when the `*-done` topic is triggered.
- `error` callback will be called when the `*-error` topic is triggered.

```javascript
publish( {
  data: anyData,
  notify: notifyCallback,
  done: doneCallback,
  error: errorCallback
} );
```

<a name="notify-the-subscribers-of-a-service-1"></a>
#### `notify` the subscribers of a service

Use to trigger the `*-in-progress` topic. `done` and `error` callback could be provided optionally.

- `done` callback will be called when the `*-done` topic is triggered.
- `error` callback will be called when the `*-error` topic is triggered.

```javascript
notify( {
  data: anyData,
  done: doneCallback,
  error: errorCallback
} );
```

<a name="inform-the-subscribers-of-a-service-that-a-subject-is-done-1"></a>
#### Inform the subscribers of a service that a subject is `done`

Use to trigger the `*-done` topic.

```javascript
done( data );
```

<a name="inform-the-subscribers-of-a-service-that-a-subject-is-error-1"></a>
#### Inform the subscribers of a service that a subject is `error`

Use to trigger the `*-error` topic.

```javascript
error( data );
```

<a name="reset-a-service-sync"></a>
#### `reset` a service (sync)

This is only clean up all of the subscriptions subscribing the service.

```javascript
reset( );
```

