/**
 * useAndroidBack — makes the Android hardware back button (and back-swipe gesture)
 * run your own handler instead of closing the app.
 *
 * Usage in a screen:
 *   useAndroidBack(() => { onBack(); return true; });   // return true = we handled it
 *
 * Return true to consume the back press (stay in app, go to your previous screen).
 * Return false to let Android do its default (exit / go back in native stack).
 */
import { useEffect } from 'react';
import { BackHandler } from 'react-native';

export function useAndroidBack(handler: () => boolean) {
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', handler);
    return () => sub.remove();
  }, [handler]);
}
