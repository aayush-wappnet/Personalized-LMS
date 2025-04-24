import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { aliases, mdi } from 'vuetify/iconsets/mdi';

const lmsTheme = {
  dark: false,
  colors: {
    // primary: '#1976D2', // Blue for primary actions
    // secondary: '#424242', // Dark gray for secondary elements
    // accent: '#82B1FF', // Light blue for highlights
    // error: '#FF5252', // Red for errors
    // info: '#2196F3', // Blue for info
    // success: '#4CAF50', // Green for success
    // warning: '#FB8C00', // Orange for warnings
    // background: '#F5F5F5', // Light gray background
  },
};

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'lmsTheme',
    themes: {
      lmsTheme,
    },
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
});