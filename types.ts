export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  image?: string;
  timestamp: number;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export interface Topic {
  id: string;
  name: string;
  category: 'HTML' | 'CSS' | 'JavaScript: Basics' | 'JavaScript: Flow' | 'JavaScript: Functions' | 'JavaScript: Data' | 'JavaScript: Web' | 'JavaScript: Advanced';
}

export const TOPICS: Topic[] = [
  // HTML
  { id: 'html-tags', name: 'Теги и Структура', category: 'HTML' },
  { id: 'html-attributes', name: 'Атрибуты и Ссылки', category: 'HTML' },
  { id: 'html-forms', name: 'Формы и Ввод', category: 'HTML' },
  { id: 'html-semantic', name: 'Семантика и SEO', category: 'HTML' },
  { id: 'html-media', name: 'Изображения и Медиа', category: 'HTML' },

  // CSS
  { id: 'css-selectors', name: 'Селекторы и Каскад', category: 'CSS' },
  { id: 'css-colors', name: 'Цвета и Фоны', category: 'CSS' },
  { id: 'css-box-model', name: 'Box Model (margin, padding)', category: 'CSS' },
  { id: 'css-typography', name: 'Типографика', category: 'CSS' },
  { id: 'css-flexbox', name: 'Flexbox Layout', category: 'CSS' },
  { id: 'css-grid', name: 'Grid Layout', category: 'CSS' },
  { id: 'css-position', name: 'Позиционирование (absolute, etc)', category: 'CSS' },
  { id: 'css-animations', name: 'Анимации и Переходы', category: 'CSS' },

  // JavaScript
  { id: 'variables', name: 'Переменные (var, let, const)', category: 'JavaScript: Basics' },
  { id: 'types', name: 'Типы данных и преобразование', category: 'JavaScript: Basics' },
  { id: 'operators', name: 'Операторы и арифметика', category: 'JavaScript: Basics' },
  { id: 'conditions', name: 'Условия (if/else, switch)', category: 'JavaScript: Flow' },
  { id: 'loops', name: 'Циклы (for, while)', category: 'JavaScript: Flow' },
  { id: 'functions-basic', name: 'Объявление функций', category: 'JavaScript: Functions' },
  { id: 'arrow-functions', name: 'Стрелочные функции', category: 'JavaScript: Functions' },
  { id: 'scope', name: 'Область видимости и замыкания', category: 'JavaScript: Functions' },
  { id: 'arrays', name: 'Массивы и методы массивов', category: 'JavaScript: Data' },
  { id: 'objects', name: 'Объекты и методы', category: 'JavaScript: Data' },
  { id: 'dom', name: 'DOM манипуляции', category: 'JavaScript: Web' },
  { id: 'events', name: 'События (Events)', category: 'JavaScript: Web' },
  { id: 'promises', name: 'Promises и async/await', category: 'JavaScript: Advanced' },
  { id: 'classes', name: 'Классы и ООП', category: 'JavaScript: Advanced' },
];