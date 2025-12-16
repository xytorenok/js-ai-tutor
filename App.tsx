import React, { useState, useEffect, useRef } from 'react';
import { initializeChat, sendMessageToAI } from './services/geminiService';
import { Message, Role, Topic, TOPICS } from './types';
import { MarkdownRenderer } from './components/MarkdownRenderer';
import { Sidebar } from './components/Sidebar';
import { Timer } from './components/Timer';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [pastedImage, setPastedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // New State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentTopic, setCurrentTopic] = useState<Topic>(TOPICS[0]);
  const [completedCounts, setCompletedCounts] = useState<Record<string, number>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeChat();
    startSession();
  }, []);

  const startSession = async () => {
    setIsLoading(true);
    try {
      const response = await sendMessageToAI(`Привет! Давай начнем урок. Тема: ${currentTopic.name}. Дай мне первую микро-задачу по этой теме.`);
      processAIResponse(response);
    } catch (error) {
      addMessage(Role.MODEL, "Ошибка подключения. Проверь API ключ.");
    } finally {
      setIsLoading(false);
    }
  };

  const addMessage = (role: Role, text: string, image?: string) => {
    const newMessage: Message = {
      id: crypto.randomUUID(),
      role,
      text,
      image,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  // Logic to parse the AI response for the special tag [[COMPLETED]]
  const processAIResponse = (text: string) => {
    const completedTag = '[[COMPLETED]]';
    let cleanText = text;
    
    if (text.includes(completedTag)) {
      cleanText = text.replace(completedTag, '').trim();
      // Increment counter for current topic
      setCompletedCounts(prev => ({
        ...prev,
        [currentTopic.id]: (prev[currentTopic.id] || 0) + 1
      }));
    }
    
    addMessage(Role.MODEL, cleanText);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, pastedImage]);

  const handleTopicChange = async (topic: Topic) => {
    if (topic.id === currentTopic.id) return;
    
    setCurrentTopic(topic);
    setIsLoading(true);
    addMessage(Role.MODEL, `🔄 Смена темы на: ${topic.name}...`);
    
    try {
      const response = await sendMessageToAI(`Пользователь сменил тему. Новая тема: ${topic.name}. Забудь контекст предыдущей задачи и дай простую начальную задачу по новой теме.`);
      processAIResponse(response);
    } catch (error) {
       addMessage(Role.MODEL, "Не удалось сменить тему.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDifficultyChange = async (label: string, instruction: string) => {
    if (isLoading) return;
    setIsLoading(true);
    // User sees a system message or we just send it silently? 
    // Let's show it as a system note.
    addMessage(Role.USER, `⚙️ Настройка: ${label}`);
    
    try {
      const response = await sendMessageToAI(`Измени сложность следующих задач. ${instruction}. Дай новую задачу с учетом этой сложности.`);
      processAIResponse(response);
    } catch (error) {
      addMessage(Role.MODEL, "Не удалось изменить сложность.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault();
        const blob = items[i].getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (typeof event.target?.result === 'string') {
              setPastedImage(event.target.result);
            }
          };
          reader.readAsDataURL(blob);
        }
        return; 
      }
    }
  };

  const removeImage = () => {
    setPastedImage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputValue.trim() && !pastedImage) || isLoading) return;

    const userText = inputValue;
    const userImage = pastedImage || undefined;

    setInputValue('');
    setPastedImage(null);
    
    addMessage(Role.USER, userText, userImage);
    setIsLoading(true);

    try {
      const aiResponse = await sendMessageToAI(userText, userImage);
      processAIResponse(aiResponse);
    } catch (error) {
      addMessage(Role.MODEL, "Произошла ошибка при получении ответа. Попробуй еще раз.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-950 text-gray-200 font-sans selection:bg-indigo-500 selection:text-white overflow-hidden">
      
      <Sidebar 
        currentTopicId={currentTopic.id}
        completedCounts={completedCounts}
        onSelectTopic={handleTopicChange}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex-none bg-gray-900 border-b border-gray-800 p-4 shadow-md z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <div className="flex items-center gap-2">
                 <div className="bg-gradient-to-tr from-indigo-500 to-purple-600 p-1.5 rounded-lg">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                   </svg>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg font-bold text-white leading-tight">JS Micro-Tutor</h1>
                  <p className="text-[10px] text-gray-400">{currentTopic.name}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Timer />
              <div className="hidden sm:block text-xs text-gray-500 bg-gray-800 px-3 py-1.5 rounded-full border border-gray-700">
                 F12 Console
              </div>
            </div>
        </header>

        {/* Chat Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth bg-gray-950">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.length === 0 && !isLoading && (
              <div className="text-center text-gray-500 mt-20 animate-pulse">
                Загрузка темы...
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex w-full ${msg.role === Role.USER ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[90%] md:max-w-[80%] rounded-2xl p-4 shadow-lg flex flex-col gap-3 ${
                    msg.role === Role.USER
                      ? 'bg-gradient-to-br from-indigo-600 to-blue-700 text-white rounded-tr-none border border-indigo-500/30'
                      : 'bg-gray-800 text-gray-100 rounded-tl-none border border-gray-700'
                  }`}
                >
                   {msg.role === Role.MODEL && (
                      <div className="flex items-center gap-2 pb-2 border-b border-gray-700/50">
                          <div className="w-5 h-5 rounded bg-emerald-500/20 flex items-center justify-center">
                              <span className="text-emerald-400 text-xs font-bold">AI</span>
                          </div>
                          <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">Tutor</span>
                      </div>
                   )}
                  
                  {msg.image && (
                    <div className="rounded-lg overflow-hidden border border-white/10">
                      <img src={msg.image} alt="User upload" className="max-w-full h-auto max-h-80 object-contain" />
                    </div>
                  )}
                  
                  {msg.text && <MarkdownRenderer content={msg.text} />}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start w-full">
                <div className="bg-gray-800/50 rounded-2xl rounded-tl-none p-4 flex items-center space-x-2 border border-gray-700/50">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* Input & Controls Area */}
        <footer className="flex-none bg-gray-900 border-t border-gray-800 p-4 z-20">
          <div className="max-w-4xl mx-auto w-full flex flex-col gap-3">
            
            {/* Difficulty Controls */}
            <div className="flex justify-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
               <button 
                  onClick={() => handleDifficultyChange("Значительно легче", "Сделай задачу намного проще, объясни базовые вещи.")}
                  disabled={isLoading}
                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-full text-xs text-green-300 transition-colors whitespace-nowrap"
               >
                 ⏪ Намного легче
               </button>
               <button 
                  onClick={() => handleDifficultyChange("Чуть легче", "Сделай задачу немного проще.")}
                  disabled={isLoading}
                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-full text-xs text-green-200 transition-colors whitespace-nowrap"
               >
                 ◀ Чуть легче
               </button>
               <button 
                  onClick={() => handleDifficultyChange("Чуть сложнее", "Сделай задачу немного сложнее, добавь нюанс.")}
                  disabled={isLoading}
                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-full text-xs text-orange-200 transition-colors whitespace-nowrap"
               >
                 Чуть сложнее ▶
               </button>
               <button 
                  onClick={() => handleDifficultyChange("Сложнее", "Сделай задачу значительно сложнее, challenge me.")}
                  disabled={isLoading}
                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-full text-xs text-orange-300 transition-colors whitespace-nowrap"
               >
                 Сложнее ⏩
               </button>
            </div>

            {pastedImage && (
              <div className="relative inline-block group self-start">
                <div className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 cursor-pointer shadow-sm z-10" onClick={removeImage}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                <img src={pastedImage} alt="Pasted preview" className="h-20 rounded-lg border border-indigo-500/50 shadow-lg" />
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="relative flex items-end gap-2 bg-gray-950 p-2 rounded-xl border border-gray-700 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all duration-300">
               <div className="hidden md:flex flex-col justify-end pb-3 pl-2 text-gray-500">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
               </div>
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onPaste={handlePaste}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Вставь результат из консоли или скриншот (Ctrl+V)..."
                className="w-full bg-transparent border-none focus:ring-0 text-gray-100 placeholder-gray-500 resize-none py-3 max-h-32 min-h-[50px] leading-tight"
                rows={1}
                style={{ minHeight: '52px' }}
              />
              <button
                type="submit"
                disabled={(!inputValue.trim() && !pastedImage) || isLoading}
                className="mb-1 p-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;