import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, FileText, CheckCircle, Loader2, Brain, Link2, Clock } from 'lucide-react';
import { uploadKnowledge, uploadText, getRecentUploads, type UploadResult, type RecentUpload } from '@/lib/api';

interface UploadKnowledgeProps {
  onNavigate?: (page: string) => void;
}

export function UploadKnowledge({ onNavigate }: UploadKnowledgeProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [extractedConcepts, setExtractedConcepts] = useState<string[]>([]);
  const [relationshipsFound, setRelationshipsFound] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [textInput, setTextInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [recentUploads, setRecentUploads] = useState<RecentUpload[]>([]);

  const fetchRecentUploads = () => {
    getRecentUploads().then(setRecentUploads).catch(() => {});
  };

  useEffect(() => {
    fetchRecentUploads();
  }, []);

  const handleResult = (result: UploadResult) => {
    setExtractedConcepts(result.concepts);
    setRelationshipsFound(result.relationshipsFound);
    setIsUploading(false);
    setShowResults(true);
    fetchRecentUploads();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!['.pdf', '.txt', '.md', '.doc', '.docx'].includes(ext)) {
      setProcessingStage('Unsupported file type. Please upload PDF, DOC, DOCX, TXT, or MD files.');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setProcessingStage('File too large. Maximum size is 20MB.');
      return;
    }
    setIsUploading(true);
    setShowResults(false);
    setProcessingStage('Uploading document...');
    try {
      const result = await uploadKnowledge(file);
      handleResult(result);
    } catch {
      setProcessingStage('Upload failed. Please try again.');
      setIsUploading(false);
    }
  };

  const handleTextSubmit = async () => {
    if (!textInput.trim()) return;
    setIsUploading(true);
    setShowResults(false);
    setProcessingStage('Processing text...');
    try {
      const result = await uploadText(textInput);
      handleResult(result);
    } catch {
      setProcessingStage('Processing failed. Please try again.');
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Upload Knowledge</h1>
        <p className="text-sm text-[#8B92A8]">Import documents and extract knowledge concepts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Upload Area */}
        <div className="space-y-6">
          {/* PDF Upload */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="bg-[#131824] border border-[rgba(79,140,255,0.2)] rounded-xl p-4 md:p-6"
          >
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#4F8CFF]" />
              Upload PDF Document
            </h2>
            
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="border-2 border-dashed border-[rgba(79,140,255,0.3)] rounded-xl p-12 text-center cursor-pointer hover:border-[rgba(79,140,255,0.5)] transition-all bg-[rgba(79,140,255,0.02)]"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt,.md"
                className="hidden"
                onChange={handleFileSelect}
              />
              <Upload className="w-12 h-12 text-[#4F8CFF] mx-auto mb-4" />
              <p className="text-white mb-2">Click to upload or drag and drop</p>
              <p className="text-sm text-[#8B92A8]">PDF, DOC, DOCX, TXT, MD up to 20MB</p>
            </motion.div>
          </motion.div>

          {/* Text Input */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
            className="bg-[#131824] border border-[rgba(79,140,255,0.2)] rounded-xl p-4 md:p-6"
          >
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#7A5CFF]" />
              Direct Text Input
            </h2>
            
            <textarea
              placeholder="Paste your text content here..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="w-full h-40 bg-[rgba(79,140,255,0.05)] border border-[rgba(79,140,255,0.2)] rounded-lg p-4 text-white placeholder-[#8B92A8] focus:outline-none focus:border-[#4F8CFF] resize-none"
            />
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-4 w-full bg-gradient-to-r from-[#7A5CFF] to-[#4F8CFF] text-white py-3 rounded-lg flex items-center justify-center gap-2"
              onClick={handleTextSubmit}
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
                    Found {relationshipsFound} connections between new and existing concepts
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onNavigate?.('brain-map')}
                  className="w-full bg-gradient-to-r from-[#4F8CFF] to-[#7A5CFF] text-white py-3 rounded-lg flex items-center justify-center gap-2"
                >
                  <Brain className="w-5 h-5" />
                  <span>View in Knowledge Graph</span>
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
          {recentUploads.length === 0 ? (
            <p className="text-[#8B92A8] text-sm">No recent uploads. Upload a document to get started.</p>
          ) : (
            recentUploads.map((upload) => (
              <motion.div
                key={upload.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4 bg-[rgba(79,140,255,0.05)] border border-[rgba(79,140,255,0.15)] rounded-lg p-3 hover:border-[rgba(79,140,255,0.35)] transition-all"
              >
                <div className="p-2 bg-[rgba(79,140,255,0.15)] rounded-lg shrink-0">
                  <FileText className="w-5 h-5 text-[#4F8CFF]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {upload.filename || 'Text Input'}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-[#8B92A8] mt-0.5">
                    <span className="flex items-center gap-1">
                      <Brain className="w-3 h-3" />
                      {upload.conceptsExtracted} concepts
                    </span>
                    <span className="flex items-center gap-1">
                      <Link2 className="w-3 h-3" />
                      {upload.relationshipsFound} links
                    </span>
                  </div>
                </div>
                {upload.createdAt && (
                  <span className="text-xs text-[#8B92A8] shrink-0 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(upload.createdAt).toLocaleDateString()}
                  </span>
                )}
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}