# Validated Concerns

CDP validation performed before including concerns:

- Placeholder concern validated by recipe node `ac3-assert-placeholder-state`: live input placeholder is `0.00`, while the linked ticket asks for a constraint placeholder.
- Tab-order concern validated by recipe nodes `ac4-key-tab-1`, `ac4-assert-tab-reaches-token`, `ac4-key-tab-2`, `ac4-assert-tab-reaches-percent`: live focus order moved from size -> token amount -> amount slider.
- Submit hang concern was validated positively by recipe nodes `ac14-key-enter-submit`, `ac17-wait-market-detail`, `ac17-wait-position-live`, and `ac17-assert-route-position`: Enter submit reached market detail with a live position and no stuck submitting toast.
- RPC malformed error concern was validated by unit test `metaRPCClientFactory.test.js`: bad `error.message` values reject and clear pending requests.
