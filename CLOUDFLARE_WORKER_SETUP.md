# 🔧 Настройка Cloudflare Worker для анализа еды

## 📋 ЧТО НУЖНО СДЕЛАТЬ:

### 1. Установить API ключ OpenRouter

1. **Откройте Cloudflare Dashboard**
   - https://dash.cloudflare.com/
   - Перейдите в Workers & Pages
   - Выберите ваш Worker: `vlm-for-food-abuser`

2. **Добавьте Environment Variable**
   - Settings → Variables
   - Нажмите "Add variable"
   - Name: `OPENROUTER_API_KEY`
   - Value: ваш ключ от OpenRouter (https://openrouter.ai/keys)
   - Type: **Secret** (✅ Encrypt)
   - Нажмите "Save"

3. **Задеплойте Worker заново**
   - Любое изменение требует re-deploy

---

### 2. Обновить код Worker

Скопируйте **ПОЛНЫЙ КОД** в ваш Worker:

```javascript
/**
 * Cloudflare Worker для анализа еды через VLM
 * @version 2.1 - Модель возвращает полный анализ с КБЖУ
 */

// System prompt - модель сама знает КБЖУ
const SYSTEM_PROMPT = `Ты - эксперт по анализу еды и нутриционист. Проанализируй изображение и верни ТОЛЬКО валидный JSON.

ФОРМАТ ОТВЕТА (строгий JSON):
{
  "items": [
    {
      "name": "название на английском (lowercase)",
      "ru_name": "название на русском",
      "confidence": 0.85,
      "grams": 150,
      "calories": 220,
      "protein": 25.5,
      "fat": 8.2,
      "carbs": 12.0
    }
  ]
}

ПРАВИЛА:
1. Анализируй ТОЛЬКО еду (игнорируй посуду, столы, руки, фон)
2. Для КАЖДОГО блюда укажи:
   - name: английское название строчными буквами (например: "chicken", "rice", "tomato")
   - ru_name: русское название (например: "Курица", "Рис", "Помидор")
   - confidence: уверенность в распознавании (0.7-0.95)
   - grams: примерный вес в граммах (50-600г)
   - calories: калории на указанный вес
   - protein: белки (г) на указанный вес
   - fat: жиры (г) на указанный вес
   - carbs: углеводы (г) на указанный вес

3. КБЖУ рассчитывай НА УКАЗАННЫЙ ВЕС (grams), не на 100г
4. Если блюдо составное (например, бутерброд) - раздели на компоненты
5. ОТВЕТ ДОЛЖЕН БЫТЬ ТОЛЬКО ВАЛИДНЫМ JSON - БЕЗ ТЕКСТА ДО И ПОСЛЕ

ПРИМЕРЫ:
Куриная грудка 200г с рисом 150г:
{
  "items": [
    {
      "name": "chicken_breast",
      "ru_name": "Куриная грудка",
      "confidence": 0.90,
      "grams": 200,
      "calories": 330,
      "protein": 62.0,
      "fat": 7.2,
      "carbs": 0
    },
    {
      "name": "rice",
      "ru_name": "Рис",
      "confidence": 0.88,
      "grams": 150,
      "calories": 195,
      "protein": 4.0,
      "fat": 0.5,
      "carbs": 42.0
    }
  ]
}`;

export default {
  async fetch(request, env) {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Health check
    if (request.method === 'GET') {
      return new Response(JSON.stringify({ 
        status: 'ok', 
        version: '2.1',
        hasApiKey: !!env.OPENROUTER_API_KEY 
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    try {
      // Проверка API ключа
      if (!env.OPENROUTER_API_KEY) {
        console.error('❌ OPENROUTER_API_KEY not configured');
        return new Response(JSON.stringify({ 
          error: 'Server configuration error',
          details: 'API key not configured. Please add OPENROUTER_API_KEY to environment variables.'
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      const { image } = await request.json();
      
      if (!image) {
        return new Response(JSON.stringify({ error: 'No image provided' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      console.log('🔄 Calling OpenRouter API...');
      console.log('📏 Image size (base64):', image.length, 'chars');

      // Вызов OpenRouter API
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'nvidia/llama-3.2-nv-nemotron-nano-12b-vision-instruct:free',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: SYSTEM_PROMPT,
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${image}`,
                  },
                },
              ],
            },
          ],
          max_tokens: 1000,
          temperature: 0.2,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ OpenRouter error:', response.status, errorText);
        return new Response(JSON.stringify({
          error: `OpenRouter API error: ${response.status}`,
          details: errorText.substring(0, 200),
        }), {
          status: response.status,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      const data = await response.json();
      console.log('✅ OpenRouter response received');

      // Извлекаем текст ответа
      const modelText = data.choices?.[0]?.message?.content;
      if (!modelText) {
        throw new Error('No content in model response');
      }

      console.log('📝 Model text:', modelText.substring(0, 200) + '...');

      // Парсим JSON из ответа модели
      let parsedData;
      try {
        // Пытаемся найти JSON в ответе (может быть обернут в текст или markdown)
        const jsonMatch = modelText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON found in response');
        }
        parsedData = JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error('❌ Failed to parse model JSON:', e);
        console.error('Model text:', modelText);
        return new Response(JSON.stringify({
          error: 'Failed to parse model response',
          raw: modelText.substring(0, 100),
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      // Валидация структуры
      if (!parsedData.items || !Array.isArray(parsedData.items)) {
        throw new Error('Invalid response structure: missing items array');
      }

      // Валидация каждого item
      const validatedItems = parsedData.items.map(item => {
        if (!item.name || typeof item.grams !== 'number' || typeof item.calories !== 'number') {
          console.error('Invalid item:', item);
          throw new Error('Invalid item structure');
        }
        return {
          name: item.name,
          ru_name: item.ru_name || item.name,
          confidence: item.confidence || 0.80,
          grams: Math.round(item.grams),
          calories: Math.round(item.calories),
          protein: Math.round((item.protein || 0) * 10) / 10,
          fat: Math.round((item.fat || 0) * 10) / 10,
          carbs: Math.round((item.carbs || 0) * 10) / 10,
        };
      });

      // Считаем total
      const total = validatedItems.reduce((acc, item) => ({
        calories: acc.calories + item.calories,
        protein: acc.protein + item.protein,
        fat: acc.fat + item.fat,
        carbs: acc.carbs + item.carbs,
      }), { calories: 0, protein: 0, fat: 0, carbs: 0 });

      // Округляем total
      total.protein = Math.round(total.protein * 10) / 10;
      total.fat = Math.round(total.fat * 10) / 10;
      total.carbs = Math.round(total.carbs * 10) / 10;

      const result = {
        items: validatedItems,
        total: total,
      };

      console.log('✅ Analysis complete:', validatedItems.length, 'items');
      console.log('📊 Total:', total.calories, 'kcal');

      return new Response(JSON.stringify(result), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });

    } catch (error) {
      console.error('❌ Worker error:', error);
      return new Response(JSON.stringify({
        error: error.message,
        details: error.toString(),
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  },
};
```

---

## 3. Проверить работу Worker

### Health Check:
```bash
curl https://userworker/
```

Должно вернуть:
```json
{
  "status": "ok",
  "version": "2.1",
  "hasApiKey": true
}
```

Если `hasApiKey: false` - API ключ не установлен!

---

## 4. Тестирование в приложении

После настройки Worker:
1. Перезапустите приложение: `npx expo start -c`
2. Откройте "Добавить еду"
3. Выберите фото еды
4. Дождитесь анализа

---

## 🐛 Типичные ошибки:

### 1. `OPENROUTER_API_KEY not configured`
- **Решение:** Добавьте API ключ в Settings → Variables

### 2. `OpenRouter API error: 400`
- **Причины:**
  - Неправильный API ключ
  - Изображение слишком большое (сейчас сжимается до 1024x1024)
  - Неправильный формат запроса
- **Решение:** Проверьте API ключ на https://openrouter.ai/keys

### 3. `OpenRouter API error: 429`
- **Причина:** Слишком много запросов
- **Решение:** Подождите 1 минуту

### 4. `OpenRouter API error: 402`
- **Причина:** Недостаточно средств на балансе OpenRouter
- **Решение:** Пополните баланс или используйте бесплатную модель

---

## 📊 Что изменилось в приложении:

### CloudflareAIService.js v2.0:
1. ✅ **Сжатие изображений** до 1024x1024 (было 4MB → стало ~200KB)
2. ✅ **Улучшенное логирование** ошибок Worker
3. ✅ **Более подробная обработка ошибок**

---

## ✅ ИТОГО:

**Что нужно сделать прямо сейчас:**
1. ✅ Установить `OPENROUTER_API_KEY` в Cloudflare Worker
2. ✅ Заменить код Worker на новый (с проверкой API ключа)
3. ✅ Задеплойте Worker
4. ✅ Проверьте health check
5. ✅ Перезапустите приложение

**После этого анализ должен работать!** 🚀

