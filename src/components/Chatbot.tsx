import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Define the structure for a chat message
interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
}

// Define the structure for filters the chatbot might extract
// Should align with query params for /api/listings
interface SearchFilters {
    location?: string;
    priceRange?: string; // e.g., "1000-2000" or "3000-"
    bedrooms?: string; // e.g., "2", "3+", "studio"
    bathrooms?: string; // e.g., "1", "2+"
    // Add other filter keys based on your API (garage, furnished, etc.)
    [key: string]: any; // Allow other potential filters
}

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  // Callback to update search filters in the parent component
  onSearchUpdate: (filters: SearchFilters) => void;
}

export default function Chatbot({ isOpen, onClose, onSearchUpdate }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'initial', sender: 'bot', text: 'Hi! How can I help you find your perfect apartment today?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleSendMessage = async () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput) return;

    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString() + '-user',
      sender: 'user',
      text: trimmedInput,
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // --- Send message to backend chatbot API ---
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmedInput }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const data = await response.json();
      // data should contain { filters: SearchFilters, explanation: string }

      // Add bot response to chat
      const botMessage: Message = {
        id: Date.now().toString() + '-bot',
        sender: 'bot',
        text: data.explanation || "I couldn't quite understand that, could you rephrase?", // Default message
      };
      setMessages(prev => [...prev, botMessage]);

      // Update search filters in parent component if filters were returned
      if (data.filters && Object.keys(data.filters).length > 0) {
        console.log("Chatbot triggering search update with filters:", data.filters);
        onSearchUpdate(data.filters);
      }

    } catch (error) {
      console.error("Error communicating with chatbot API:", error);
      const errorMessage: Message = {
        id: Date.now().toString() + '-error',
        sender: 'bot',
        text: 'Sorry, I encountered an error. Please try again.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !isLoading) {
      handleSendMessage();
    }
  };


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

      {/* Chat Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50/50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`p-3 rounded-lg max-w-[85%] shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-homie text-white'
                  : 'bg-white text-gray-700 border border-gray-100'
              }`}
            >
              <p className="text-sm">{msg.text}</p>
            </div>
          </div>
        ))}
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-white text-gray-700 border border-gray-100 p-3 rounded-lg max-w-[85%] shadow-sm">
                <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
             </div>
          </div>
        )}
        {/* Invisible div to scroll to */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 bg-gray-100">
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="Ask Homie anything..."
            className="flex-1 bg-white"
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <Button
            className="bg-homie hover:bg-homie-dark"
            size="icon"
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            aria-label="Send message"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
} 