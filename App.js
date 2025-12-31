// Polyfill для buffer (необходим для react-native-svg)
import { Buffer } from 'buffer';
if (typeof global.Buffer === 'undefined') {
  global.Buffer = Buffer;
}

// Постепенное добавление компонентов
import 'react-native-gesture-handler';

import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { ThemeProvider } from './src/context/ThemeContext';
import { SettingsProvider } from './src/context/SettingsContext';
import { MealProvider } from './src/context/MealContext';
import { WeightProvider } from './src/context/WeightContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import AppNavigator from './src/navigation';
import theme from './src/theme';
import * as DatabaseService from './src/services/DatabaseService';

// Компонент для условной навигации в зависимости от статуса аутентификации
function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [dbInitialized, setDbInitialized] = React.useState(false);

  // Инициализация базы данных при первом запуске
  React.useEffect(() => {
    const initDatabase = async () => {
      try {
        await DatabaseService.initDB();
        setDbInitialized(true);
        console.log('✅ Root App: Database initialization completed');
      } catch (error) {
        console.error('❌ Root App: Error initializing database:', error);
        // Продолжаем работу даже при ошибке инициализации
        setDbInitialized(true);
      }
    };

    initDatabase();
  }, []);

  // Показываем приложение только после инициализации БД и проверки аутентификации
  if (!dbInitialized || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Загрузка...</Text>
        <Text style={styles.loadingSubtext}>
          {!dbInitialized ? 'Инициализация базы данных...' : 'Проверка аутентификации...'}
        </Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <AppNavigator isAuthenticated={isAuthenticated} />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <SettingsProvider>
          <PaperProvider theme={theme}>
            <MealProvider>
              <WeightProvider>
                <AppContent />
              </WeightProvider>
            </MealProvider>
          </PaperProvider>
        </SettingsProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  loadingSubtext: {
    color: '#999',
    fontSize: 14,
  },
});