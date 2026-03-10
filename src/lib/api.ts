import { auth } from '@/lib/firebase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.neuroweave.in';

const promiseCache = new Map<string, Promise<any>>();

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const isReadRequest = !options || !options.method || options.method === 'GET';
  const cacheKey = `${endpoint}:${JSON.stringify(options?.body || '')}`;

  // Deduplicate inflight GET requests
  if (isReadRequest && promiseCache.has(cacheKey)) {
    return promiseCache.get(cacheKey);
  }

  const fetchPromise = (async () => {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const token = await auth.currentUser?.getIdToken();
      const { headers: optHeaders, ...restOptions } = options || {};
      const isFormData = restOptions.body instanceof FormData;

      const response = await fetch(url, {
        ...restOptions,
        headers: {
          ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(optHeaders as Record<string, string> || {}),
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } finally {
      // Clear from cache once finished (whether success or error)
      if (isReadRequest) promiseCache.delete(cacheKey);
    }
  })();

  if (isReadRequest) {
    promiseCache.set(cacheKey, fetchPromise);
  }

  return fetchPromise;
}

// ── Dashboard ──────────────────────────────────────────────

export interface DashboardMetrics {
  knowledgeScore: number;
  retentionRate: number;
  conceptsMastered: number;
  studyStreakDays: number;
}

export interface RetentionDataPoint {
  date: string;
  retention: number;
}

export interface KnowledgeStrengthItem {
  subject: string;
  score: number;
}

export interface WeakArea {
  topic: string;
  strength: number;
  review: string;
}

export interface UpcomingReview {
  concept: string;
  time: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface DashboardData {
  metrics: DashboardMetrics;
  retentionData: RetentionDataPoint[];
  knowledgeStrength: KnowledgeStrengthItem[];
  weakAreas: WeakArea[];
  upcomingReviews: UpcomingReview[];
  aiInsight: string;
}

export function getDashboard(): Promise<DashboardData> {
  return request<DashboardData>('/api/dashboard');
}

// ── Insights ───────────────────────────────────────────────

export interface InsightItem {
  title: string;
  description: string;
  type: 'success' | 'warning' | 'info' | 'danger';
}

export interface SubjectRetention {
  subject: string;
  retention: number;
  color: string;
}

export interface InsightsData {
  insights: InsightItem[];
  knowledgeCoverage: { subject: string; score: number }[];
  learningPatterns: { time: string; effectiveness: number }[];
  subjectRetention: SubjectRetention[];
}

export function getInsights(): Promise<InsightsData> {
  return request<InsightsData>('/api/insights');
}

// ── Knowledge Graph (Brain Map) ────────────────────────────

export interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
  strength: number;
  connections: string[];
  category: string;
}

export interface KnowledgeGraphData {
  nodes: GraphNode[];
}

export function getKnowledgeGraph(): Promise<KnowledgeGraphData> {
  return request<KnowledgeGraphData>('/api/knowledge-graph');
}

export function deleteKnowledgeNode(label: string): Promise<{ success: boolean; deleted: string }> {
  return request<{ success: boolean; deleted: string }>(`/api/knowledge-graph/node/${encodeURIComponent(label)}`, {
    method: 'DELETE',
  });
}

// ── Upload Knowledge ───────────────────────────────────────

export interface UploadResult {
  concepts: string[];
  relationshipsFound: number;
}

export function uploadKnowledge(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);

  return request<UploadResult>('/api/upload', {
    method: 'POST',
    body: formData,
  });
}

export function uploadText(text: string): Promise<UploadResult> {
  return request<UploadResult>('/api/upload/text', {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
}

export interface RecentUpload {
  id: string;
  filename: string | null;
  sourceType: string;
  conceptsExtracted: number;
  relationshipsFound: number;
  createdAt: string | null;
}

export function getRecentUploads(): Promise<RecentUpload[]> {
  return request<RecentUpload[]>('/api/uploads/recent');
}

// ── Study Planner ──────────────────────────────────────────

export interface StudyRecommendation {
  concept: string;
  time: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  strength: number;
}

export interface WeekDay {
  day: string;
  sessions: number;
  completed: number;
  total: number;
}

export interface Milestone {
  title: string;
  progress: number;
  dueDate: string;
}

export interface StudyPlanData {
  recommendations: StudyRecommendation[];
  weekSchedule: WeekDay[];
  milestones: Milestone[];
  stats: {
    totalReviews: number;
    completed: number;
    timeSpent: string;
    avgScore: number;
  };
}

export function getStudyPlan(): Promise<StudyPlanData> {
  return request<StudyPlanData>('/api/study-plan');
}

// ── Ask Your Brain ─────────────────────────────────────────

export interface AskBrainResponse {
  answer: string;
  relatedConcepts: string[];
  knowledgeNodes: string[];
}

export function askBrain(question: string): Promise<AskBrainResponse> {
  return request<AskBrainResponse>('/api/ask', {
    method: 'POST',
    body: JSON.stringify({ question }),
  });
}

// ── Memory Heatmap ─────────────────────────────────────────

export interface TopicStrength {
  topic: string;
  strength: number;
  category: string;
}

export function getMemoryHeatmap(): Promise<TopicStrength[]> {
  return request<TopicStrength[]>('/api/memory/heatmap');
}

// ── Memory Decay ───────────────────────────────────────────

export interface DecayDataPoint {
  day: number;
  strength: number;
  reviewed: boolean;
}

export function getMemoryDecay(concept: string): Promise<DecayDataPoint[]> {
  return request<DecayDataPoint[]>(`/api/memory/decay?concept=${encodeURIComponent(concept)}`);
}

// ── AI Insight Cards ───────────────────────────────────────

export interface AIInsight {
  title: string;
  description: string;
  type: 'warning' | 'success' | 'info' | 'suggestion';
}

export function getAIInsights(): Promise<AIInsight[]> {
  return request<AIInsight[]>('/api/ai/insights');
}

// ── Top Bar Metrics ────────────────────────────────────────

export interface TopBarMetrics {
  knowledgeScore: string;
  retentionRate: string;
  studyStreak: string;
}

export function getTopBarMetrics(): Promise<TopBarMetrics> {
  return request<TopBarMetrics>('/api/metrics/topbar');
}

// ── Settings ───────────────────────────────────────────────

export function clearUserData(): Promise<{ status: string }> {
  return request<{ status: string }>('/api/user/data', { method: 'DELETE' });
}

// ── Review / Quiz ──────────────────────────────────────────

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizData {
  questions: QuizQuestion[];
  concept: string;
  strength: number;
}

export function getQuiz(concept: string, count: number = 5): Promise<QuizData> {
  return request<QuizData>('/api/review/quiz', {
    method: 'POST',
    body: JSON.stringify({ concept, count }),
  });
}

export interface ReviewResult {
  success: boolean;
  newStrength: number;
  reviewCount: number;
  quizScore: number;
}

export function submitReview(concept: string, score: number): Promise<ReviewResult> {
  return request<ReviewResult>('/api/review/submit', {
    method: 'POST',
    body: JSON.stringify({ concept, score }),
  });
}
