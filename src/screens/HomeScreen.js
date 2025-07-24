import * as React from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, Card, ProgressBar, Avatar, FAB, useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const meals = [
  { id: 1, type: 'breakfast', time: '08:30', title: 'Овсянка с фруктами', kcal: 320 },
  { id: 2, type: 'lunch', time: '13:10', title: 'Курица с рисом', kcal: 540 },
  { id: 3, type: 'dinner', time: '19:00', title: 'Салат с тунцом', kcal: 410 },
];

const summary = {
  kcal: 1270,
  protein: 65,
  fat: 38,
  carb: 160,
  kcalGoal: 2000,
  proteinGoal: 100,
  fatGoal: 60,
  carbGoal: 250,
};

export default function HomeScreen() {
  const theme = useTheme();

  return (
    <View style={styles.flex}>
      <LinearGradient
        colors={["#1230c7de", "#000000", "#15c712de"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Приветствие и профиль */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.hello}>Привет, User!</Text>
            <Text style={styles.date}>{new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}</Text>
          </View>
          <Avatar.Image size={48} source={require('../../assets/avatar.png')} style={styles.avatar} />
        </View>
        {/* Дневная сводка */}
        <Card style={styles.summaryCard} elevation={4}>
          <Card.Content>
            <Text style={styles.summaryTitle}>Дневная сводка</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryCol}>
                <Text style={styles.summaryValue}>{summary.kcal}</Text>
                <Text style={styles.summaryLabel}>Ккал</Text>
              </View>
              <View style={styles.summaryCol}>
                <Text style={styles.summaryValue}>{summary.protein}г</Text>
                <Text style={styles.summaryLabel}>Белки</Text>
              </View>
              <View style={styles.summaryCol}>
                <Text style={styles.summaryValue}>{summary.fat}г</Text>
                <Text style={styles.summaryLabel}>Жиры</Text>
              </View>
              <View style={styles.summaryCol}>
                <Text style={styles.summaryValue}>{summary.carb}г</Text>
                <Text style={styles.summaryLabel}>Углеводы</Text>
              </View>
            </View>
            <ProgressBar progress={summary.kcal / summary.kcalGoal} color={'#43cea2'} style={styles.progress} />
            <Text style={styles.goalText}>Цель: {summary.kcalGoal} ккал</Text>
          </Card.Content>
        </Card>
        {/* Список приёмов пищи */}
        <Text style={styles.mealTitle}>Сегодняшние приёмы пищи</Text>
        {meals.map(meal => (
          <Card key={meal.id} style={styles.mealCard} elevation={2}>
            <Card.Title
              title={meal.title}
              subtitle={`${meal.time}  •  ${meal.kcal} ккал`}
              left={props => <Avatar.Icon {...props} icon={meal.type === 'breakfast' ? 'food-croissant' : meal.type === 'lunch' ? 'food' : 'food-apple'} color={'#fff'} style={{backgroundColor: '#6C63FF'}} />}
            />
          </Card>
        ))}
        <View style={{ height: 80 }} />
      </ScrollView>
      <FAB
        icon="plus"
        style={styles.fab}
        color="#fff"
        label="Добавить приём"
        onPress={() => {}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: {
    paddingTop: 32,
    paddingBottom: 16,
    paddingHorizontal: 18,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  hello: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  date: {
    fontSize: 16,
    color: '#b2f7ef',
  },
  avatar: {
    backgroundColor: '#fff',
  },
  summaryCard: {
    borderRadius: 20,
    marginBottom: 18,
    backgroundColor: '#fff',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#6C63FF',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryCol: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#232634',
  },
  summaryLabel: {
    fontSize: 13,
    color: '#888',
  },
  progress: {
    height: 8,
    borderRadius: 8,
    marginVertical: 8,
    backgroundColor: '#e0e0e0',
  },
  goalText: {
    fontSize: 13,
    color: '#888',
    textAlign: 'right',
  },
  mealTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 18,
    marginBottom: 8,
  },
  mealCard: {
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    backgroundColor: '#43cea2',
    borderRadius: 28,
    elevation: 4,
    paddingHorizontal: 12,
  },
}); 