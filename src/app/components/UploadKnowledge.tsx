import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, FileText, CheckCircle, Loader2, Brain, Link2 } from 'lucide-react';

export function UploadKnowledge() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState('');
  const [extractedConcepts, setExtractedConcepts] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleFileUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);
    setShowResults(false);

    // Simulate AI processing stages
    const stages = [
      'Uploading document...',
      'Extracting text content...',
      'Building knowledge graph...',
      'Calculating memory strength...',
      'Identifying relationships...',
      'Finalizing concepts...'
    ];

    let stageIndex = 0;
    
    // Simulate upload progress with AI processing stages
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const nextProgress = prev + 100 / stages.length;
        
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setShowResults(true);
          setExtractedConcepts([
            'Transformers Architecture',
            'Self-Attention Mechanism',
            'Multi-Head Attention',
            'Positional Encoding',
            'Feed-Forward Networks',
            'Layer Normalization',
            'Encoder-Decoder Structure',
            'BERT Pre-training',
          ]);
          return 100;
        }
        
        if (stageIndex < stages.length) {
          setProcessingStage(stages[stageIndex]);
          stageIndex++;
        }
        
        return nextProgress;
      });
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Upload Knowledge</h1>
        <p className="text-[#8B92A8]">Import documents and extract knowledge concepts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Area */}
        <div className="space-y-6">
          {/* PDF Upload */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#131824] border border-[rgba(79,140,255,0.2)] rounded-xl p-6"
          >
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#4F8CFF]" />
              Upload PDF Document
            </h2>
            
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="border-2 border-dashed border-[rgba(79,140,255,0.3)] rounded-xl p-12 text-center cursor-pointer hover:border-[rgba(79,140,255,0.5)] transition-all bg-[rgba(79,140,255,0.02)]"
              onClick={handleFileUpload}
            >
              <Upload className="w-12 h-12 text-[#4F8CFF] mx-auto mb-4" />
              <p className="text-white mb-2">Click to upload or drag and drop</p>
              <p className="text-sm text-[#8B92A8]">PDF, DOC, TXT up to 50MB</p>
            </motion.div>
          </motion.div>

          {/* Text Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#131824] border border-[rgba(79,140,255,0.2)] rounded-xl p-6"
          >
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#7A5CFF]" />
              Direct Text Input
            </h2>
            
            <textarea
              placeholder="Paste your text content here..."
              className="w-full h-40 bg-[rgba(79,140,255,0.05)] border border-[rgba(79,140,255,0.2)] rounded-lg p-4 text-white placeholder-[#8B92A8] focus:outline-none focus:border-[#4F8CFF] resize-none"
            />
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-4 w-full bg-gradient-to-r from-[#7A5CFF] to-[#4F8CFF] text-white py-3 rounded-lg flex items-center justify-center gap-2"
              onClick={handleFileUpload}
            >
              <Brain className="w-5 h-5" />
              <span>Process Text</span>
            </motion.button>
          </motion.div>
        </div>

        {/* Processing & Results */}
        <div>
          <AnimatePresence mode="wait">
            {isUploading ? (
              <motion.div
                key="uploading"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-[#131824] border border-[rgba(79,140,255,0.2)] rounded-xl p-6 h-full flex flex-col items-center justify-center"
              >
                <div className="relative mb-6">
                  <Loader2 className="w-16 h-16 text-[#4F8CFF] animate-spin" />
                  <div className="absolute inset-0 blur-xl bg-[#4F8CFF] opacity-50 animate-pulse" />
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-2">AI Processing</h3>
                <motion.p 
                  key={processingStage}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[#4F8CFF] mb-6 text-center font-medium"
                >
                  {processingStage}
                </motion.p>
                
                <div className="w-full max-w-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[#8B92A8]">Progress</span>
                    <span className="text-sm text-[#4F8CFF]">{Math.floor(uploadProgress)}%</span>
                  </div>
                  <div className="h-2 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[#4F8CFF] to-[#7A5CFF]"
                      style={{ width: `${uploadProgress}%` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            ) : showResults ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-[#131824] border border-[rgba(79,140,255,0.2)] rounded-xl p-6 space-y-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-[rgba(0,255,163,0.2)] rounded-lg">
                    <CheckCircle className="w-6 h-6 text-[#00FFA3]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Processing Complete</h3>
                    <p className="text-sm text-[#8B92A8]">Extracted {extractedConcepts.length} concepts</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-[#8B92A8] mb-3">Extracted Concepts</h4>
                  <div className="space-y-2">
                    {extractedConcepts.map((concept, index) => (
                      <motion.div
                        key={concept}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-3 bg-[rgba(79,140,255,0.05)] border border-[rgba(79,140,255,0.2)] rounded-lg p-3 hover:border-[rgba(79,140,255,0.4)] transition-all"
                      >
                        <Brain className="w-4 h-4 text-[#4F8CFF]" />
                        <span className="flex-1 text-white">{concept}</span>
                        <CheckCircle className="w-4 h-4 text-[#00FFA3]" />
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="bg-[rgba(79,140,255,0.1)] border border-[rgba(79,140,255,0.2)] rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-[#00E5FF]" />
                    Detected Relationships
                  </h4>
                  <p className="text-sm text-[#8B92A8]">
                    Found 12 connections between new and existing concepts
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-[#4F8CFF] to-[#7A5CFF] text-white py-3 rounded-lg flex items-center justify-center gap-2"
                >
                  <Brain className="w-5 h-5" />
                  <span>Add to Knowledge Graph</span>
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#131824] border border-[rgba(79,140,255,0.2)] rounded-xl p-6 h-full flex items-center justify-center"
              >
                <div className="text-center text-[#8B92A8]">
                  <Upload className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg mb-2">No document uploaded yet</p>
                  <p className="text-sm">Upload a document or paste text to begin extraction</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Recent Uploads */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[#131824] border border-[rgba(79,140,255,0.2)] rounded-xl p-6"
      >
        <h2 className="text-xl font-semibold text-white mb-4">Recent Uploads</h2>
        <div className="space-y-3">
          {[
            { name: 'Deep Learning Paper.pdf', date: '2 hours ago', concepts: 15 },
            { name: 'Attention Mechanisms.pdf', date: '1 day ago', concepts: 8 },
            { name: 'Neural Network Basics.txt', date: '3 days ago', concepts: 12 },
          ].map((upload, index) => (
            <motion.div
              key={upload.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="flex items-center justify-between bg-[rgba(79,140,255,0.05)] border border-[rgba(79,140,255,0.2)] rounded-lg p-4 hover:border-[rgba(79,140,255,0.4)] transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-[#4F8CFF]" />
                <div>
                  <p className="text-white">{upload.name}</p>
                  <p className="text-sm text-[#8B92A8]">{upload.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-[#4F8CFF]">{upload.concepts} concepts</p>
                <p className="text-xs text-[#8B92A8]">extracted</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}