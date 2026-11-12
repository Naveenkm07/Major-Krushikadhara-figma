import { Alert, Platform } from 'react-native';
import { registerRootComponent } from 'expo';

import App from './App';

// Enable native browser dialogs for React Native Alert.alert calls when running on Web
if (Platform.OS === 'web' && typeof window !== 'undefined') {
  const alertObj = Alert as { alert: Function };
  alertObj.alert = (title: string, message?: string, buttons?: any[]) => {
    const fullText = message ? `${title}\n\n${message}` : title;
    if (Array.isArray(buttons) && buttons.length > 1) {
      const actionBtn =
        buttons.find((b) => b && b.style === 'destructive') ||
        buttons.find((b) => b && b.style !== 'cancel') ||
        buttons[buttons.length - 1];
      const cancelBtn = buttons.find((b) => b && b.style === 'cancel');
      if (window.confirm(fullText)) {
        if (actionBtn && typeof actionBtn.onPress === 'function') actionBtn.onPress();
      } else {
        if (cancelBtn && typeof cancelBtn.onPress === 'function') cancelBtn.onPress();
      }
      return;
    }
    window.alert(fullText);
    if (Array.isArray(buttons) && buttons[0] && typeof buttons[0].onPress === 'function') {
      buttons[0].onPress();
    }
  };
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
