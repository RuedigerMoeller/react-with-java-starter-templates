# Extended React App Template

Minimal react example with jnpm/bundling/hot reloading. Uses a stateful Server. For each client session a session actor is scheduled. The 
session actor is reachable only from the associated client. It times out and is removed if the client is inactive. It is resurrected once
a request from the client comes in.

Just add e.g. `import { Card, Icon, Button } from 'semantic-ui-react'` to a jsx file, then refresh app in browser in
order to let jnpm download and install the required dependency.


Also adds a config file boilerplate + Event Emitter (@ App level, KISS).

* TODO: redirect logging to your favourite logger using `org.nustaq.kontraktor.util.Log#setLogWrapper`
* see main readme on how to scaffold.
