import React from 'react';
import { X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea'; // Or use Input

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Chatbot({ isOpen, onClose }: ChatbotProps) {
  return (
    <div 
      className={`fixed top-0 right-0 h-full w-80 md:w-96 bg-white shadow-lg z-50 flex flex-col border-l border-gray-200 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-800">Homie Helper</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5 text-gray-500" />
        </Button>
      </div>

      {/* Chat Messages Area (Placeholder) */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {/* Example Messages */}
        <div className="flex justify-start">
          <div className="bg-gray-100 p-3 rounded-lg max-w-[80%]">
            <p className="text-sm text-gray-700">Hi! How can I help you find your perfect apartment today?</p>
          </div>
        </div>
        {/* Add more message placeholders or logic later */}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <Input 
            type="text" 
            placeholder="Ask Homie anything..." 
            className="flex-1 bg-white" 
          />
          <Button className="bg-homie hover:bg-homie-dark" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 