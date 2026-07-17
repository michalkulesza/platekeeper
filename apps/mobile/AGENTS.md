# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

## Bottom sheets

- Use `@gorhom/bottom-sheet`'s `BottomSheetModal` for every bottom card/sheet. Do not build a bespoke React Native `Modal` bottom sheet.
- Match the Add Recipe drawer: `enablePanDownToClose`, a `BottomSheetBackdrop` that dismisses on tap, the standard handle indicator, and `secondarySystemBackground` as the sheet surface.
- Do not add close, done, or cancel buttons solely to dismiss a bottom sheet. A sheet must close by tapping the backdrop or pulling it down. Keep action buttons only when they perform a real domain action.

## Full-screen cooking UI

- Respect top and bottom safe-area insets, and use `useResolvedColorScheme()` so screens follow Carrot's Appearance preference rather than only the device trait.
- Timer displays based on timestamps must trigger a one-second render tick while running.
- When step typography is auto-fitted, measure it before revealing the new step; fade out, fit while hidden, then fade in to avoid visible reflow.

## Share extension

`expo-sharing` in `app.json` creates and embeds the iOS Share Extension
during every prebuild. Keep its extension bundle ID
`com.kulesza.carrot.ShareExtension` and App Group
`group.com.kulesza.carrot` aligned with the identifiers registered in
Apple Developer.
