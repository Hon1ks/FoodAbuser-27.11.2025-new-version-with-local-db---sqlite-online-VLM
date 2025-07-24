import * as React from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, Card, useTheme, List } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart, BarChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width - 36;
const chartWidth = screenWidth - 32; // уменьшенная ширина для графика

const kcalData = {
  labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
  datasets: [
    { data: [1800, 2000, 1750, 2100, 1900, 2200, 1700], color: () => '#6C63FF' },
  ],
};

const mealFreqData = {
  labels: ['Завтрак', 'Обед', 'Ужин', 'Перекус'],
  datasets: [
    { data: [7, 7, 7, 4] },
  ],
};

export default function AnalyticsScreen() {
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
        <Text style={styles.title}>Аналитика</Text>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.chartTitle}>Динамика калорий за неделю</Text>
            <LineChart
              data={kcalData}
              width={chartWidth}
              height={180}
              chartConfig={chartConfig}
              bezier
              style={{ borderRadius: 12, alignSelf: 'center' }}
            />
          </Card.Content>
        </Card>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.chartTitle}>Частота приёмов пищи</Text>
            <BarChart
              data={mealFreqData}
              width={chartWidth}
              height={180}
              chartConfig={chartConfig}
              style={{ borderRadius: 12, alignSelf: 'center' }}
              formatYLabel={y => y.replace(/\B(?=(\d{3})+(?!\d))/g, '')}
            />
          </Card.Content>
        </Card>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.chartTitle}>Рекомендации</Text>
            <View style={styles.recommendRow}>
              <List.Icon icon="lightbulb-on-outline" color="#43cea2" />
              <Text style={styles.recommendText}>
                Старайтесь не пропускать завтрак. Это поможет поддерживать энергию и обмен веществ на высоком уровне.
              </Text>
            </View>
            <View style={styles.recommendRow}>
              <List.Icon icon="food-apple" color="#6C63FF" />
              <Text style={styles.recommendText}>
                Соблюдайте баланс КБЖУ для оптимального самочувствия и достижения целей.
              </Text>
            </View>
            <View style={styles.recommendRow}>
              <List.Icon icon="cup-water" color="#43cea2" />
              <Text style={styles.recommendText}>
                Пейте больше воды — это важно для здоровья и контроля аппетита.
              </Text>
            </View>
          </Card.Content>
        </Card>
        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const chartConfig = {
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  color: (opacity = 1) => `rgba(76, 99, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(44, 44, 44, ${opacity})`,
  propsForDots: {
    r: '5',
    strokeWidth: '2',
    stroke: '#43cea2',
  },
  propsForBackgroundLines: {
    stroke: '#e0e0e0',
  },
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: {
    paddingTop: 64,
    paddingBottom: 16,
    paddingHorizontal: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#6C63FF',
    marginBottom: 18,
    textAlign: 'center',
  },
  card: {
    borderRadius: 18,
    backgroundColor: '#fff',
    marginBottom: 18,
    padding: 12,
  },
  chart: {
    borderRadius: 12,
    marginTop: 8,
  },
  chartTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
    color: '#232634',
  },
  recommendRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  recommendText: {
    fontSize: 16,
    color: '#232634',
    flex: 1,
    flexWrap: 'wrap',
    marginTop: 2,
  },
}); 