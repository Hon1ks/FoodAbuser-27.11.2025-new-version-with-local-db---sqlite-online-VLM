import * as React from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Text, TextInput, Button, useTheme, Surface, HelperText, IconButton, Menu, Divider, Portal, Modal, ProgressBar, Chip } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useWeight } from '../context/WeightContext';
import { useMeals } from '../context/MealContext';
import * as CameraService from '../services/CameraService';
import CloudflareAIService from '../services/CloudflareAIService';

const categories = [
  { label: 'Завтрак', value: 'breakfast', icon: 'food-croissant' },
  { label: 'Обед', value: 'lunch', icon: 'food' },
  { label: 'Ужин', value: 'dinner', icon: 'food-apple' },
  { label: 'Перекус', value: 'snack', icon: 'cookie' },
];

export default function AddMealScreen() {
  const theme = useTheme();
  const { addMeal } = useMeals();
  
  // Состояния для приема пищи
  const [description, setDescription] = React.useState('');
  const [category, setCategory] = React.useState(categories[0].value);
  const [portion, setPortion] = React.useState('');
  const [calories, setCalories] = React.useState('');
  const [protein, setProtein] = React.useState('');
  const [fat, setFat] = React.useState('');
  const [carbs, setCarbs] = React.useState('');
  const [date, setDate] = React.useState(new Date());
  const [showDate, setShowDate] = React.useState(false);
  const [menuVisible, setMenuVisible] = React.useState(false);
  const [error, setError] = React.useState('');
  
  // Состояния для фото и AI анализа
  const [selectedImage, setSelectedImage] = React.useState(null);
  const [analyzing, setAnalyzing] = React.useState(false);
  const [analysisResult, setAnalysisResult] = React.useState(null);
  const [showAnalysisModal, setShowAnalysisModal] = React.useState(false);
  
  // Состояния для модальных окон (старые, которые были удалены)
  const [weight, setWeight] = React.useState('');
  const [water, setWater] = React.useState('');
  const [weightModal, setWeightModal] = React.useState(false);
  const [waterModal, setWaterModal] = React.useState(false);
  const [weightInput, setWeightInput] = React.useState('');
  const [waterInput, setWaterInput] = React.useState('');
  
  // Для трекера воды:
  const [waterAmount, setWaterAmount] = React.useState(0);
  const [waterGoal, setWaterGoal] = React.useState(2000); // 2 литра в мл
  const [waterGoalModal, setWaterGoalModal] = React.useState(false);
  const [waterGoalInput, setWaterGoalInput] = React.useState('');
  const [manualWaterModal, setManualWaterModal] = React.useState(false);
  const [manualWaterInput, setManualWaterInput] = React.useState('');
  
  // Используем WeightContext вместо локального состояния
  const {
    currentWeight,
    targetWeight,
    initialWeight,
    weightRecords,
    stats: weightStats,
    addWeightRecord: addWeightRecordToContext,
    deleteWeightRecord,
    setTargetWeight: setTargetWeightInContext,
    setInitialWeight: setInitialWeightInContext,
  } = useWeight();
  
  // Локальное состояние для модальных окон
  const [weightSettingsModal, setWeightSettingsModal] = React.useState(false);
  const [targetWeightInput, setTargetWeightInput] = React.useState('');
  const [initialWeightInput, setInitialWeightInput] = React.useState('');
  const [weightSettingsType, setWeightSettingsType] = React.useState(''); // 'target' или 'initial'
  const [weightSettingsMenuVisible, setWeightSettingsMenuVisible] = React.useState(false);
  const [weightDate, setWeightDate] = React.useState(new Date());
  const [showWeightDatePicker, setShowWeightDatePicker] = React.useState(false);
  const [showWeightHistory, setShowWeightHistory] = React.useState(false);

  // Функция для форматирования даты на русском языке
  const formatDate = (date) => {
    const months = [
      'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
      'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];
    const d = new Date(date);
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const addWater = (amount) => {
    setWaterAmount((prev) => Math.min(prev + amount, waterGoal));
  };

  const resetWater = () => {
    setWaterAmount(0);
  };

  const setWaterGoalHandler = () => {
    if (waterGoalInput && !isNaN(Number(waterGoalInput))) {
      setWaterGoal(Number(waterGoalInput) * 1000); // конвертируем литры в мл
      setWaterGoalInput('');
      setWaterGoalModal(false);
    }
  };

  const addManualWater = () => {
    if (manualWaterInput && !isNaN(Number(manualWaterInput))) {
      addWater(Number(manualWaterInput));
      setManualWaterInput('');
      setManualWaterModal(false);
    }
  };

  const addWeightRecord = async (weight) => {
    const newWeight = parseFloat(weight);
    if (isNaN(newWeight)) return;

    const weightData = {
      weight: newWeight,
      record_date: weightDate.toISOString().split('T')[0], // формат YYYY-MM-DD
    };

    // Используем функцию из контекста
    await addWeightRecordToContext(weightData);
    
    setWeightInput('');
    setWeightDate(new Date()); // Сбрасываем дату на текущую для следующей записи
    setWeightModal(false);
  };

  const getWeightProgress = () => {
    return weightStats.progressPercentage / 100;
  };

  const openWeightSettings = (type) => {
    setWeightSettingsType(type);
    if (type === 'target') {
      setTargetWeightInput(targetWeight.toString());
    } else if (type === 'initial') {
      setInitialWeightInput(initialWeight.toString());
    }
    setWeightSettingsModal(true);
  };

  const saveWeightSettings = () => {
    if (weightSettingsType === 'target' && targetWeightInput && !isNaN(Number(targetWeightInput))) {
      setTargetWeightInContext(Number(targetWeightInput));
      setTargetWeightInput('');
    } else if (weightSettingsType === 'initial' && initialWeightInput && !isNaN(Number(initialWeightInput))) {
      setInitialWeightInContext(Number(initialWeightInput));
      setInitialWeightInput('');
    }
    setWeightSettingsModal(false);
  };

  // Функция для обработки фото с камеры
  const handleTakePhoto = async () => {
    try {
      const photo = await CameraService.takePhoto();
      if (photo) {
        setSelectedImage(photo.uri);
        await analyzePhoto(photo.uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
    }
  };

  // Функция для выбора фото из галереи
  const handlePickImage = async () => {
    try {
      const photo = await CameraService.pickImageFromGallery();
      if (photo) {
        setSelectedImage(photo.uri);
        await analyzePhoto(photo.uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  // Функция для анализа фото с помощью Cloudflare AI
  const analyzePhoto = async (imageUri) => {
    try {
      setAnalyzing(true);
      setError('');
      
      // Проверяем, что есть URI изображения
      if (!imageUri) {
        setError('Выберите фото для анализа');
        setAnalyzing(false);
        return;
      }
      
      // Анализируем фото с помощью Cloudflare AI
      console.log('📸 Analyzing image with CloudflareAI...');
      const result = await CloudflareAIService.analyzeFoodImage(imageUri);
      
      // Сохраняем результат анализа
      setAnalysisResult(result);
      
      // Автоматически заполняем поля на основе результата
      if (result.items && result.items.length > 0) {
        const firstItem = result.items[0];
        
        // Обновляем название, если не было введено пользователем
        if (!description.trim()) {
          setDescription(firstItem.ru_name || firstItem.name);
        }
        
        // Заполняем КБЖУ (берем данные из первого элемента или итоговые)
        setPortion(firstItem.grams.toString());
        setCalories(result.total.calories.toString());
        setProtein(result.total.protein.toString());
        setFat(result.total.fat.toString());
        setCarbs(result.total.carbs.toString());
      }
      
      // Показываем модальное окно с результатами
      setShowAnalysisModal(true);
      
    } catch (error) {
      console.error('❌ Error analyzing photo:', error);
      setError('Не удалось проанализировать фото. Попробуйте еще раз.');
    } finally {
      setAnalyzing(false);
      // Удаляем фото из памяти после анализа (как требуется в ТЗ)
      setSelectedImage(null);
    }
  };

  const handleSave = async () => {
    setError('');
    if (!description.trim()) {
      setError('Введите описание');
      return;
    }
    if (!portion.trim() || isNaN(Number(portion))) {
      setError('Укажите размер порции (в граммах)');
      return;
    }

    try {
      const mealData = {
        title: description.trim(),
        description: description.trim(),
        category,
        portion_weight: parseInt(portion, 10),
        calories: parseInt(calories || '0', 10),
        protein: parseFloat(protein || '0'),
        fat: parseFloat(fat || '0'),
        carbs: parseFloat(carbs || '0'),
        meal_time: date.toISOString(),
      };

      await addMeal(mealData);
      
      // Очищаем форму после успешного сохранения
      setDescription('');
      setPortion('');
      setCalories('');
      setProtein('');
      setFat('');
      setCarbs('');
      setDate(new Date());
      setAnalysisResult(null);
      
      // Показываем уведомление об успехе
      alert('✅ Приём пищи успешно добавлен!');
    } catch (error) {
      console.error('Error saving meal:', error);
      setError('Не удалось сохранить приём пищи');
    }
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
          {/* Первый бокс - Улучшенное добавление приёма пищи */}
          <Surface style={styles.mealSurface} elevation={4}>
            <View style={styles.mealHeader}>
              <Text style={styles.mealTitle}>🍽️ Добавление приёма пищи</Text>
              <View style={styles.mealSubtitle}>
                <Text style={styles.mealSubtitleText}>Запишите свой приём пищи</Text>
              </View>
            </View>

            {/* Быстрые действия */}
            <View style={styles.quickActionsContainer}>
              <Text style={styles.sectionLabel}>Быстрые действия</Text>
              <View style={styles.quickActions}>
                <Chip
                  icon="camera"
                  mode="outlined"
                  onPress={handleTakePhoto}
                  style={styles.actionChip}
                  textStyle={styles.chipText}
                  disabled={analyzing}
                >
                  Фото
                </Chip>
                <Chip
                  icon="image"
                  mode="outlined"
                  onPress={handlePickImage}
                  style={styles.actionChip}
                  textStyle={styles.chipText}
                  disabled={analyzing}
                >
                  Галерея
                </Chip>
              </View>
              {analyzing && (
                <View style={styles.analyzingContainer}>
                  <ActivityIndicator size="small" color="#6C63FF" />
                  <Text style={styles.analyzingText}>Анализ фото...</Text>
                </View>
              )}
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.sectionLabel}>Описание</Text>
              <TextInput
                label="Что вы ели?"
                value={description}
                onChangeText={setDescription}
                style={styles.mealInput}
                multiline
                placeholder="Опишите вашу еду..."
                left={<TextInput.Icon icon="food-fork-drink" iconColor="#6C63FF" />}
                error={!!error && !description.trim()}
                mode="outlined"
              />
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.sectionLabel}>Категория</Text>
              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <Button
                    mode="outlined"
                    icon={categories.find(c => c.value === category).icon}
                    onPress={() => setMenuVisible(true)}
                    style={styles.categoryBtn}
                    labelStyle={styles.categoryBtnText}
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
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.sectionLabel}>Размер порции</Text>
              <TextInput
                label="Вес в граммах"
                value={portion}
                onChangeText={setPortion}
                keyboardType="numeric"
                style={styles.mealInput}
                placeholder="Например: 250"
                left={<TextInput.Icon icon="scale" iconColor="#6C63FF" />}
                error={!!error && (!portion.trim() || isNaN(Number(portion)))}
                mode="outlined"
              />
            </View>

            {/* КБЖУ - автоматически заполняется после AI анализа */}
            {(calories || protein || fat || carbs || analysisResult) && (
              <View style={styles.nutritionSection}>
                <Text style={styles.sectionLabel}>Пищевая ценность (КБЖУ)</Text>
                <View style={styles.nutritionGrid}>
                  <View style={styles.nutritionItem}>
                    <TextInput
                      label="Калории"
                      value={calories}
                      onChangeText={setCalories}
                      keyboardType="numeric"
                      style={styles.nutritionInput}
                      placeholder="0"
                      mode="outlined"
                      dense
                    />
                  </View>
                  <View style={styles.nutritionItem}>
                    <TextInput
                      label="Белки (г)"
                      value={protein}
                      onChangeText={setProtein}
                      keyboardType="numeric"
                      style={styles.nutritionInput}
                      placeholder="0"
                      mode="outlined"
                      dense
                    />
                  </View>
                  <View style={styles.nutritionItem}>
                    <TextInput
                      label="Жиры (г)"
                      value={fat}
                      onChangeText={setFat}
                      keyboardType="numeric"
                      style={styles.nutritionInput}
                      placeholder="0"
                      mode="outlined"
                      dense
                    />
                  </View>
                  <View style={styles.nutritionItem}>
                    <TextInput
                      label="Углеводы (г)"
                      value={carbs}
                      onChangeText={setCarbs}
                      keyboardType="numeric"
                      style={styles.nutritionInput}
                      placeholder="0"
                      mode="outlined"
                      dense
                    />
                  </View>
                </View>
              </View>
            )}

            {error ? <HelperText type="error" visible style={styles.errorText}>{error}</HelperText> : null}
            
            <Button
              mode="contained"
              style={styles.saveMealBtn}
              onPress={handleSave}
              contentStyle={{height: 52}}
              labelStyle={styles.saveMealBtnText}
              icon="check"
            >
              Сохранить приём пищи
            </Button>
          </Surface>

          {/* Второй бокс - Улучшенный трекер воды */}
          <Surface style={[styles.surface, { marginTop: 0 }]} elevation={4}>
            <View style={styles.headerRow}>
              <Text style={[styles.title, { color: '#3b82f6' }]}>💧 Трекер воды</Text>
              <IconButton
                icon="cog"
                size={24}
                iconColor="#3b82f6"
                onPress={() => setWaterGoalModal(true)}
              />
            </View>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressText}>
                  {(waterAmount/1000).toFixed(1).replace('.', ',')} / {(waterGoal/1000).toFixed(1).replace('.', ',')} л
                </Text>
                <Text style={styles.progressPercent}>
                  {Math.round((waterAmount / waterGoal) * 100)}%
                </Text>
              </View>
              <ProgressBar 
                progress={waterAmount / waterGoal} 
                color="#3b82f6" 
                style={styles.progressBar}
              />
            </View>

            <View style={styles.waterButtons}>
              <Button
                mode="outlined"
                style={[styles.waterButton, { marginRight: 8 }]}
                onPress={() => addWater(200)}
                icon="cup"
              >
                +200 мл
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
            
            <View style={styles.waterActions}>
              <Button
                mode="text"
                onPress={() => setManualWaterModal(true)}
                icon="plus"
                style={{ marginRight: 8 }}
              >
                Ручной ввод
              </Button>
              <Button
                mode="text"
                onPress={resetWater}
                icon="refresh"
              >
                Сбросить
              </Button>
            </View>
          </Surface>

          {/* Третий бокс - Улучшенный трекер веса */}
          <Surface style={[styles.surface, { marginTop: 0 }]} elevation={4}>
            <View style={styles.headerRow}>
              <Text style={[styles.title, { color: '#10b981' }]}>⚖️ Трекер веса</Text>
              <Menu
                visible={weightSettingsMenuVisible}
                onDismiss={() => setWeightSettingsMenuVisible(false)}
                anchor={
                  <IconButton
                    icon="cog"
                    size={24}
                    iconColor="#10b981"
                    onPress={() => setWeightSettingsMenuVisible(true)}
                  />
                }
              >
                <Menu.Item
                  onPress={() => {
                    setWeightSettingsMenuVisible(false);
                    openWeightSettings('target');
                  }}
                  title="Установить цель по весу"
                  leadingIcon="target"
                />
                                        <Menu.Item
                          onPress={() => {
                            setWeightSettingsMenuVisible(false);
                            openWeightSettings('initial');
                          }}
                          title="Установить начальный вес"
                          leadingIcon="flag"
                        />
              </Menu>
            </View>
            
            <View style={styles.weightInfo}>
              <View style={styles.weightItem}>
                <Text style={styles.weightLabel}>Начальный</Text>
                                        <Text style={styles.weightValue}>{initialWeight.toFixed(1).replace('.', ',')} кг</Text>
              </View>
              <View style={styles.weightItem}>
                <Text style={styles.weightLabel}>Текущий</Text>
                                        <Text style={styles.weightValue}>{currentWeight.toFixed(1).replace('.', ',')} кг</Text>
              </View>
              <View style={styles.weightItem}>
                <Text style={styles.weightLabel}>Цель</Text>
                                        <Text style={styles.weightValue}>{targetWeight.toFixed(1).replace('.', ',')} кг</Text>
              </View>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressText}>
                  Прогресс к цели
                </Text>
                <Text style={styles.progressPercent}>
                  {Math.round(getWeightProgress() * 100)}%
                </Text>
              </View>
              <ProgressBar 
                progress={getWeightProgress()} 
                color="#10b981" 
                style={styles.progressBar}
              />
            </View>

            <View style={styles.weightButtons}>
              <Button
                mode="contained"
                icon="plus"
                onPress={() => setWeightModal(true)}
                style={[styles.weightButton, { backgroundColor: '#10b981', marginBottom: 8 }]}
              >
                Записать новый вес
              </Button>
              <Button
                mode="outlined"
                icon="history"
                onPress={() => setShowWeightHistory(true)}
                style={styles.weightButton}
              >
                Показать все
              </Button>
            </View>
          </Surface>
        </ScrollView>
      </KeyboardAvoidingView>
      
      <Portal>
        {/* Модальное окно для установки цели воды */}
        <Modal visible={waterGoalModal} onDismiss={() => setWaterGoalModal(false)} contentContainerStyle={{ backgroundColor: '#fff', padding: 24, borderRadius: 18, marginHorizontal: 24 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#3b82f6', textAlign: 'center' }}>Установить цель</Text>
          <TextInput
            label="Цель (литры)"
            value={waterGoalInput}
            onChangeText={(text) => {
              // Заменяем запятую на точку
              const formattedText = text.replace(',', '.');
              // Проверяем, что введено корректное число с не более чем одной точкой
              // и не более одним знаком после точки
              if (formattedText === '' || /^\d*\.?\d{0,1}$/.test(formattedText)) {
                setWaterGoalInput(formattedText);
              }
            }}
            keyboardType="decimal-pad"
            style={{ marginBottom: 16, backgroundColor: '#f6f6fa' }}
            left={<TextInput.Icon icon="target" />}
            placeholder="Например: 3,5"
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Button mode="outlined" onPress={() => setWaterGoalModal(false)} style={{ flex: 1, marginRight: 8 }}>
              Отмена
            </Button>
            <Button 
              mode="contained" 
              onPress={setWaterGoalHandler} 
              style={{ flex: 1, backgroundColor: '#3b82f6' }}
              disabled={!waterGoalInput || isNaN(Number(waterGoalInput))}
            >
              Сохранить
            </Button>
          </View>
        </Modal>

        {/* Модальное окно для ручного ввода воды */}
        <Modal visible={manualWaterModal} onDismiss={() => setManualWaterModal(false)} contentContainerStyle={{ backgroundColor: '#fff', padding: 24, borderRadius: 18, marginHorizontal: 24 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#3b82f6', textAlign: 'center' }}>Добавить воду</Text>
          <TextInput
            label="Количество (мл)"
            value={manualWaterInput}
            onChangeText={setManualWaterInput}
            keyboardType="numeric"
            style={{ marginBottom: 16, backgroundColor: '#f6f6fa' }}
            left={<TextInput.Icon icon="cup-water" />}
            placeholder="Например: 300"
          />

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
            <Button mode="outlined" onPress={() => setManualWaterModal(false)} style={{ flex: 1, marginRight: 8 }}>
              Отмена
            </Button>
            <Button 
              mode="contained" 
              onPress={addManualWater} 
              style={{ flex: 1, backgroundColor: '#3b82f6' }}
              disabled={!manualWaterInput || isNaN(Number(manualWaterInput))}
            >
              Добавить
            </Button>
          </View>
        </Modal>

        {/* Модальное окно для записи веса */}
        <Modal visible={weightModal} onDismiss={() => setWeightModal(false)} contentContainerStyle={{ backgroundColor: '#fff', padding: 24, borderRadius: 18, marginHorizontal: 24 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#10b981', textAlign: 'center' }}>Записать вес</Text>
          <TextInput
                                label="Вес (кг)"
                    value={weightInput}
                    onChangeText={(text) => {
                      // Заменяем запятую на точку
                      const formattedText = text.replace(',', '.');
                      // Проверяем, что введено корректное число с не более чем одной точкой
                      // и не более одним знаком после точки
                      if (formattedText === '' || /^\d*\.?\d{0,1}$/.test(formattedText)) {
                        setWeightInput(formattedText);
                      }
                    }}
                    keyboardType="decimal-pad"
                    style={{ marginBottom: 16, backgroundColor: '#f6f6fa' }}
                    left={<TextInput.Icon icon="weight-kilogram" />}
                    placeholder="Например: 90,2"
          />
          <View style={styles.datePickerContainer}>
            <Text style={styles.sectionLabel}>Дата</Text>
            <Button
              mode="outlined"
              icon="calendar"
              onPress={() => setShowWeightDatePicker(true)}
              style={styles.dateButton}
              labelStyle={styles.dateButtonText}
            >
              {formatDate(weightDate)}
            </Button>
          </View>
          {Platform.OS === 'ios' ? (
            <Portal>
              <Modal
                visible={showWeightDatePicker}
                onDismiss={() => setShowWeightDatePicker(false)}
                contentContainerStyle={{
                  backgroundColor: '#fff',
                  padding: 20,
                  marginHorizontal: 20,
                  marginVertical: '30%',
                  borderRadius: 18
                }}
              >
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center', color: '#10b981' }}>
                    Выберите дату
                  </Text>
                  <DateTimePicker
                    value={weightDate}
                    mode="date"
                    display="spinner"
                    onChange={(event, selectedDate) => {
                      if (selectedDate) {
                        setWeightDate(selectedDate);
                      }
                    }}
                    maximumDate={new Date()}
                    locale="ru-RU"
                    textColor="#000000"
                    style={{ width: '100%', height: 200 }}
                  />
                  <Button
                    mode="contained"
                    onPress={() => setShowWeightDatePicker(false)}
                    style={{ marginTop: 16, backgroundColor: '#10b981', width: '100%' }}
                  >
                    Готово
                  </Button>
                </View>
              </Modal>
            </Portal>
          ) : (
            showWeightDatePicker && (
              <DateTimePicker
                value={weightDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowWeightDatePicker(false);
                  if (selectedDate) {
                    setWeightDate(selectedDate);
                  }
                }}
                maximumDate={new Date()}
                locale="ru-RU"
              />
            )
          )}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Button mode="outlined" onPress={() => setWeightModal(false)} style={{ flex: 1, marginRight: 8 }}>
              Отмена
            </Button>
            <Button 
              mode="contained" 
              onPress={() => weightInput && addWeightRecord(weightInput)} 
              style={{ flex: 1, backgroundColor: '#10b981' }}
              disabled={!weightInput || isNaN(Number(weightInput))}
            >
              Сохранить
            </Button>
          </View>
        </Modal>

        {/* Модальное окно для настроек веса */}
        <Modal visible={weightSettingsModal} onDismiss={() => setWeightSettingsModal(false)} contentContainerStyle={{ backgroundColor: '#fff', padding: 24, borderRadius: 18, marginHorizontal: 24 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#10b981', textAlign: 'center' }}>
            {weightSettingsType === 'target' ? 'Установить цель' : 'Установить начальный вес'}
          </Text>
          <TextInput
                                label={weightSettingsType === 'target' ? 'Целевой вес (кг)' : 'Начальный вес (кг)'}
                    value={weightSettingsType === 'target' ? targetWeightInput : initialWeightInput}
                    onChangeText={(text) => {
                      // Заменяем запятую на точку
                      const formattedText = text.replace(',', '.');
                      // Проверяем, что введено корректное число с не более чем одной точкой
                      // и не более одним знаком после точки
                      if (formattedText === '' || /^\d*\.?\d{0,1}$/.test(formattedText)) {
                        if (weightSettingsType === 'target') {
                          setTargetWeightInput(formattedText);
                        } else {
                          setInitialWeightInput(formattedText);
                        }
                      }
                    }}
                    keyboardType="decimal-pad"
                    style={{ marginBottom: 16, backgroundColor: '#f6f6fa' }}
                    left={<TextInput.Icon icon={weightSettingsType === 'target' ? 'target' : 'flag'} />}
                    placeholder="Например: 65,5"
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Button mode="outlined" onPress={() => setWeightSettingsModal(false)} style={{ flex: 1, marginRight: 8 }}>
              Отмена
            </Button>
            <Button 
              mode="contained" 
              onPress={saveWeightSettings} 
              style={{ flex: 1, backgroundColor: '#10b981' }}
              disabled={!((weightSettingsType === 'target' ? targetWeightInput : initialWeightInput) && !isNaN(Number(weightSettingsType === 'target' ? targetWeightInput : initialWeightInput)))}
            >
              Сохранить
            </Button>
          </View>
        </Modal>

        {/* Модальное окно с историей веса */}
        <Modal 
          visible={showWeightHistory} 
          onDismiss={() => setShowWeightHistory(false)} 
          contentContainerStyle={{ 
            backgroundColor: '#fff', 
            padding: 24, 
            borderRadius: 18, 
            marginHorizontal: 24,
            maxHeight: '80%' 
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#10b981', textAlign: 'center' }}>
            История изменения веса
          </Text>
          <ScrollView style={{ maxHeight: '90%' }}>
            {weightRecords.map((record, index) => (
              <View 
                key={record.id} 
                style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  paddingVertical: 12,
                  borderBottomWidth: index !== weightRecords.length - 1 ? 1 : 0,
                  borderBottomColor: '#e5e7eb'
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 18, color: '#10b981', fontWeight: 'bold' }}>
                    {record.weight.toFixed(1).replace('.', ',')} кг
                  </Text>
                  <Text style={{ fontSize: 16, color: '#6b7280' }}>
                    {formatDate(record.record_date)}
                  </Text>
                </View>
                <IconButton
                  icon="delete"
                  size={20}
                  iconColor="#ff6b6b"
                  onPress={() => deleteWeightRecord(record.id)}
                  style={{ marginLeft: 8 }}
                />
              </View>
            ))}
            {weightRecords.length === 0 && (
              <Text style={{ textAlign: 'center', color: '#6b7280', fontSize: 16 }}>
                История пуста
              </Text>
            )}
          </ScrollView>
          <Button 
            mode="outlined" 
            onPress={() => setShowWeightHistory(false)}
            style={{ marginTop: 16 }}
          >
            Закрыть
          </Button>
        </Modal>

        {/* Модальное окно с результатами AI анализа */}
        <Modal 
          visible={showAnalysisModal} 
          onDismiss={() => setShowAnalysisModal(false)} 
          contentContainerStyle={{ 
            backgroundColor: '#fff', 
            padding: 24, 
            borderRadius: 18, 
            marginHorizontal: 24,
            maxHeight: '80%' 
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#6C63FF', textAlign: 'center' }}>
            🤖 Результаты AI анализа
          </Text>
          {analysisResult && (
            <ScrollView style={{ maxHeight: '80%' }}>
              {analysisResult.items && analysisResult.items.map((item, index) => (
                <View 
                  key={index} 
                  style={{ 
                    backgroundColor: '#f8fafc',
                    padding: 16,
                    borderRadius: 12,
                    marginBottom: 12
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#374151' }}>
                      {item.ru_name || item.name}
                    </Text>
                    {item.confidence && (
                      <Text style={{ fontSize: 12, color: '#6b7280', fontStyle: 'italic' }}>
                        {Math.round(item.confidence * 100)}%
                      </Text>
                    )}
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ color: '#6b7280' }}>Вес:</Text>
                    <Text style={{ fontWeight: '600', color: '#374151' }}>{item.grams} г</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ color: '#6b7280' }}>Калории:</Text>
                    <Text style={{ fontWeight: '600', color: '#ef4444' }}>{item.calories} ккал</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ color: '#6b7280' }}>Белки:</Text>
                    <Text style={{ fontWeight: '600', color: '#10b981' }}>{item.protein} г</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ color: '#6b7280' }}>Жиры:</Text>
                    <Text style={{ fontWeight: '600', color: '#f59e0b' }}>{item.fat} г</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: '#6b7280' }}>Углеводы:</Text>
                    <Text style={{ fontWeight: '600', color: '#3b82f6' }}>{item.carbs} г</Text>
                  </View>
                </View>
              ))}
              
              {analysisResult.total && (
                <View style={{ 
                  backgroundColor: '#e0f2fe', 
                  padding: 16, 
                  borderRadius: 12, 
                  marginTop: 8 
                }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#374151', marginBottom: 8 }}>
                    Итого:
                  </Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: '#6b7280' }}>Калории:</Text>
                    <Text style={{ fontWeight: 'bold', color: '#ef4444' }}>{analysisResult.total.calories} ккал</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: '#6b7280' }}>Б / Ж / У:</Text>
                    <Text style={{ fontWeight: 'bold', color: '#374151' }}>
                      {analysisResult.total.protein}г / {analysisResult.total.fat}г / {analysisResult.total.carbs}г
                    </Text>
                  </View>
                </View>
              )}
              
              <Text style={{ fontSize: 12, color: '#6b7280', textAlign: 'center', marginTop: 16 }}>
                💡 Подсказка: Вы можете отредактировать эти значения вручную
              </Text>
            </ScrollView>
          )}
          <Button 
            mode="contained" 
            onPress={() => setShowAnalysisModal(false)}
            style={{ marginTop: 16, backgroundColor: '#6C63FF' }}
          >
            Понятно
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
  // Новые стили для улучшенного бокса добавления приёма пищи
  mealSurface: {
    width: '100%',
    borderRadius: 24,
    padding: 28,
    backgroundColor: '#fff',
    marginBottom: 32,
  },
  mealHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  mealTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6C63FF',
    textAlign: 'center',
    marginBottom: 8,
  },
  mealSubtitle: {
    backgroundColor: '#f0f4ff',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  mealSubtitleText: {
    fontSize: 14,
    color: '#6C63FF',
    fontWeight: '500',
  },
  quickActionsContainer: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    marginLeft: 4,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  actionChip: {
    marginHorizontal: 4,
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6C63FF',
  },
  inputSection: {
    marginBottom: 20,
  },
  mealInput: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
  },
  categoryBtn: {
    borderRadius: 12,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    height: 48,
  },
  categoryBtnText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6C63FF',
  },
  errorText: {
    marginTop: 8,
    marginBottom: 16,
  },
  saveMealBtn: {
    width: '100%',
    marginTop: 8,
    borderRadius: 16,
    backgroundColor: '#43cea2',
    elevation: 4,
  },
  saveMealBtnText: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  // Существующие стили
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#6C63FF',
    textAlign: 'center',
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
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
  progressContainer: {
    width: '100%',
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6C63FF',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  waterButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 8,
  },
  waterButton: {
    borderRadius: 14,
    minWidth: 100,
  },
  waterActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  weightInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 16,
  },
  weightItem: {
    alignItems: 'center',
  },
  weightLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  weightValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10b981',
  },
  weightButton: {
    borderRadius: 14,
    width: '100%',
  },
  weightButtons: {
    width: '100%',
  },
  datePickerContainer: {
    marginBottom: 16,
  },
  dateButton: {
    width: '100%',
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    height: 48,
    borderRadius: 12,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  analyzingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f0f4ff',
    borderRadius: 12,
  },
  analyzingText: {
    marginLeft: 8,
    color: '#6C63FF',
    fontWeight: '500',
    fontSize: 14,
  },
  nutritionSection: {
    marginBottom: 20,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    width: '48%',
    marginBottom: 12,
  },
  nutritionInput: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
  },
  statusSurface: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
  },
  statusText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
}); 