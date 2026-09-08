# MyTellinex Support Read Feature Gate

`VITE_MYTELLINEX_LIVE_SUPPORT=false` by default.

This gate authorizes read-only retrieval of the authenticated customer's own support-ticket summaries after the Support identity contract and RLS isolation proof passed in production.

Allowed browser fields:
- ticket id
- subject
- ticket type
- status
- priority
- created_at
- resolved_at

Not authorized by this gate:
- customer-facing ticket creation UI
- ticket update/closure by customers
- staff assignment controls
- resolution details in Home
- raw internal notes
- bypassing RLS or using a service-role key

The frontend adapter must filter on verified `auth.getClaims()` user identity even though RLS remains the authoritative boundary.
