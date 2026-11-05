# Xserver backend recovery

The production scripts live in `/home/xs799946/mountain-info.com/script`:

- `backend-pids.sh` finds Java processes belonging to the current account, then checks their exact `-jar` argument in `/proc`.
- `keepalive-backend.sh` checks for a missing backend and uses `flock` to serialize recovery attempts.
- `restart-backend.sh` restarts only the matching backend processes.

The scripts must be executable and installed together. The existing application deployment workflow does not install them.

Production cron:

```cron
*/5 * * * * /home/xs799946/mountain-info.com/script/keepalive-backend.sh >> /home/xs799946/mountain-info.com/backend/keepalive.log 2>&1
```

Do not use `pgrep -f` with only the JAR name in the cron command: the cron shell itself can match that pattern, preventing recovery when Java is absent.

The previous cron and restart script were backed up on the server in `script/backup-keepalive-20261105T135427Z` before applying this fix. Validation covered an unchanged running backend PID, a simulated missing backend invoking a restart stub, and an overlapping check skipping the restart.
