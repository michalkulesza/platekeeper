self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      if (list.length > 0) {
        list[0].postMessage({ type: "TIMER_NAVIGATE", url });
        return list[0].focus();
      }
      return clients.openWindow(url);
    })
  );
});
