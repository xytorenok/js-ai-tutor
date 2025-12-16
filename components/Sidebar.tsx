import React from 'react';
import { Topic, TOPICS } from '../types';

interface SidebarProps {
  currentTopicId: string;
  completedCounts: Record<string, number>;
  onSelectTopic: (topic: Topic) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentTopicId, 
  completedCounts, 
  onSelectTopic, 
  isOpen,
  onClose
}) => {
  // Group topics by category
  const groupedTopics = TOPICS.reduce((acc, topic) => {
    if (!acc[topic.category]) {
      acc[topic.category] = [];
    }
    acc[topic.category].push(topic);
    return acc;
  }, {} as Record<string, Topic[]>);

  const categories = Object.keys(groupedTopics) as Array<Topic['category']>;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar Content */}
      <aside 
        className={`
          fixed md:relative z-30 flex flex-col h-full w-72 bg-gray-900 border-r border-gray-800 
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white">Темы</h2>
          <button onClick={onClose} className="md:hidden text-gray-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-700">
          {categories.map((category) => (
            <div key={category}>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                {category}
              </h3>
              <div className="space-y-1">
                {groupedTopics[category].map((topic) => {
                  const isSelected = currentTopicId === topic.id;
                  const count = completedCounts[topic.id] || 0;
                  
                  return (
                    <button
                      key={topic.id}
                      onClick={() => {
                        onSelectTopic(topic);
                        if (window.innerWidth < 768) onClose();
                      }}
                      className={`
                        w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all
                        ${isSelected 
                          ? 'bg-indigo-600/20 text-indigo-300 ring-1 ring-indigo-500/50' 
                          : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'}
                      `}
                    >
                      <span className="truncate mr-2 text-left">{topic.name}</span>
                      {count > 0 && (
                        <span className={`
                          text-[10px] font-mono px-1.5 py-0.5 rounded-full
                          ${isSelected ? 'bg-indigo-500/30 text-indigo-200' : 'bg-gray-700 text-gray-400'}
                        `}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
};