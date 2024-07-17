# Freedesktop Notification Reader
Reads windows notifications from database 
## Usage
```typescript
import { getNotification } from '@usama8800/windows-notification-reader';

// From Application
const chromeNoti = await getNotification({from: 'Chrome'});

// With header
const instaNoti = await getNotification({head: 'Instagram'});

// Regex match on body
const messageNoti = await getNotification({head: 'Instagram', body: /inta_username: /i});

// Old notification (not dismissed)
const oldNoti = await getNotification({after: Date.now() - 60_000_000});
```
