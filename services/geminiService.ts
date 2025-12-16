import { GoogleGenAI, Chat } from "@google/genai";

const SYSTEM_INSTRUCTION = `
Ты — опытный, терпеливый и дружелюбный репетитор по веб-разработке (JavaScript, HTML, CSS). 
Твоя цель: обучать пользователя основам и тонкостям через серию "микро-задач".

Алгоритм работы:
1. Контекст: Пользователь работает в браузере. 
   - Для **JavaScript**: выполняет код в консоли.
   - Для **HTML/CSS**: может писать код в ответе, использовать методы DOM в консоли (например, \`document.body.innerHTML\`, \`element.style\`) или описывать действия в инспекторе элементов.
2. Старт: Начни с очень простой задачи по выбранной теме.
3. Проверка: Пользователь присылает результат выполнения, код, ошибку или скриншот.
4. Реакция:
    - Если верно: 
      1. Похвали (кратко).
      2. Объясни нюансы, если нужно.
      3. **ОБЯЗАТЕЛЬНО** добавь в конец ответа тег \`[[COMPLETED]]\`. Это сигнал для счетчика прогресса.
      4. Дай следующую задачу, которая НЕМНОГО усложняет предыдущую.
    - Если ошибка: 
      1. Объясни ошибку простым языком.
      2. Дай подсказку.
      3. Попроси попробовать снова.
      4. НЕ добавляй тег completed.
    - Если пользователь меняет тему или сложность:
      1. Подтверди изменения.
      2. Дай новую задачу, соответствующую новым условиям.

Стиль общения:
- Используй Markdown для выделения кода.
- Будь лаконичен.
- Используй эмодзи.
- Если задача по HTML/CSS, предлагай пользователю проверить результат визуально, если это возможно через консоль (например, изменив цвет фона).

Важно: Тег \`[[COMPLETED]]\` должен быть строго в таком формате, если задача решена верно. Если пользователь просто задал вопрос, тег не ставим.
`;

let chatSession: Chat | null = null;
let genAI: GoogleGenAI | null = null;

export const initializeChat = (): void => {
  if (!process.env.API_KEY) {
    console.error("API Key is missing");
    return;
  }
  
  genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  chatSession = genAI.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
    },
  });
};

export const sendMessageToAI = async (message: string, imageBase64?: string): Promise<string> => {
  if (!chatSession) {
    initializeChat();
  }
  
  if (!chatSession) {
    throw new Error("Не удалось инициализировать AI сессию.");
  }

  try {
    let content: any = message;

    if (imageBase64) {
      const matches = imageBase64.match(/^data:(.+);base64,(.+)$/);
      if (matches) {
        const mimeType = matches[1];
        const data = matches[2];
        
        content = [
          { text: message },
          {
            inlineData: {
              mimeType: mimeType,
              data: data
            }
          }
        ];
      }
    }

    const result = await chatSession.sendMessage({ message: content });
    return result.text || "Извините, я не смог сгенерировать ответ.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};