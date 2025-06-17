import  { useState } from 'react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import type { Topic } from '../../types/test.types';

const AdminTopics = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [newTopic, setNewTopic] = useState('');

  const handleAddTopic = () => {
    if (newTopic.trim()) {
      setTopics([...topics, { id: Date.now().toString(), name: newTopic }]);
      setNewTopic('');
    }
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Управление темами</h2>
        <div className="flex space-x-2">
          <input
            type="text"
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            placeholder="Новая тема"
            className="px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
          />
          <Button onClick={handleAddTopic}>
            <PlusIcon className="h-5 w-5 mr-1" />
            Добавить
          </Button>
        </div>
      </div>
      
      <div className="space-y-3">
        {topics.map(topic => (
          <div key={topic.id} className="flex justify-between items-center p-3 border rounded-md">
            <span>{topic.name}</span>
            <div className="flex space-x-2">
              <button className="p-1 text-blue-500 hover:text-blue-700">
                <PencilIcon className="w-5 h-5" />
              </button>
              <button 
                className="p-1 text-red-500 hover:text-red-700"
                onClick={() => setTopics(topics.filter(t => t.id !== topic.id))}
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default AdminTopics;