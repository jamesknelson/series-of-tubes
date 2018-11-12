series-of-tubes
===============

*A TypeScript utility for passing typed messages between windows.*

```bash
npm install series-of-tubes -s
```

## Usage

Define the types of messages that can be sent/received using TypeScript object types, as so:

```typescript
type InMessages = {
  'fetch-complete': {
    url: string,
    content: string,
  }

  'fetch-failure': {
    url: string,
  }
}

type OutMessages = {
  'init': {},

  'error': {
    name: string,
    message?: string,
  },
}
```

Then create a typed series of tubes by passing your In and Out types as type parameters to `createSeriesOfTubes`, along with an `id` that is shared between both endpoints, and the window object to send messages to. 

```typescript
const tubes = createSeriesOfTubes<InMessages, OutMessages>({
  id: "secret-so-please-don't-look",
  destination: window.top,

  // If provided, messages will be ignored unless prefixed with this.
  inNamespace: 'island/'

  // If provided, all outgoing messages will be prefixed with this.
  outNamespace: 'motherland/'
})
```

Finally, subscribe to and dispatch messages along your shiny new series of tubes.

```typescript
tubes.dispatch('error', {
  name: 'OhFuckError',
  message: 'Something went wrong',
})

tubes.subscribeTo('fetch-complete', payload => {
  console.log('received url', payload.url)
})

tubes.subscribe((type, payload) => {
  switch (type) {
    case 'fetch-complete':
      console.log('received url', payload.url)
      break
    
    case 'fetch-failure':
      console.log('computer says noooo.')
      break
  }
})
```