import { useState } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { Topic } from '../../types/index';

interface QuestionFormProps {
  mode: 'create' | 'edit';
  initialData: {
    topic_id: string;
    text: string;
    explanation: string;
    difficulty: 'easy' | 'medium' | 'hard';
    options: Array<{
      id?: string; // Делаем id опциональным
      text: string;
      isCorrect: boolean;
    }>;
  };
  saveButtonText?: string;
  topics: Topic[];
  onSave: (data: any) => void;
  onCancel: () => void;
  onRequestAddTopic: () => void;
}

export const QuestionForm = ({
  //mode,
  initialData,
  topics,
  onSave,
  onCancel,
  onRequestAddTopic,
  saveButtonText = "Сохранить"
}: QuestionFormProps) => {
  const [formData, setFormData] = useState(initialData);

  const handleOptionChange = (index: number, field: string, value: string | boolean) => {
    const updatedOptions = [...formData.options];
    updatedOptions[index] = { ...updatedOptions[index], [field]: value };
    setFormData({ ...formData, options: updatedOptions });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Тема</label>
        <div className="flex gap-2">
          {topics.length === 0 ? (
            <p className="text-red-500">Сначала создайте тему</p>
          ) : (
            <>
              <select
                value={formData.topic_id}
                onChange={(e) => setFormData({ ...formData, topic_id: e.target.value })}
                className="flex-1 p-2 border border-gray-300 rounded-md"
              >
                {topics.map(topic => (
                  <option key={topic.id} value={topic.id.toString()}>
                    {topic.name}
                  </option>
                ))}
              </select>
              <Button onClick={onRequestAddTopic} type="button">
                <PlusIcon className="w-4 h-4 mr-1" /> Новая тема
              </Button>
            </>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Текст вопроса</label>
        <textarea
          value={formData.text}
          onChange={(e) => setFormData({ ...formData, text: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-md"
          rows={3}
          placeholder="Введите текст вопроса"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Объяснение
        </label>
        <textarea
          value={formData.explanation}
          onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-md"
          rows={2}
          placeholder="Объяснение ответа"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Сложность</label>
        <select
          value={formData.difficulty}
          onChange={(e) => setFormData({ 
            ...formData, 
            difficulty: e.target.value as 'easy' | 'medium' | 'hard' 
          })}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="easy">Легкий</option>
          <option value="medium">Средний</option>
          <option value="hard">Сложный</option>
        </select>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-3">Варианты ответов</h3>
        {formData.options.map((option, index) => (
          <div key={index} className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={option.isCorrect}
              onChange={(e) => handleOptionChange(index, 'isCorrect', e.target.checked)}
              className="mr-2 h-5 w-5 text-emerald-600"
            />
            <Input
              type="text"
              value={option.text}
              onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
              placeholder={`Вариант ответа ${index + 1}`}
              className="flex-1"
            />
            <button
              type="button"
              onClick={() => {
                const updatedOptions = [...formData.options];
                updatedOptions.splice(index, 1);
                setFormData({ ...formData, options: updatedOptions });
              }}
              className="ml-2 p-2 text-red-500 hover:text-red-700"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => {
            if (formData.options.length < 6) {
              setFormData({
                ...formData,
                options: [...formData.options, { text: '', isCorrect: false }]
              });
            }
          }}
          className="mt-2 flex items-center text-emerald-600 hover:text-emerald-800"
        >
          <PlusIcon className="w-4 h-4 mr-1" /> Добавить вариант
        </button>
      </div>

      <div className="flex justify-end space-x-3">
        <Button onClick={onCancel} variant="secondary" type="button">
          Отмена
        </Button>
        <button type="submit" className="bg-blue-500 text-white">
          {saveButtonText}
        </button>
      </div>
    </form>
  );
};