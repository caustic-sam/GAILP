'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Shield, Send, Loader2, BookOpen, FileText } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface NISTAssistantProps {
  apiEndpoint?: string;
  compact?: boolean;
}

export function NISTAssistant({
  apiEndpoint = process.env.NEXT_PUBLIC_NIST_LLM_API || 'http://localhost:8000',
  compact = false
}: NISTAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean | null>(null); // null = checking, true = online, false = offline

  // Check API health on mount
  useEffect(() => {
    const checkAPIHealth = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const response = await fetch(`${apiEndpoint}/health`, {
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        setIsOnline(response.ok);
      } catch (error) {
        setIsOnline(false);
      }
    };

    checkAPIHealth();
  }, [apiEndpoint]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call your NIST LLM API
      const response = await fetch(`${apiEndpoint}/api/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: input,
          context: 'policy-analysis'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch response');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.answer || data.response || 'I apologize, but I could not process that query.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('NIST LLM Error:', error);

      // Fallback response when API is unavailable
      const fallbackMessage: Message = {
        role: 'assistant',
        content: 'I\'m currently offline. The NIST Assistant is based on NIST Special Publications (SP 800 series) covering cybersecurity frameworks, identity management, and digital policy. Please ensure the backend service is running or check back later.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const exampleQuestions = [
    "What is NIST's guidance on multi-factor authentication?",
    "Explain the Privacy Framework",
    "What are the key controls in SP 800-53?",
    "How does NIST define zero trust architecture?"
  ];

  const handleExampleClick = (question: string) => {
    setInput(question);
  };

  if (compact) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-gray-500 font-medium mb-1">NIST ASSISTANT</div>
            <p className="text-xs text-gray-600">Ask about NIST cybersecurity standards</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-full" role="region" aria-label="NIST Assistant chatbot">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center" aria-hidden="true">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900">NIST Assistant</h3>
            <p className="text-xs text-gray-600">Trained on NIST SP 800 Series</p>
          </div>
          <div className="flex items-center gap-1">
            {isOnline === null ? (
              <>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
                <span className="text-xs text-gray-500">Checking...</span>
              </>
            ) : isOnline ? (
              <>
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-xs text-gray-500">Online</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className="text-xs text-gray-500">Offline</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[500px]" role="log" aria-live="polite" aria-label="Chat messages">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-4" aria-hidden="true">
              <BookOpen className="w-8 h-8 text-indigo-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Welcome to NIST Assistant</h4>
            <p className="text-sm text-gray-600 mb-4 max-w-xs">
              Ask me anything about NIST cybersecurity standards, frameworks, and best practices.
            </p>

            {/* Example Questions */}
            <div className="w-full max-w-md space-y-2">
              <p className="text-xs text-gray-500 font-medium mb-2">Try asking:</p>
              {exampleQuestions.map((question, idx) => (
                <button
                  key={idx}
                  onClick={() => handleExampleClick(question)}
                  className="w-full text-left p-3 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                >
                  <FileText className="w-4 h-4 inline mr-2 text-gray-400" />
                  {question}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-indigo-600" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <div className={`text-xs mt-1 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 text-white text-sm font-semibold">
                  You
                </div>
              )}
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <Shield className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="bg-gray-100 rounded-lg p-3">
              <Loader2 className="w-5 h-5 text-gray-600 animate-spin" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200" aria-label="Ask a question about NIST standards">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about NIST standards..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            disabled={isLoading}
            aria-label="Your question"
            aria-describedby="nist-assistant-help"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            size="md"
            icon={isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          >
            Send
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2" id="nist-assistant-help">
          Powered by NIST SP 800 corpus • <a href="#" className="text-blue-600 hover:underline" aria-label="Learn more about NIST Assistant">Learn more</a>
        </p>
      </form>
    </Card>
  );
}

export default NISTAssistant;
