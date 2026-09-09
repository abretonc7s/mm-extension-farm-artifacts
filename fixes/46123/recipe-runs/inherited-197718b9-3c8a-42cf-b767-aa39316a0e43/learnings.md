# Reviewer findings

- Transition cleanup: clearing account caches left REST callbacks active. Begin transitions through channel reset and prove late responses cannot repopulate positions, orders or account state.
- Initial snapshot ordering: blocking every pending-init payload dropped the new session's first snapshots. Test callbacks emitted inside the initialization RPC, before its promise resolves.
- Failure cleanup: accepting early snapshots also requires clearing them when initialization rejects. Test the failed session after it emits data.
- Race coverage: preserve rapid A to B to A and explicit-reset tests when adding cancellation. Serialized initialization and generation checks must continue to reject superseded work.
