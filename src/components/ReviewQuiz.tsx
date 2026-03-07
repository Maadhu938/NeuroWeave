import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, XCircle, Brain, ArrowRight, RotateCcw } from 'lucide-react';
import { getQuiz, submitReview, type QuizQuestion } from '@/lib/api';

interface ReviewQuizProps {
  concept: string;
  strength: number;
  onClose: () => void;
  onComplete?: (newStrength: number) => void;
}

export function ReviewQuiz({ concept, strength, onClose, onComplete }: ReviewQuizProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resultStrength, setResultStrength] = useState<number | null>(null);
  const [questionCount, setQuestionCount] = useState(5);
  const [started, setStarted] = useState(false);

  const startQuiz = () => {
    setStarted(true);
    setLoading(true);
    setCurrentQ(0);
    setSelected(null);
    setAnswered(false);
    setCorrectCount(0);
    setFinished(false);
    setResultStrength(null);
    getQuiz(concept, questionCount)
      .then((data) => setQuestions(data.questions))
      .catch(() => setQuestions([]))
      .finally(() => setLoading(false));
  };

  const question = questions[currentQ];
  const isCorrect = selected === question?.correctIndex;

  const handleSelect = (idx: number) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (idx === question.correctIndex) {
      setCorrectCount((c) => c + 1);
    }
  };

  const handleNext = () => {
    if (currentQ + 1 < questions.length) {
      setCurrentQ((q) => q + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    setFinished(true);
    setSubmitting(true);
    const score = questions.length > 0 ? correctCount / questions.length : 0;
    try {
      const result = await submitReview(concept, score);
      setResultStrength(result.newStrength);
      onComplete?.(result.newStrength);
    } catch {
      setResultStrength(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 30 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="bg-[#131824] border border-[rgba(79,140,255,0.3)] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-[rgba(79,140,255,0.15)]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[rgba(79,140,255,0.2)]">
                <Brain className="w-5 h-5 text-[#4F8CFF]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Review: {concept}</h3>
                <p className="text-xs text-[#8B92A8]">Current strength: {strength}%</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.1)] transition-colors">
              <X className="w-5 h-5 text-[#8B92A8]" />
            </button>
          </div>

          <div className="p-5">
            {/* Question Count Selection */}
            {!started && (
              <div className="space-y-5 py-4">
                <p className="text-sm text-[#8B92A8] text-center">Choose how many questions you'd like</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {[3, 5, 7, 10].map((n) => (
                    <button
                      key={n}
                      onClick={() => setQuestionCount(n)}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                        questionCount === n
                          ? 'bg-gradient-to-r from-[#4F8CFF] to-[#7A5CFF] text-white border-transparent'
                          : 'border-[rgba(79,140,255,0.3)] text-[#8B92A8] hover:border-[#4F8CFF] hover:text-white'
                      }`}
                    >
                      {n} Questions
                    </button>
                  ))}
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={startQuiz}
                  className="w-full py-3 bg-gradient-to-r from-[#4F8CFF] to-[#7A5CFF] text-white rounded-lg font-medium"
                >
                  Start Quiz
                </motion.button>
              </div>
            )}

            {/* Loading */}
            {started && loading && (
              <div className="flex flex-col items-center gap-3 py-12">
                <div className="w-10 h-10 border-3 border-[#4F8CFF] border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-[#8B92A8]">Generating quiz…</span>
              </div>
            )}

            {/* No questions */}
            {started && !loading && questions.length === 0 && (
              <div className="text-center py-12 text-[#8B92A8]">
                <p>Could not generate questions for this concept.</p>
                <button onClick={onClose} className="mt-4 px-4 py-2 bg-[rgba(79,140,255,0.2)] text-[#4F8CFF] rounded-lg text-sm">
                  Close
                </button>
              </div>
            )}

            {/* Quiz in progress */}
            {started && !loading && !finished && question && (
              <div className="space-y-5">
                {/* Progress */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[#4F8CFF] to-[#7A5CFF]"
                      animate={{ width: `${((currentQ + (answered ? 1 : 0)) / questions.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-[#8B92A8] whitespace-nowrap">
                    {currentQ + 1} / {questions.length}
                  </span>
                </div>

                {/* Question */}
                <p className="text-white text-base leading-relaxed">{question.question}</p>

                {/* Options */}
                <div className="space-y-2.5">
                  {question.options.map((opt, idx) => {
                    let borderColor = 'border-[rgba(79,140,255,0.2)]';
                    let bg = 'bg-[rgba(79,140,255,0.05)]';

                    if (answered) {
                      if (idx === question.correctIndex) {
                        borderColor = 'border-[#00FFA3]';
                        bg = 'bg-[rgba(0,255,163,0.1)]';
                      } else if (idx === selected) {
                        borderColor = 'border-[#FF4D6D]';
                        bg = 'bg-[rgba(255,77,109,0.1)]';
                      }
                    } else if (idx === selected) {
                      borderColor = 'border-[#4F8CFF]';
                      bg = 'bg-[rgba(79,140,255,0.15)]';
                    }

                    return (
                      <motion.button
                        key={idx}
                        whileHover={!answered ? { scale: 1.01, x: 4 } : {}}
                        whileTap={!answered ? { scale: 0.99 } : {}}
                        onClick={() => handleSelect(idx)}
                        disabled={answered}
                        className={`w-full text-left rounded-lg p-3.5 border ${borderColor} ${bg} transition-all flex items-center gap-3`}
                      >
                        <span className="w-7 h-7 rounded-full border border-[rgba(79,140,255,0.3)] flex items-center justify-center text-xs text-[#8B92A8] flex-shrink-0">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="text-sm text-[#E8EEF7]">{opt}</span>
                        {answered && idx === question.correctIndex && (
                          <CheckCircle className="w-5 h-5 text-[#00FFA3] ml-auto flex-shrink-0" />
                        )}
                        {answered && idx === selected && idx !== question.correctIndex && (
                          <XCircle className="w-5 h-5 text-[#FF4D6D] ml-auto flex-shrink-0" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Explanation */}
                {answered && question.explanation && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-lg border text-sm ${
                      isCorrect
                        ? 'bg-[rgba(0,255,163,0.05)] border-[rgba(0,255,163,0.2)] text-[#00FFA3]'
                        : 'bg-[rgba(255,77,109,0.05)] border-[rgba(255,77,109,0.2)] text-[#FF4D6D]'
                    }`}
                  >
                    <span className="font-semibold">{isCorrect ? 'Correct! ' : 'Incorrect. '}</span>
                    <span className="text-[#E8EEF7]">{question.explanation}</span>
                  </motion.div>
                )}

                {/* Next */}
                {answered && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleNext}
                    className="w-full py-3 bg-gradient-to-r from-[#4F8CFF] to-[#7A5CFF] text-white rounded-lg flex items-center justify-center gap-2"
                  >
                    {currentQ + 1 < questions.length ? (
                      <>Next Question <ArrowRight className="w-4 h-4" /></>
                    ) : (
                      <>Finish Review <CheckCircle className="w-4 h-4" /></>
                    )}
                  </motion.button>
                )}
              </div>
            )}

            {/* Results */}
            {finished && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-5 py-4"
              >
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[#4F8CFF] to-[#7A5CFF] flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">
                    {questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0}%
                  </span>
                </div>

                <div>
                  <h4 className="text-xl font-semibold text-white mb-1">Review Complete!</h4>
                  <p className="text-sm text-[#8B92A8]">
                    You got {correctCount} out of {questions.length} correct
                  </p>
                </div>

                {submitting ? (
                  <div className="flex items-center justify-center gap-2 text-sm text-[#8B92A8]">
                    <div className="w-4 h-4 border-2 border-[#4F8CFF] border-t-transparent rounded-full animate-spin" />
                    Updating strength…
                  </div>
                ) : resultStrength !== null ? (
                  <div className="bg-[rgba(0,255,163,0.1)] border border-[rgba(0,255,163,0.2)] rounded-lg p-4">
                    <p className="text-sm text-[#8B92A8] mb-1">Updated Memory Strength</p>
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-[#8B92A8] line-through">{strength}%</span>
                      <ArrowRight className="w-4 h-4 text-[#8B92A8]" />
                      <span className="text-2xl font-bold text-[#00FFA3]">{resultStrength}%</span>
                    </div>
                  </div>
                ) : null}

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setStarted(false);
                      setFinished(false);
                      setCurrentQ(0);
                      setSelected(null);
                      setAnswered(false);
                      setCorrectCount(0);
                      setQuestions([]);
                    }}
                    className="flex-1 py-3 border border-[rgba(79,140,255,0.3)] text-[#4F8CFF] rounded-lg flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" /> Retry
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className="flex-1 py-3 bg-gradient-to-r from-[#4F8CFF] to-[#7A5CFF] text-white rounded-lg"
                  >
                    Done
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
