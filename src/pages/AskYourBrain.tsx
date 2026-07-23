import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LottieIcon } from '@/components/AnimatedIcons';
import { HelpCircle } from 'lucide-react';
import { askBrain, getKnowledgeGraph } from '@/lib/api';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  relatedConcepts?: string[];
  knowledgeNodes?: string[];
}

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className="flex justify-start"
    >
      <div className="max-w-[80%] rounded-xl p-4 bg-primary/10 border border-border">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-4 h-4">
            <LottieIcon name="brain" size={16} />
          </div>
          <span className="text-sm text-primary font-semibold">AI Assistant</span>
        </div>
        <div className="flex items-center gap-1.5">
          <motion.span
            className="w-2 h-2 rounded-full bg-primary"
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
          />
          <motion.span
            className="w-2 h-2 rounded-full bg-primary"
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
          />
          <motion.span
            className="w-2 h-2 rounded-full bg-primary"
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
          />
          <span className="text-xs text-muted-foreground ml-2">Thinking...</span>
        </div>
      </div>
    </motion.div>
  );
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
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [nodeCount, setNodeCount] = useState(0);
  const [connectionCount, setConnectionCount] = useState(0);
  const [avgStrength, setAvgStrength] = useState(0);
  const [suggestedQuestions, setSuggestedQuestions] = useState([
    "What topics have I learned so far?",
    "Summarize my uploaded knowledge",
    "Which concepts should I review?",
    "How are my topics connected?",
  ]);

  // Fetch quick stats and build dynamic suggestions
  useEffect(() => {
    getKnowledgeGraph()
      .then((data) => {
        const nodes = data.nodes || [];
        setNodeCount(nodes.length);
        const totalConn = nodes.reduce((s, n) => s + (n.connections?.length || 0), 0);
        setConnectionCount(Math.floor(totalConn / 2));
        const avg = nodes.length > 0
          ? Math.round(nodes.reduce((s, n) => s + n.strength, 0) / nodes.length)
          : 0;
        setAvgStrength(avg);

        if (nodes.length > 0) {
          const labels = nodes.map((n) => n.label);
          const weak = [...nodes].sort((a, b) => a.strength - b.strength);
          const suggestions: string[] = [];
          suggestions.push(`What do I know about ${labels[0]}?`);
          if (labels.length > 1) suggestions.push(`Explain ${labels[1]} in detail`);
          if (weak.length > 0) suggestions.push(`Help me review ${weak[0].label}`);
          suggestions.push("How are my topics connected?");
          setSuggestedQuestions(suggestions);
        }
      })
      .catch(() => {});
  }, []);

  // Auto-scroll only when a NEW message is added or loading state changes (not on mount)
  const messageCount = useRef(messages.length);
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (messages.length > messageCount.current || isLoading) {
      scrollToBottom();
    }
    messageCount.current = messages.length;
  }, [messages.length, isLoading, scrollToBottom]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
    };

    setMessages(prev => [...prev, userMessage]);
    const question = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await askBrain(question);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response.answer,
        relatedConcepts: response.relatedConcepts,
        knowledgeNodes: response.knowledgeNodes,
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Unable to reach the backend. Please ensure the API server is running.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionClick = async (question: string) => {
    setInputValue(question);
    await handleSendMessage();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] md:h-[calc(100vh-6rem)] overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 mb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Ask Your Brain</h1>
        <p className="text-sm text-muted-foreground">Query your knowledge base with AI-powered answers</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 flex-1 min-h-0">
        {/* Chat Area */}
        <div className="lg:col-span-2 min-h-0 flex flex-col">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="soft-card overflow-hidden flex flex-col flex-1 min-h-0"
          >
            {/* Messages */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-4 md:p-6 space-y-4 scroll-smooth">
              <AnimatePresence mode="popLayout">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-xl p-4 ${
                        message.type === 'user'
                          ? 'bg-gradient-to-r from-primary to-accent text-white'
                          : 'bg-primary/10 border border-border text-foreground'
                      }`}
                    >
                      {message.type === 'ai' && (
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-4 h-4">
                            <LottieIcon name="brain" size={16} />
                          </div>
                          <span className="text-sm text-primary font-semibold">AI Assistant</span>
                        </div>
                      )}
                      {message.type === 'ai' ? (
                        <div className="text-sm leading-relaxed prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground prose-strong:text-foreground prose-code:text-primary prose-code:bg-primary/15 prose-code:px-1 prose-code:py-0.5 prose-code:rounded">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      )}
                      
                      {message.relatedConcepts && message.relatedConcepts.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                            <div className="w-3 h-3">
                              <LottieIcon name="link" size={12} />
                            </div>
                            Related Concepts
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {message.relatedConcepts.map((concept) => (
                              <span
                                key={concept}
                                className="px-2 py-1 bg-primary/15 text-primary rounded text-xs border border-primary/25"
                              >
                                {concept}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {message.knowledgeNodes && message.knowledgeNodes.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                            <div className="w-3 h-3">
                              <LottieIcon name="book" size={12} />
                            </div>
                            Knowledge Nodes Referenced
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {message.knowledgeNodes.map((node) => (
                              <span
                                key={node}
                                className="px-2 py-1 bg-accent/15 text-accent rounded text-xs border border-accent/25"
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
                {isLoading && (
                  <TypingIndicator key="typing" />
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-border p-3 md:p-4 flex-shrink-0">
              <div className="flex items-end gap-2 md:gap-3">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Ask about your knowledge..."
                  className="flex-1 bg-primary/5 border border-border rounded-lg p-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none transition-colors duration-200"
                  rows={2}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendMessage}
                  className="p-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg"
                >
                  <div className="w-5 h-5">
                    <LottieIcon name="arrowRight" size={20} />
                  </div>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Suggestions Panel */}
        <div className="hidden lg:flex flex-col space-y-4 min-h-0 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
            className="soft-card p-5"
          >
            <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <div className="w-5 h-5">
                <LottieIcon name="sparkles" size={20} />
              </div>
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
                  className="w-full text-left bg-primary/5 border border-border rounded-lg p-3 text-sm text-foreground hover:border-primary/40 transition-all"
                >
                  {question}
                </motion.button>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
            className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/25 rounded-xl p-5"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/15 rounded-lg flex-shrink-0">
                <div className="w-5 h-5">
                  <HelpCircle className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="text-foreground font-semibold mb-2">How it works</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>I search through your entire knowledge graph</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>I consider concept connections and relationships</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>I factor in your retention strength for each topic</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>I provide context-aware explanations</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.3 }}
            className="soft-card p-5"
          >
            <h2 className="text-lg font-semibold text-foreground mb-3">Quick Stats</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Knowledge Nodes</span>
                <span className="text-lg font-bold text-foreground">{nodeCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Connections</span>
                <span className="text-lg font-bold text-foreground">{connectionCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg. Strength</span>
                <span className="text-lg font-bold text-primary">{avgStrength}%</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
