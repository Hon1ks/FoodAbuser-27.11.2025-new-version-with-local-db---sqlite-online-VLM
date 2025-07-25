import * as React from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, useTheme, Surface, HelperText, IconButton, Menu, Divider, Portal, Modal } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';

const categories = [
  { label: 'Завтрак', value: 'breakfast', icon: 'food-croissant' },
  { label: 'Обед', value: 'lunch', icon: 'food' },
  { label: 'Ужин', value: 'dinner', icon: 'food-apple' },
  { label: 'Перекус', value: 'snack', icon: 'cookie' },
];

export default function AddMealScreen() {
  const theme = useTheme();
  const [description, setDescription] = React.useState('');
  const [category, setCategory] = React.useState(categories[0].value);
  const [portion, setPortion] = React.useState('');
  const [date, setDate] = React.useState(new Date());
  const [showDate, setShowDate] = React.useState(false);
  const [menuVisible, setMenuVisible] = React.useState(false);
  const [error, setError] = React.useState('');
  const [weight, setWeight] = React.useState('');
  const [water, setWater] = React.useState('');
  const [weightModal, setWeightModal] = React.useState(false);
  const [waterModal, setWaterModal] = React.useState(false);
  const [weightInput, setWeightInput] = React.useState('');
  const [waterInput, setWaterInput] = React.useState('');
   // Для трекера воды:
   const [waterAmount, setWaterAmount] = React.useState(0);
   const waterGoal = 2000; // 2 литра в мл
   const addWater = (amount) => {
    setWaterAmount((prev) => Math.min(prev + amount, waterGoal));
  };

  const handleSave = () => {
    setError('');
    if (!description.trim()) {
      setError('Введите описание');
      return;
    }
    if (!portion.trim() || isNaN(Number(portion))) {
      setError('Укажите размер порции (в граммах)');
      return;
    }
    // TODO: логика сохранения приёма пищи
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
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Surface style={styles.surface} elevation={4}>
            <Text style={styles.title}>Добавить приём пищи</Text>
            <View style={styles.row}>
              <Button
                icon="camera"
                mode="outlined"
                style={styles.mediaBtn}
                onPress={() => {}}
              >
                Камера
              </Button>
              <Button
                icon="image"
                mode="outlined"
                style={styles.mediaBtn}
                onPress={() => {}}
              >
                Галерея
              </Button>
            </View>
            <TextInput
              label="Описание блюда"
              value={description}
              onChangeText={setDescription}
              style={styles.input}
              multiline
              left={<TextInput.Icon icon="note-text-outline" />}
              error={!!error && !description.trim()}
            />
            <View style={styles.row}>
              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <Button
                    mode="outlined"
                    icon={categories.find(c => c.value === category).icon}
                    onPress={() => setMenuVisible(true)}
                    style={styles.catBtn}
                  >
                    {categories.find(c => c.value === category).label}
                  </Button>
                }
              >
                {categories.map(cat => (
                  <Menu.Item
                    key={cat.value}
                    onPress={() => { setCategory(cat.value); setMenuVisible(false); }}
                    title={cat.label}
                    leadingIcon={cat.icon}
                  />
                ))}
              </Menu>
              <Button
                mode="outlined"
                icon="clock-outline"
                onPress={() => setShowDate(true)}
                style={[styles.catBtn, {marginLeft: 0}]}
                labelStyle={{fontSize: 16, fontWeight: 'bold'}}
              >
                {date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
              </Button>
              {showDate && (
                <DateTimePicker
                  value={date}
                  mode="time"
                  is24Hour={true}
                  display="default"
                  onChange={(_, selectedDate) => {
                    setShowDate(false);
                    if (selectedDate) setDate(selectedDate);
                  }}
                />
              )}
            </View>
            <TextInput
              label="Размер порции (г)"
              value={portion}
              onChangeText={setPortion}
              keyboardType="numeric"
              style={styles.input}
              left={<TextInput.Icon icon="scale" />}
              error={!!error && (!portion.trim() || isNaN(Number(portion)))}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 12 }}>
              <Button
                icon="weight-kilogram"
                mode="outlined"
                style={{ flex: 1, marginRight: 8, borderRadius: 14 }}
                onPress={() => setWeightModal(true)}
              >
                Записать вес
              </Button>
              <Button
                icon="cup-water"
                mode="outlined"
                style={{ flex: 1, borderRadius: 14 }}
                onPress={() => setWaterModal(true)}
              >
                Записать воду
              </Button>
            </View>
            {error ? <HelperText type="error" visible>{error}</HelperText> : null}
            <Button
              mode="contained"
              style={styles.saveBtn}
              onPress={handleSave}
              contentStyle={{height: 48}}
              labelStyle={{fontWeight: 'bold', fontSize: 17}}
            >
              Сохранить
            </Button>
          </Surface>
          {/* Новый блок трекера воды */}
          <Surface style={[styles.surface, { marginTop: 0 }]} elevation={4}>
            <Text style={[styles.title, { color: '#3b82f6' }]}>💧 Трекер воды</Text>
            
            <View style={styles.waterProgressContainer}>
              <Text style={styles.waterText}>
                {waterAmount} / {waterGoal} мл
              </Text>
              <View style={styles.waterProgressBar}>
                <View
                  style={[
                    styles.waterProgressFill,
                    { width: `${(waterAmount / waterGoal) * 100}%` },
                  ]}
                />
              </View>
            </View>

            <View style={styles.waterButtons}>
              <Button
                mode="outlined"
                style={[styles.waterButton, { marginRight: 8 }]}
                onPress={() => addWater(250)}
                icon="cup"
              >
                +250 мл
              </Button>
              <Button
                mode="outlined"
                style={styles.waterButton}
                onPress={() => addWater(500)}
                icon="water"
              >
                +500 мл
              </Button>
            </View>
          </Surface>
        </ScrollView>
      </KeyboardAvoidingView>
      <Portal>
        <Modal visible={weightModal} onDismiss={() => setWeightModal(false)} contentContainerStyle={{ backgroundColor: '#fff', padding: 24, borderRadius: 18, marginHorizontal: 24 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#6C63FF', textAlign: 'center' }}>Записать вес</Text>
          <TextInput
            label="Вес (кг)"
            value={weightInput}
            onChangeText={setWeightInput}
            keyboardType="numeric"
            style={{ marginBottom: 16, backgroundColor: '#f6f6fa' }}
            left={<TextInput.Icon icon="weight-kilogram" />}
          />
          <Button mode="contained" onPress={() => setWeightModal(false)} style={{ borderRadius: 14 }}>
            Сохранить
          </Button>
        </Modal>
        <Modal visible={waterModal} onDismiss={() => setWaterModal(false)} contentContainerStyle={{ backgroundColor: '#fff', padding: 24, borderRadius: 18, marginHorizontal: 24 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#6C63FF', textAlign: 'center' }}>Записать воду</Text>
          <TextInput
            label="Вода (л)"
            value={waterInput}
            onChangeText={setWaterInput}
            keyboardType="numeric"
            style={{ marginBottom: 16, backgroundColor: '#f6f6fa' }}
            left={<TextInput.Icon icon="cup-water" />}
          />
          <Button mode="contained" onPress={() => setWaterModal(false)} style={{ borderRadius: 14 }}>
            Сохранить
          </Button>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: {
    paddingTop: 64,
    paddingBottom: 16,
    paddingHorizontal: 18,
  },
  surface: {
    width: '100%',
    borderRadius: 24,
    padding: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#6C63FF',
    marginBottom: 18,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  mediaBtn: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 14,
  },
  input: {
    width: '100%',
    marginBottom: 12,
    backgroundColor: '#f6f6fa',
  },
  catBtn: {
    borderRadius: 14,
    marginRight: 8,
  },
  timeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 7,
    paddingVertical: 4,
    marginLeft: 4,
  },
  timeText: {
    fontSize: 16,
    color: '#232634',
    fontWeight: 'bold',
  },
  saveBtn: {
    width: '100%',
    marginTop: 12,
    borderRadius: 16,
    backgroundColor: '#43cea2',
  },
}); 