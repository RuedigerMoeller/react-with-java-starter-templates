# Extended React App Template

Minimal react example with jnpm/bundling/hot reloading. Uses a stateful Server. For each client session a session actor is scheduled. The 
session actor is reachable only from the associated client. It times out and is removed if the client is inactive. It is resurrected once
a request from the client comes in.

Also adds a config file boilerplate + Event Emitter (@ App level, KISS).

* see main readme on how to scaffold.
