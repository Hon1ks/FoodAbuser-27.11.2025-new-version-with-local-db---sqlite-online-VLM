import * as React from 'react';
import { View, StyleSheet, Animated, Dimensions, Platform, StatusBar } from 'react-native';
import { Button, Text, Switch, Surface } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Локализация (примитивная, для примера)
const translations = {
  ru: {
    title: 'Food Abuser',
    subtitle: 'Минималистичный трекер питания',
    login: 'Войти',
    register: 'Зарегистрироваться',
    lang: 'RU',
    langAlt: 'EN',
  },
  en: {
    title: 'Food Abuser',
    subtitle: 'Minimalistic food tracker',
    login: 'Login',
    register: 'Register',
    lang: 'EN',
    langAlt: 'RU',
  },
};

export default function WelcomeScreen() {
  const [isRussian, setIsRussian] = React.useState(true);
  const [fadeAnim] = React.useState(new Animated.Value(0));
  const [contentAnim] = React.useState(new Animated.Value(0));
  const navigation = useNavigation();
  const lang = isRussian ? 'ru' : 'en';

  // Анимация появления логотипа и контента
  React.useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.timing(contentAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Переключение языка (можно расширить до глобального контекста)
  const handleLangSwitch = () => {
    setIsRussian((prev) => !prev);
    // Здесь можно добавить сохранение выбора в AsyncStorage
  };

  return (
    <View style={styles.flex}>
      <LinearGradient
        colors={["#1230c7de", "#000000", "#15c712de"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.flex} edges={['top']}>
        {/* Переключатель языка */}
        <View style={styles.langAbsolute}>
          <Surface style={styles.langSurface} elevation={3}>
            <Text style={{marginRight: 2, fontSize: 13}}>{translations[lang].lang}</Text>
            <Switch value={!isRussian} onValueChange={handleLangSwitch} color={"#6C63FF"} style={{transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }]}} />
            <Text style={{marginLeft: 2, fontSize: 13}}>{translations[lang].langAlt}</Text>
          </Surface>
        </View>
        {/* Центрированный контент */}
        <View style={styles.centerContent}>
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={[styles.logo, {color: '#6C63FF'}]} variant="displayLarge">{translations[lang].title}</Text>
          </Animated.View>
          <Animated.View style={{ opacity: contentAnim, transform: [{ translateY: contentAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }] }}>
            <Text style={[styles.subtitle, {color: '#43cea2'}]}>{translations[lang].subtitle}</Text>
            <Button
              mode="contained"
              style={[styles.button, {backgroundColor: '#43cea2'}]}
              labelStyle={{fontWeight: 'bold', fontSize: 18, color: '#fff'}}
              contentStyle={{height: 52}}
              onPress={() => navigation.navigate('Login')}
            >
              {translations[lang].login}
            </Button>
            <Button
              mode="outlined"
              style={[styles.button, {borderColor: '#6C63FF'}]}
              labelStyle={{fontWeight: 'bold', fontSize: 18, color: '#6C63FF'}}
              contentStyle={{height: 52}}
              onPress={() => navigation.navigate('Register')}
            >
              {translations[lang].register}
            </Button>
          </Animated.View>
        </View>
        <View style={styles.circleDecor} pointerEvents="none" />
      </SafeAreaView>
    </View>
  );
}

// Стили для экрана приветствия
const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  langAbsolute: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 44 : (StatusBar.currentHeight ? StatusBar.currentHeight + 20 : 36),
    right: 18,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  langSurface: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    paddingHorizontal: 10,
    paddingVertical: 2,
    backgroundColor: '#fff',
    elevation: 3,
    minWidth: 70,
    minHeight: 32,
  },
  logo: {
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  subtitle: {
    marginBottom: 32,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '500',
    opacity: 0.85,
  },
  button: {
    width: width * 0.7,
    marginVertical: 10,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  circleDecor: {
    position: 'absolute',
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width * 0.6,
    backgroundColor: 'rgba(108,99,255,0.08)',
    bottom: -width * 0.5,
    left: -width * 0.1,
    zIndex: 0,
  },
}); 