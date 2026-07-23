import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LottieIcon } from '@/components/AnimatedIcons';
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
    } catch (err: any) {
      console.error('Upload error:', err);
      const msg = err instanceof Error ? err.message : 'Upload failed. Please try again.';
      setProcessingStage(`Error: ${msg}`);
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
    } catch (err: any) {
      console.error('Text process error:', err);
      const msg = err instanceof Error ? err.message : 'Processing failed. Please try again.';
      setProcessingStage(`Error: ${msg}`);
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Upload Knowledge</h1>
        <p className="text-sm text-muted-foreground">Import documents and extract knowledge concepts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Upload Area */}
        <div className="space-y-6">
          {/* PDF Upload */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="soft-card p-4 md:p-6"
          >
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <div className="w-5 h-5">
                <LottieIcon name="fileText" size={20} />
              </div>
              Upload PDF Document
            </h2>
            
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="border-2 border-dashed border-primary/25 rounded-xl p-12 text-center cursor-pointer hover:border-primary/50 transition-all bg-primary/5"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt,.md"
                className="hidden"
                onChange={handleFileSelect}
              />
              <div className="w-12 h-12 mx-auto mb-4">
                <LottieIcon name="upload" size={48} />
              </div>
              <p className="text-foreground mb-2">Click to upload or drag and drop</p>
              <p className="text-sm text-muted-foreground">PDF, DOC, DOCX, TXT, MD up to 20MB</p>
            </motion.div>
          </motion.div>

          {/* Text Input */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
            className="soft-card p-4 md:p-6"
          >
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <div className="w-5 h-5">
                <LottieIcon name="fileText" size={20} />
              </div>
              Direct Text Input
            </h2>
            
            <textarea
              placeholder="Paste your text content here..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="w-full h-40 bg-primary/5 border border-border rounded-lg p-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none"
            />
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-4 w-full bg-gradient-to-r from-accent to-primary text-white py-3 rounded-lg flex items-center justify-center gap-2"
              onClick={handleTextSubmit}
            >
              <div className="w-5 h-5">
                <LottieIcon name="brain" size={20} />
              </div>
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
                className="soft-card p-6 h-full flex flex-col items-center justify-center"
              >
                <div className="relative mb-6">
                  {processingStage.startsWith('Error') ? (
                    <div className="w-16 h-16">
                      <LottieIcon name="alert" size={64} />
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16">
                        <LottieIcon name="loading" size={64} />
                      </div>
                      <div className="absolute inset-0 blur-xl bg-primary opacity-50 animate-pulse" />
                    </>
                  )}
                </div>
                
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {processingStage.startsWith('Error') ? 'Upload Problem' : 'AI Processing'}
                </h3>
                <motion.p 
                  key={processingStage}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-6 text-center font-medium ${
                    processingStage.startsWith('Error') ? 'text-destructive' : 'text-primary'
                  }`}
                >
                  {processingStage}
                </motion.p>
                
                {processingStage.startsWith('Error') && (
                  <button 
                    onClick={() => {
                      setIsUploading(false);
                      setProcessingStage('');
                    }}
                    className="px-6 py-2 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-muted-foreground hover:text-foreground rounded-lg transition-all"
                  >
                    Try Another File
                  </button>
                )}
              </motion.div>
            ) : showResults ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="soft-card p-6 space-y-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-[rgba(0,255,163,0.2)] rounded-lg">
                    <div className="w-6 h-6">
                      <LottieIcon name="check" size={24} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">Processing Complete</h3>
                    <p className="text-sm text-muted-foreground">Extracted {extractedConcepts.length} concepts</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-3">Extracted Concepts</h4>
                  <div className="space-y-2">
                    {extractedConcepts.map((concept, index) => (
                      <motion.div
                        key={concept}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-3 bg-primary/5 border border-border rounded-lg p-3 hover:border-primary/40 transition-all"
                      >
                      <div className="w-4 h-4">
                        <LottieIcon name="brain" size={16} />
                      </div>
                        <span className="flex-1 text-foreground">{concept}</span>
                        <div className="w-4 h-4">
                          <LottieIcon name="check" size={16} />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="bg-primary/10 border border-border rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <div className="w-4 h-4">
                      <LottieIcon name="link" size={16} />
                    </div>
                    Detected Relationships
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Found {relationshipsFound} connections between new and existing concepts
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onNavigate?.('brain-map')}
                  className="w-full bg-gradient-to-r from-primary to-accent text-white py-3 rounded-lg flex items-center justify-center gap-2"
                >
                  <div className="w-5 h-5">
                    <LottieIcon name="brain" size={20} />
                  </div>
                  <span>View in Knowledge Graph</span>
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="soft-card p-6 h-full flex items-center justify-center"
              >
              <div className="text-center text-muted-foreground">
                  <div className="w-16 h-16 mx-auto mb-4 opacity-30">
                    <LottieIcon name="upload" size={64} />
                  </div>
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
        className="soft-card p-6"
      >
        <h2 className="text-xl font-semibold text-foreground mb-4">Recent Uploads</h2>
        <div className="space-y-3">
          {recentUploads.length === 0 ? (
            <p className="text-muted-foreground text-sm">No recent uploads. Upload a document to get started.</p>
          ) : (
            recentUploads.map((upload) => (
              <motion.div
                key={upload.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4 bg-primary/5 border border-border rounded-lg p-3 hover:border-primary/35 transition-all"
              >
                <div className="p-2 bg-primary/15 rounded-lg shrink-0">
                  <div className="w-5 h-5">
                    <LottieIcon name="fileText" size={20} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground text-sm font-medium truncate">
                    {upload.filename || 'Text Input'}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    <span className="flex items-center gap-1">
                      <div className="w-3 h-3">
                        <LottieIcon name="brain" size={12} />
                      </div>
                      {upload.conceptsExtracted} concepts
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-3 h-3">
                        <LottieIcon name="link" size={12} />
                      </div>
                      {upload.relationshipsFound} links
                    </span>
                  </div>
                </div>
                {upload.createdAt && (
                  <span className="text-xs text-muted-foreground shrink-0 flex items-center gap-1">
                    <div className="w-3 h-3">
                      <LottieIcon name="clock" size={12} />
                    </div>
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