# Pharmacist Connect: deployment and operation

## Current safety state

The messaging feature is **disabled for public use by default**. Set `PHARMACIST_CONNECT_OPERATIONAL=true` only after the service owner has named real pharmacist staff, confirmed their work schedule and response workflow, approved a privacy and retention policy, and confirmed escalation procedures. The setting alone does not grant inbox access.

Grant inbox access from a trusted application shell to an individual account with:

```sh
php artisan pharmacist:staff staff@example.org
```

Revoke it with:

```sh
php artisan pharmacist:staff staff@example.org --revoke
```

This command can grant access to a user or admin account, but neither role gets access implicitly. Do not run the grant command until the person's pharmacist credentials and operational assignment have been verified outside the application. No staff permission is seeded. Revoking a staff member returns all of their assigned conversations to the authorized staff queue without deleting messages.

Admins can also grant or revoke inbox membership on `/admin/users`. The page exposes controls only for accounts with the `user` role; existing admin accounts and roles are not changed through these controls. Each actual state transition is recorded in the additive `pharmacist_staff_audits` table with the acting admin ID, target user ID, action, prior/new membership state, and timestamp. The audit table has no account foreign keys so its numeric actor and target IDs remain available if a user is later removed. Audit rows are not editable through the application.

If the last active staff membership is revoked while the environment gate is configured on, `PharmacistConnectService::isOperational()` returns false because it also requires an active staff member. The admin page warns that public intake is effectively unavailable; the Railway environment variable itself is not changed by the application.

## Data and privacy

`pharmacist_conversations`, `pharmacist_messages`, and `pharmacist_staff` are additive tables. The migration does not modify survey tables or existing records. Message bodies use Laravel's encrypted Eloquent cast and require the existing `APP_KEY` to remain available and stable; the raw message body is not written to application logs. Do not rotate `APP_KEY` without a separately tested key-rotation plan. There is no automated transcript deletion until a retention policy is approved. The migration intentionally refuses automatic rollback because dropping these tables would erase consultation history.

The user may read only conversations they own. Active pharmacist staff can read unassigned conversations or conversations assigned to them; claiming an unassigned thread is an atomic operation. Once assigned, other staff cannot read it. Admin status does not grant transcript access. All message routes are authenticated, rate limited, and validate plain text up to 4,000 characters. Attachments and arbitrary HTML are not supported.

The user page explains that this is not an emergency service, automatic diagnosis, or substitute for in-person care. It does not promise 24/7 coverage or response times. Staff online presence is not yet tracked; the page must not be described as live-staff availability based on an active account alone.

## Railway configuration

The existing `railway.json` pre-deploy command runs the current web release tasks: `php artisan migrate --force`, followed by `ResearchInstrumentSeeder --force`. The command is guarded by `ABX_PROCESS`: it defaults to the web process and skips both tasks when `ABX_PROCESS=websocket`. Keep the existing web pre-deploy behavior; do not configure the Reverb service to run migrations or seeders. The survey seeder is part of the existing deployment contract and is not a pharmacist staff seeder.

The web application keeps polling available when Reverb is not configured. Reverb-specific values are optional for fallback operation:

| Variable | Purpose |
| --- | --- |
| `BROADCAST_CONNECTION` | **Web:** set to `reverb` only after the WebSocket service is running; otherwise keep `null`. |
| `REVERB_APP_ID` | **Web + Reverb:** shared Reverb application identifier. |
| `REVERB_APP_KEY` | **Web + Reverb:** shared application key, intentionally sent to authenticated browser sessions; it is not the signing secret. |
| `REVERB_APP_SECRET` | **Web + Reverb:** shared signing secret, server-side only. Never use a `VITE_` prefix. |
| `REVERB_HOST` | **Web:** private Railway hostname of the Reverb service, without scheme. |
| `REVERB_PORT` | **Web:** private listener port matching the Reverb service's `$PORT` (normally `8080`). |
| `REVERB_SCHEME` | **Web:** internal publishing scheme, normally `http` over Railway private networking. |
| `REVERB_PUBLIC_HOST` | **Web + Reverb:** public Railway domain assigned to the WebSocket service, without scheme. |
| `REVERB_PUBLIC_PORT` | **Web:** public WebSocket port, normally `443` for a Railway HTTPS domain. |
| `REVERB_PUBLIC_SCHEME` | **Web:** browser scheme; use `https` to connect with WSS. |
| `REVERB_ALLOWED_ORIGINS` | **Web + Reverb:** comma-separated allowed ABX Guard web hostnames, without scheme; never `*` in production. |
| `PHARMACIST_CONNECT_OPERATIONAL` | **Web:** keep `false` until the operational readiness conditions above are met. |
| `PHARMACIST_CONNECT_POLL_INTERVAL_MS` | Web polling fallback cadence; bounded by the application to 5–30 seconds. |
| `ABX_PROCESS` | **Reverb service:** set to `websocket`. The web service should leave this unset or use `web`. |
| `REVERB_SERVER_HOST` | **Reverb service:** listener bind address; default `0.0.0.0`. |
| `REVERB_SERVER_PORT` | **Reverb service:** fallback listener port only when Railway does not inject `PORT`. The entrypoint prioritizes `$PORT`. |
| `CACHE_STORE` | **WebSocket process:** the entrypoint forces Laravel's file cache so Reverb's restart-marker lookup cannot fall back to SQLite when web database variables are absent. This does not change the web process cache store. |

Do not enter secret values in Git, `VITE_*`, or this document. Set `REVERB_APP_SECRET` as a Railway secret in both the web and Reverb services. The key, app ID, and internal/public host/port variables must match the same Reverb application.

### Reverb service layout

The project Docker image supports both the existing FrankenPHP web process and a dedicated Reverb process. Keep the existing ABX Guard service running with the default process. In the same Railway project and environment, create a second service from the same repository and Dockerfile, set `ABX_PROCESS=websocket`, and expose the service's HTTP listener port (the container binds Reverb to `0.0.0.0:$PORT`, normally `8080`) on a generated Railway domain. The entrypoint selects file cache for this process because Reverb accesses Laravel cache at startup; it does not need the web database for that cache access. Railway terminates public HTTPS/WSS at the edge. Do not point browser clients to the private host. The web service publishes events to the Reverb service's private hostname and listener port over HTTP.

After setting Reverb variables, redeploy both services. In browser developer tools, verify a WSS connection to the public WebSocket host, successful authenticated `POST /broadcasting/auth`, and incoming `pharmacist.message.created` events on a `private-pharmacist.conversations.*` channel using two authorized accounts. Also verify an unrelated account receives 403 at channel authorization. Until this two-sided check succeeds, the UI continues polling and must be reported as fallback mode.

Leave the service start command unset so the image entrypoint selects the process. Setting `ABX_PROCESS=websocket` selects Reverb; an explicit command replaces the entrypoint and must bind to `$PORT`. The pre-deploy command checks `ABX_PROCESS` and skips migrations/seeding for this service. The app image and Reverb service must use matching Reverb app credentials. Railway private hostnames are reachable only between services in the same project/environment; browsers must use the public domain. See [Railway start commands](https://docs.railway.com/deployments/start-command), [Railway private networking](https://docs.railway.com/networking/private-networking), and [Laravel Reverb production configuration](https://laravel.com/docs/12.x/reverb).

## Safe rollout

1. Review the additive migration and test the release against a production-like PostgreSQL copy.
2. Deploy with `PHARMACIST_CONNECT_OPERATIONAL=false` and run the normal `php artisan migrate --force` pre-deploy command. Never use `migrate:fresh`.
3. Check the web service health, login, user access controls, and the empty staff inbox. No staff access is granted automatically.
4. Create the dedicated Reverb service and verify WSS plus private channel authorization. Until then, messages (when the operational gate is intentionally enabled) use polling.
5. Only after the named staff, schedule, privacy/retention policy, and procedures are approved should the operator grant staff membership and set `PHARMACIST_CONNECT_OPERATIONAL=true`.
6. Verify a user-to-staff and staff-to-user message on two browser sessions. Confirm an unassigned thread can be claimed once, a different user cannot read it, and an unrelated admin cannot access the inbox or channel.

The current environment has not been deployed or verified against Railway. Production database connectivity, assigned staff, domain/port configuration, WSS, and live two-way delivery remain unverified until the rollout checks above are performed.
