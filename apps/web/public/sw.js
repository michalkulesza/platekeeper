self.addEventListener("notificationclick", (event) => {
  // Don't close — leave it in the OS notification centre for history
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
