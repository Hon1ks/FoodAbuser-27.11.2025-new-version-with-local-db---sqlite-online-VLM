import { MD3LightTheme as DefaultTheme, MD3DarkTheme as DarkTheme } from 'react-native-paper';
import { useColorScheme } from 'react-native';

const lightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#4B3FAE',
    secondary: '#6C63FF',
    background: '#fff',
    surface: '#fff',
    text: '#222',
  },
};

const darkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#6C63FF',
    secondary: '#4B3FAE',
    background: '#181A20',
    surface: '#232634',
    text: '#fff',
  },
};

export default function theme() {
  const scheme = useColorScheme();
  return scheme === 'dark' ? darkTheme : lightTheme;
} 