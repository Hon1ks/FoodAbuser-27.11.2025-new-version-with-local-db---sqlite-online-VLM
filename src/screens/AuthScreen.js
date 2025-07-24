import * as React from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Animated, Dimensions } from 'react-native';
import { Text, TextInput, Button, useTheme, HelperText, Surface } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

function isEmailOrPhone(value) {
  // Простая проверка email или телефона
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+?\d{10,15}$/;
  return emailRegex.test(value) || phoneRegex.test(value);
}

export default function AuthScreen() {
  const [isLogin, setIsLogin] = React.useState(true);
  const [identifier, setIdentifier] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState('');
  const [anim] = React.useState(new Animated.Value(0));
  const theme = useTheme();
  const navigation = useNavigation();

  React.useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSubmit = () => {
    setError('');
    if (!isEmailOrPhone(identifier)) {
      setError('Введите корректный email или номер телефона');
      return;
    }
    if (password.length < 6) {
      setError('Пароль должен быть не менее 6 символов');
      return;
    }
    if (!isLogin && password !== confirm) {
      setError('Пароли не совпадают');
      return;
    }
    // TODO: здесь будет логика входа/регистрации через Supabase
    // navigation.navigate('ProfileSetup');
  };

  return (
    <View style={styles.flex}>
      <LinearGradient
        colors={["#1230c7de", "#000000", "#15c712de"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Animated.View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          opacity: anim,
          transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }],
        }}>
          <Surface style={styles.surface} elevation={4}>
            <View style={styles.tabRow}>
              <Button
                mode={isLogin ? 'contained' : 'text'}
                onPress={() => setIsLogin(true)}
                style={styles.tabBtn}
              >
                Вход
              </Button>
              <Button
                mode={!isLogin ? 'contained' : 'text'}
                onPress={() => setIsLogin(false)}
                style={styles.tabBtn}
              >
                Регистрация
              </Button>
            </View>
            <TextInput
              label="Email или телефон"
              value={identifier}
              onChangeText={setIdentifier}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              left={<TextInput.Icon icon="account" />}
              error={!!error && !isEmailOrPhone(identifier)}
            />
            <TextInput
              label="Пароль"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              style={styles.input}
              left={<TextInput.Icon icon="lock" />}
              right={<TextInput.Icon icon={showPassword ? 'eye-off' : 'eye'} onPress={() => setShowPassword(v => !v)} />}
              error={!!error && password.length < 6}
            />
            {!isLogin && (
              <TextInput
                label="Повторите пароль"
                value={confirm}
                onChangeText={setConfirm}
                secureTextEntry={!showPassword}
                style={styles.input}
                left={<TextInput.Icon icon="lock-check" />}
                error={!!error && password !== confirm}
              />
            )}
            {error ? <HelperText type="error" visible>{error}</HelperText> : null}
            <Button
              mode="contained"
              style={styles.submitBtn}
              onPress={handleSubmit}
              contentStyle={{height: 48}}
              labelStyle={{fontWeight: 'bold', fontSize: 17}}
            >
              {isLogin ? 'Войти' : 'Зарегистрироваться'}
            </Button>
            {isLogin && (
            
              <Button mode="text" onPress={() => {}} style={styles.forgotBtn} labelStyle={{fontSize: 15}}>
                Забыли пароль?
              </Button>
            )}
            {/* Кнопка входа как гость */}
            <Button
              style={styles.forgotBtn}
              onPress={() => navigation.replace('MainTabs')}
              labelStyle={{fontSize: 15, }}
            >
              Войти как гость
            </Button>
            <Button mode="text" onPress={() => navigation.goBack()} style={styles.backBtn} labelStyle={{fontSize: 15}}>
              Назад
            </Button>
          </Surface>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  surface: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    marginTop: 32,
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  tabBtn: {
    marginHorizontal: 4,
    borderRadius: 16,
  },
  input: {
    width: '100%',
    marginBottom: 12,
    backgroundColor: '#f6f6fa',
  },
  submitBtn: {
    width: '100%',
    marginTop: 8,
    borderRadius: 16,
    backgroundColor: '#43cea2',
  },
  forgotBtn: {
    marginTop: 4,
  },
  backBtn: {
    marginTop: 8,
  },
  guestBtn: {
    marginTop: 12,
    borderRadius: 16,
    borderColor: '#6C63FF',
    borderWidth: 2,
  },
}); 