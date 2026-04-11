// apps/web/public/sw.js
self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : { title: 'grit.io', body: 'New update available' };
  const options = {
    body: data.body,
    icon: '/icon.png',
    badge: '/favicon.png',
    data: data.url
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Periodic Sync or background check for daily reminders if browser supports it
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'daily-reminder') {
    event.waitUntil(sendDailyReminder());
  }
});

async function sendDailyReminder() {
  const options = {
    body: 'Initialize your daily habits and architect your path for today.',
    icon: '/icon.png',
    badge: '/favicon.png',
    data: '/dashboard/daily-checklist'
  };
  return self.registration.showNotification('Morning Pulse Check ☀️', options);
}

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  if (event.notification.data) {
    event.waitUntil(
      clients.openWindow(event.notification.data)
    );
  }
});
