import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Brain, Sparkles, Link2, BookOpen } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  relatedConcepts?: string[];
  knowledgeNodes?: string[];
}

export function AskYourBrain() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hello! I'm your AI knowledge assistant. I have access to all your stored knowledge. Ask me anything about what you've learned!",
    },
  ]);
  const [inputValue, setInputValue] = useState('');

  const suggestedQuestions = [
    "What do I know about reinforcement learning?",
    "Explain backpropagation in neural networks",
    "What are the key differences between CNNs and RNNs?",
    "Show me my understanding of transformers",
  ];

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: generateAIResponse(inputValue),
        relatedConcepts: ['Neural Networks', 'Gradient Descent', 'Activation Functions'],
        knowledgeNodes: ['Deep Learning', 'Backpropagation', 'Loss Functions'],
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  const generateAIResponse = (question: string): string => {
    if (question.toLowerCase().includes('reinforcement learning')) {
      return "Based on your knowledge graph, you have a moderate understanding of Reinforcement Learning (65% strength). You've covered Q-Learning and Policy Gradients, but these concepts show lower retention (58-72%). Your notes indicate that RL is about learning optimal actions through trial and error using reward signals. However, I notice you haven't reviewed these concepts in 3 days - I recommend a review session soon.";
    }
    
    if (question.toLowerCase().includes('backpropagation')) {
      return "You have strong knowledge of Backpropagation (88% retention). From your notes: Backpropagation is the algorithm for computing gradients in neural networks using the chain rule. It efficiently calculates how each weight contributes to the loss by propagating errors backward through the network. You've connected this concept well with Gradient Descent and Loss Functions in your knowledge graph.";
    }

    return "I found several concepts related to your question in your knowledge base. Based on your learning patterns and concept connections, here's what I can tell you...";
  };

  const handleQuestionClick = (question: string) => {
    setInputValue(question);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Ask Your Brain</h1>
        <p className="text-[#8B92A8]">Query your knowledge base with AI-powered answers</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Area */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#131824] border border-[rgba(79,140,255,0.2)] rounded-xl overflow-hidden flex flex-col"
            style={{ height: '600px' }}
          >
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-xl p-4 ${
                        message.type === 'user'
                          ? 'bg-gradient-to-r from-[#4F8CFF] to-[#7A5CFF] text-white'
                          : 'bg-[rgba(79,140,255,0.1)] border border-[rgba(79,140,255,0.2)] text-[#E8EEF7]'
                      }`}
                    >
                      {message.type === 'ai' && (
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="w-4 h-4 text-[#4F8CFF]" />
                          <span className="text-sm text-[#4F8CFF] font-semibold">AI Assistant</span>
                        </div>
                      )}
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      
                      {message.relatedConcepts && message.relatedConcepts.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-[rgba(79,140,255,0.2)]">
                          <p className="text-xs text-[#8B92A8] mb-2 flex items-center gap-1">
                            <Link2 className="w-3 h-3" />
                            Related Concepts
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {message.relatedConcepts.map((concept) => (
                              <span
                                key={concept}
                                className="px-2 py-1 bg-[rgba(79,140,255,0.2)] text-[#4F8CFF] rounded text-xs border border-[rgba(79,140,255,0.3)]"
                              >
                                {concept}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {message.knowledgeNodes && message.knowledgeNodes.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-[rgba(79,140,255,0.2)]">
                          <p className="text-xs text-[#8B92A8] mb-2 flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            Knowledge Nodes Referenced
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {message.knowledgeNodes.map((node) => (
                              <span
                                key={node}
                                className="px-2 py-1 bg-[rgba(122,92,255,0.2)] text-[#7A5CFF] rounded text-xs border border-[rgba(122,92,255,0.3)]"
                              >
                                {node}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Input Area */}
            <div className="border-t border-[rgba(79,140,255,0.2)] p-4">
              <div className="flex items-end gap-3">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Ask about your knowledge..."
                  className="flex-1 bg-[rgba(79,140,255,0.05)] border border-[rgba(79,140,255,0.2)] rounded-lg p-3 text-white placeholder-[#8B92A8] focus:outline-none focus:border-[#4F8CFF] resize-none"
                  rows={2}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendMessage}
                  className="p-3 bg-gradient-to-r from-[#4F8CFF] to-[#7A5CFF] text-white rounded-lg"
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Suggestions Panel */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#131824] border border-[rgba(79,140,255,0.2)] rounded-xl p-6"
          >
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#FFB800]" />
              Suggested Questions
            </h2>
            <div className="space-y-2">
              {suggestedQuestions.map((question, index) => (
                <motion.button
                  key={question}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 4 }}
                  onClick={() => handleQuestionClick(question)}
                  className="w-full text-left bg-[rgba(79,140,255,0.05)] border border-[rgba(79,140,255,0.2)] rounded-lg p-3 text-sm text-[#E8EEF7] hover:border-[rgba(79,140,255,0.4)] transition-all"
                >
                  {question}
                </motion.button>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-[rgba(79,140,255,0.1)] to-[rgba(122,92,255,0.1)] border border-[rgba(79,140,255,0.3)] rounded-xl p-6"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[rgba(79,140,255,0.2)] rounded-lg flex-shrink-0">
                <Brain className="w-5 h-5 text-[#4F8CFF]" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-2">How it works</h3>
                <ul className="space-y-2 text-sm text-[#8B92A8]">
                  <li className="flex items-start gap-2">
                    <span className="text-[#4F8CFF] mt-0.5">•</span>
                    <span>I search through your entire knowledge graph</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#4F8CFF] mt-0.5">•</span>
                    <span>I consider concept connections and relationships</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#4F8CFF] mt-0.5">•</span>
                    <span>I factor in your retention strength for each topic</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#4F8CFF] mt-0.5">•</span>
                    <span>I provide context-aware explanations</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[#131824] border border-[rgba(79,140,255,0.2)] rounded-xl p-6"
          >
            <h2 className="text-lg font-semibold text-white mb-4">Quick Stats</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#8B92A8]">Knowledge Nodes</span>
                <span className="text-lg font-bold text-white">342</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#8B92A8]">Connections</span>
                <span className="text-lg font-bold text-white">1,247</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#8B92A8]">Avg. Strength</span>
                <span className="text-lg font-bold text-[#4F8CFF]">84.2%</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
