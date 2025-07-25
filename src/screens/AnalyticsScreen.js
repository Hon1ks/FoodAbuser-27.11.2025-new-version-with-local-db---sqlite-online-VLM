import * as React from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, Card, useTheme, Chip, IconButton, Portal, Modal, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart } from 'react-native-chart-kit';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width - 36;
const chartWidth = screenWidth - 32;

const periods = [
  { label: 'День', value: 'day' },
  { label: 'Неделя', value: 'week' },
  { label: 'Месяц', value: 'month' },
  { label: '3 мес', value: '3m' },
  { label: '6 мес', value: '6m' },
  { label: 'Год', value: 'year' },
];

const weightDataMap = {
  day: { labels: ['08:00', '12:00', '16:00', '20:00'], datasets: [{ data: [80, 80.1, 80, 79.9] }] },
  week: { labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'], datasets: [{ data: [80.2, 80.1, 80, 80, 79.9, 79.8, 79.7] }] },
  month: { labels: ['1', '5', '10', '15', '20', '25', '30'], datasets: [{ data: [81, 80.7, 80.5, 80.2, 80, 79.8, 79.7] }] },
  '3m': { labels: ['Май', 'Июнь', 'Июль'], datasets: [{ data: [83, 81, 79.7] }] },
  '6m': { labels: ['Март', 'Апр', 'Май', 'Июнь', 'Июль'], datasets: [{ data: [85, 84, 83, 81, 79.7] }] },
  year: { labels: ['2024', '2025'], datasets: [{ data: [90, 79.7] }] },
};
const kcalDataMap = {
  day: { labels: ['08:00', '12:00', '16:00', '20:00'], datasets: [{ data: [400, 600, 800, 1200] }] },
  week: { labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'], datasets: [{ data: [1800, 2000, 1750, 2100, 1900, 2200, 1700] }] },
  month: { labels: ['1', '5', '10', '15', '20', '25', '30'], datasets: [{ data: [2100, 2000, 1950, 1900, 1850, 1800, 1750] }] },
  '3m': { labels: ['Май', 'Июнь', 'Июль'], datasets: [{ data: [2200, 2000, 1800] }] },
  '6m': { labels: ['Март', 'Апр', 'Май', 'Июнь', 'Июль'], datasets: [{ data: [2500, 2300, 2200, 2000, 1800] }] },
  year: { labels: ['2024', '2025'], datasets: [{ data: [2600, 1800] }] },
};
const waterDataMap = {
  day: { labels: ['08:00', '12:00', '16:00', '20:00'], datasets: [{ data: [0.5, 1, 1.5, 2] }] },
  week: { labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'], datasets: [{ data: [2, 2, 1.8, 2, 2.2, 2, 1.9] }] },
  month: { labels: ['1', '5', '10', '15', '20', '25', '30'], datasets: [{ data: [2, 2.1, 2, 2.2, 2, 2.3, 2.1] }] },
  '3m': { labels: ['Май', 'Июнь', 'Июль'], datasets: [{ data: [2.2, 2.1, 2] }] },
  '6m': { labels: ['Март', 'Апр', 'Май', 'Июнь', 'Июль'], datasets: [{ data: [2.3, 2.2, 2.1, 2, 2] }] },
  year: { labels: ['2024', '2025'], datasets: [{ data: [2.2, 2] }] },
};

const widgetList = [
  { key: 'weight', label: 'Динамика веса', icon: 'scale-bathroom' },
  { key: 'kcal', label: 'Динамика калорий', icon: 'fire' },
  { key: 'water', label: 'Динамика потребления воды', icon: 'cup-water' },
];

export default function AnalyticsScreen() {
  const theme = useTheme();
  const [weightPeriod, setWeightPeriod] = React.useState('week');
  const [kcalPeriod, setKcalPeriod] = React.useState('week');
  const [waterPeriod, setWaterPeriod] = React.useState('week');
  const [activeWidgets, setActiveWidgets] = React.useState(['weight', 'kcal']);
  const [addWidgetVisible, setAddWidgetVisible] = React.useState(false);

  const weightData = weightDataMap[weightPeriod];
  const kcalData = kcalDataMap[kcalPeriod];
  const waterData = waterDataMap[waterPeriod];

  const handleRemoveWidget = key => setActiveWidgets(w => w.filter(k => k !== key));
  const handleAddWidget = key => setActiveWidgets(w => w.includes(key) ? w : [...w, key]);

  return (
    <View style={styles.flex}>
      <LinearGradient
        colors={["#1230c7de", "#000000", "#15c712de"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Аналитика</Text>
          <IconButton icon="plus" size={28} onPress={() => setAddWidgetVisible(true)} style={styles.addBtn} iconColor="#fff" />
        </View>
        {activeWidgets.includes('weight') && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Text style={styles.chartTitle}>Динамика веса</Text>
                <IconButton icon="close" size={20} onPress={() => handleRemoveWidget('weight')} />
              </View>
              <View style={styles.periodRow}>
                {periods.map(p => (
                  <Chip
                    key={p.value}
                    selected={weightPeriod === p.value}
                    onPress={() => setWeightPeriod(p.value)}
                    style={styles.chip}
                    textStyle={styles.chipText}
                  >
                    {p.label}
                  </Chip>
                ))}
              </View>
              <LineChart
                data={weightData}
                width={chartWidth}
                height={200}
                chartConfig={weightChartConfig}
                style={{ borderRadius: 12, alignSelf: 'center' }}
                fromZero
                yLabelsOffset={8}
                formatYLabel={y => Number(y).toFixed(1)}
              />
            </Card.Content>
          </Card>
        )}
        {activeWidgets.includes('kcal') && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Text style={styles.chartTitle}>Динамика калорий</Text>
                <IconButton icon="close" size={20} onPress={() => handleRemoveWidget('kcal')} />
              </View>
              <View style={styles.periodRow}>
                {periods.map(p => (
                  <Chip
                    key={p.value}
                    selected={kcalPeriod === p.value}
                    onPress={() => setKcalPeriod(p.value)}
                    style={styles.chip}
                    textStyle={styles.chipText}
                  >
                    {p.label}
                  </Chip>
                ))}
              </View>
              <LineChart
                data={kcalData}
                width={chartWidth}
                height={200}
                chartConfig={weightChartConfig}
                style={{ borderRadius: 12, alignSelf: 'center' }}
                fromZero
                yLabelsOffset={8}
                formatYLabel={y => Math.round(Number(y)).toString()}
              />
            </Card.Content>
          </Card>
        )}
        {activeWidgets.includes('water') && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Text style={styles.chartTitle}>Динамика потребления воды</Text>
                <IconButton icon="close" size={20} onPress={() => handleRemoveWidget('water')} />
              </View>
              <View style={styles.periodRow}>
                {periods.map(p => (
                  <Chip
                    key={p.value}
                    selected={waterPeriod === p.value}
                    onPress={() => setWaterPeriod(p.value)}
                    style={styles.chip}
                    textStyle={styles.chipText}
                  >
                    {p.label}
                  </Chip>
                ))}
              </View>
              <LineChart
                data={waterData}
                width={chartWidth}
                height={200}
                chartConfig={weightChartConfig}
                style={{ borderRadius: 12, alignSelf: 'center' }}
                fromZero
                yLabelsOffset={8}
                formatYLabel={y => Number(y).toFixed(1)}
              />
            </Card.Content>
          </Card>
        )}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.chartTitle}>Рекомендации</Text>
            <View style={styles.recommendRow}>
              <MaterialCommunityIcons name="run-fast" size={28} color="#43cea2" style={{marginRight: 8}} />
              <Text style={styles.recommendText}>
                Следите за динамикой веса и корректируйте рацион при необходимости.
              </Text>
            </View>
            <View style={styles.recommendRow}>
              <MaterialCommunityIcons name="food-apple" size={28} color="#6C63FF" style={{marginRight: 8}} />
              <Text style={styles.recommendText}>
                Соблюдайте баланс КБЖУ для достижения целей по весу.
              </Text>
            </View>
            <View style={styles.recommendRow}>
              <MaterialCommunityIcons name="cup-water" size={28} color="#43cea2" style={{marginRight: 8}} />
              <Text style={styles.recommendText}>
                Пейте больше воды — это важно для обмена веществ и контроля аппетита.
              </Text>
            </View>
          </Card.Content>
        </Card>
        <View style={{ height: 80 }} />
      </ScrollView>
      <Portal>
        <Modal visible={addWidgetVisible} onDismiss={() => setAddWidgetVisible(false)} contentContainerStyle={styles.modal}>
          <Text style={styles.modalTitle}>Добавить виджет</Text>
          {widgetList.map(w => (
            <Button
              key={w.key}
              icon={w.icon}
              mode={activeWidgets.includes(w.key) ? 'contained' : 'outlined'}
              style={styles.widgetBtn}
              onPress={() => { handleAddWidget(w.key); setAddWidgetVisible(false); }}
              disabled={activeWidgets.includes(w.key)}
            >
              {w.label}
            </Button>
          ))}
        </Modal>
      </Portal>
    </View>
  );
}

const weightChartConfig = {
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  addBtn: {
    position: 'absolute',
    right: 0,
    top: -8,
    zIndex: 2,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
    marginBottom: 0,
  },
  card: {
    borderRadius: 18,
    backgroundColor: '#fff',
    marginBottom: 18,
    padding: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
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
  periodRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 4,
  },
  chip: {
    marginHorizontal: 4,
    marginBottom: 4,
    backgroundColor: '#f6f6fa',
    maxWidth: 90,
    minWidth: 88,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 0,
    paddingRight: 0,
    paddingLeft: 3,
  },
  chipText: {
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'center',
    marginLeft: 0,
  },
  widgetBtn: {
    marginVertical: 6,
    borderRadius: 14,
    width: 260,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 18,
    marginHorizontal: 24,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#6C63FF',
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