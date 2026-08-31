# LINE WORKS Directory Sync and OAuth

LINE WORKS Directory API users/orgunits are linked to existing internal employee/group records.
The default mode is link-only: existing employee, group, and leave data is preserved.

## OAuth login

The login page supports LINE WORKS Authorization Code login. Register this exact callback URL in the LINE WORKS Developer Console:

`https://mountain-info.com/oauth/lineworks/callback`

Enable the `openid`, `profile`, and `email` scopes. After authentication, the server matches the LINE WORKS `sub` (user ID) or email to an existing employee and issues a local JWT using the existing employee number. Password login remains available.

LINE WORKS users that are not yet represented by an employee record are not auto-created by OAuth. This is intentional until the onboarding flow can collect required HR fields such as birth date and join date without affecting leave calculations.

## Environment

Set these values in production:

```bash
LINE_WORKS_ENABLED=true
LINE_WORKS_CLIENT_ID=...
LINE_WORKS_CLIENT_SECRET=...
LINE_WORKS_SERVICE_ACCOUNT=...
LINE_WORKS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
LINE_WORKS_OAUTH_REDIRECT_URI="https://mountain-info.com/oauth/lineworks/callback"
LINE_WORKS_SYNC_CRON="0 15 2 * * *"
```

The sync uses Service Account JWT authentication and read scopes for users, email/profile, groups, and orgunits.

## Manual Sync

Run from the admin settings screen or call:

```http
POST /api/v1/lineworks/sync/directory
Authorization: Bearer {adminAccessToken}
```

If credentials are missing or `LINE_WORKS_ENABLED=false`, the endpoint returns a disabled result without changing data.

## Production Schema

`application-prod.yml` uses `ddl-auto=validate`, so add these columns before deploying the entity changes:

```sql
ALTER TABLE employees
  ADD COLUMN line_works_user_id VARCHAR(100) NULL,
  ADD COLUMN line_works_external_key VARCHAR(100) NULL,
  ADD UNIQUE KEY uk_employees_line_works_user_id (line_works_user_id),
  ADD UNIQUE KEY uk_employees_line_works_external_key (line_works_external_key);

ALTER TABLE `groups`
  ADD COLUMN line_works_org_unit_id VARCHAR(100) NULL,
  ADD COLUMN line_works_external_key VARCHAR(100) NULL,
  ADD UNIQUE KEY uk_groups_line_works_org_unit_id (line_works_org_unit_id),
  ADD UNIQUE KEY uk_groups_line_works_external_key (line_works_external_key);
```

## Mapping Rules

- Existing employees are matched by existing LINE WORKS user ID, LINE WORKS external key, employee number, or email.
- Matched employees only receive `line_works_user_id` and `line_works_external_key`.
- LINE WORKS users that cannot be matched to an existing employee are skipped.
- Existing groups are matched by existing LINE WORKS orgunit ID, LINE WORKS external key, group name, or orgunit name.
- Matched groups only receive `line_works_org_unit_id` and `line_works_external_key`.
- LINE WORKS orgunits that cannot be matched to an existing group are skipped.
- Orgunit memberships do not replace internal `group_members` in link-only mode.
- Internal-only fields such as `excludeFromApproval` remain managed in this system.
