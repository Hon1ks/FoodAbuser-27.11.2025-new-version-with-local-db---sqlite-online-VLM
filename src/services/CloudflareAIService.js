/**
 * Cloudflare AI Service
 * Анализ еды через Cloudflare Workers + OpenRouter API
 * 
 * @version 2.0.0
 * @date 31.12.2025
 */

import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

// Cloudflare Worker URL
const WORKER_URL = 'https://vlm-for-food-abuser.goorbunoov22.workers.dev/';

// Максимальный размер изображения для отправки
const MAX_IMAGE_WIDTH = 1024;
const MAX_IMAGE_HEIGHT = 1024;
const JPEG_QUALITY = 0.8;

/**
 * Анализ фото еды через Cloudflare Worker
 * @param {string} imageUri - URI локального изображения
 * @returns {Promise<Object>} - Результат анализа
 * @throws {Error} - Если анализ не удался
 */
export async function analyzeFoodImage(imageUri) {
  try {
    console.log('🔄 CloudflareAI: Starting food analysis...');
    console.log('📸 Image URI:', imageUri);

    // 1. Проверяем существование файла
    const fileInfo = await FileSystem.getInfoAsync(imageUri);
    if (!fileInfo.exists) {
      throw new Error('Image file not found');
    }
    console.log('✅ Image file exists, size:', fileInfo.size, 'bytes');

    // 2. Сжимаем изображение для уменьшения размера
    console.log('🔄 Compressing image...');
    const manipulatedImage = await ImageManipulator.manipulateAsync(
      imageUri,
      [
        {
          resize: {
            width: MAX_IMAGE_WIDTH,
            height: MAX_IMAGE_HEIGHT,
          },
        },
      ],
      {
        compress: JPEG_QUALITY,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );
    console.log('✅ Image compressed:', manipulatedImage.uri);

    // 3. Конвертируем сжатое изображение в base64
    console.log('📸 Converting image to base64...');
    const base64Image = await FileSystem.readAsStringAsync(manipulatedImage.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    console.log('✅ Image converted, base64 length:', base64Image.length);

    // 4. Вызываем Cloudflare Worker
    console.log('🌐 Calling Cloudflare Worker...');
    console.log('📍 URL:', WORKER_URL);
    
    const startTime = Date.now();
    const response = await fetch(WORKER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64Image,
      }),
    });
    const duration = Date.now() - startTime;

    console.log('📡 Worker response status:', response.status);
    console.log('⏱️ Request duration:', duration, 'ms');

    // 5. Обработка ошибок
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || `HTTP ${response.status}`;
      
      console.error('❌ Worker error:', errorMessage);
      console.error('📄 Error details:', JSON.stringify(errorData, null, 2));
      
      if (response.status === 429) {
        throw new Error('Слишком много запросов. Попробуйте через минуту.');
      }
      
      if (response.status === 400) {
        throw new Error('Некорректное изображение. Попробуйте другое фото.');
      }
      
      throw new Error(`Ошибка анализа: ${errorMessage}`);
    }

    // 6. Парсим результат
    const result = await response.json();
    console.log('✅ Analysis completed successfully');
    console.log('📊 Raw result:', JSON.stringify(result, null, 2));

    // 7. Валидация и нормализация результата
    if (result.error) {
      throw new Error(result.error);
    }

    if (!result.items || !Array.isArray(result.items)) {
      throw new Error('Invalid response format: missing items array');
    }

    if (!result.total) {
      throw new Error('Invalid response format: missing total object');
    }

    // 8. Нормализация данных (добавляем ru_name если отсутствует)
    const normalizedItems = result.items.map(item => ({
      name: item.name || 'Неизвестное блюдо',
      ru_name: item.ru_name || item.name || 'Неизвестное блюдо',
      grams: Number(item.grams) || 100,
      calories: Number(item.calories) || 0,
      protein: Number(item.protein) || 0,
      fat: Number(item.fat) || 0,
      carbs: Number(item.carbs) || 0,
      confidence: Number(item.confidence) || 0.5,
    }));

    const normalizedResult = {
      items: normalizedItems,
      total: {
        calories: Number(result.total.calories) || 0,
        protein: Number(result.total.protein) || 0,
        fat: Number(result.total.fat) || 0,
        carbs: Number(result.total.carbs) || 0,
      },
    };

    console.log('📊 Found items:', normalizedResult.items.length);
    console.log('📊 Total calories:', normalizedResult.total.calories);

    return normalizedResult;
  } catch (error) {
    console.error('❌ CloudflareAI: Analysis failed');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    throw error;
  }
}

/**
 * Проверка доступности сервиса
 * @returns {Promise<boolean>}
 */
export async function checkServiceAvailability() {
  try {
    const response = await fetch(WORKER_URL, {
      method: 'OPTIONS',
    });
    return response.ok;
  } catch (error) {
    console.error('Service unavailable:', error);
    return false;
  }
}

export default {
  analyzeFoodImage,
  checkServiceAvailability,
};

