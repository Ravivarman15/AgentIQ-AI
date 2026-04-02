"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Database, BarChart3, Bot, FileText, Send, Loader2, Zap, Shield, Trash2, Sparkles, ChevronRight, ChevronDown, Activity, Cpu, Moon, Sun, Monitor, X, MessageSquare, Menu, LayoutGrid, Rows3, Columns3, AlertTriangle, Link2, Target, HardDrive, CheckCircle2, TrendingUp, Search, Hash, Type, Calendar, Book, Heart, Home as HomeIcon, GraduationCap, Users, Play } from "lucide-react";
import axios from "axios";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { useRouter } from "next/navigation";
import PredictionTab from "@/components/PredictionTab";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import DynamicChart from "@/components/DynamicChart";
import LandingSections from "@/components/LandingSections";

const API_BASE = "http://127.0.0.1:8000";

export default function Home() {
  const router = useRouter();
  // --- STATE ---
  const [file, setFile] = useState<File | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [status, setStatus] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [chatQuery, setChatQuery] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [isChatting, setIsChatting] = useState(false);
  const [activeTab, setActiveTab] = useState("eda");
  const [datasets, setDatasets] = useState<any>({ user_datasets: [], demo_datasets: [] });
  const [token, setToken] = useState<string | null>(null);
  const [selectedSubTab, setSelectedSubTab] = useState("training");

  // Sample Datasets
  const [sampleDatasets, setSampleDatasets] = useState<any[]>([]);
  const [loadingSample, setLoadingSample] = useState<string | null>(null);
  const [sampleBanner, setSampleBanner] = useState<string | null>(null);

  // UI State
  const [theme, setTheme] = useState<'default' | 'light' | 'midnight'>('default');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedInsight, setExpandedInsight] = useState<number | null>(null);

  // ML Prediction state
  const [predictionInput, setPredictionInput] = useState<any>({});
  const [predictionResult, setPredictionResult] = useState<any>(null);
  const [useAutoTarget, setUseAutoTarget] = useState(true);
  const [selectedTarget, setSelectedTarget] = useState<string>("");
  const [availableColumns, setAvailableColumns] = useState<any>(null);
  const [isPredicting, setIsPredicting] = useState(false);

  // Scroll ref for chat
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isChatting, isChatOpen]);

  // --- THEME ---
  useEffect(() => {
    document.body.className = '';
    if (theme === 'light') document.body.classList.add('theme-light');
    if (theme === 'midnight') document.body.classList.add('theme-midnight');
  }, [theme]);

  // --- DATA FETCHING ---
  useEffect(() => {
    const savedToken = localStorage.getItem("agentiq_token");
    setToken(savedToken);
    if (savedToken) {
      fetchDatasets(savedToken);
      fetchSampleDatasets();
    }
  }, []);

  const fetchSampleDatasets = async () => {
    try {
      const res = await axios.get(`${API_BASE}/sample-datasets`);
      setSampleDatasets(res.data);
    } catch (err) {
      console.error("Failed to fetch sample datasets", err);
    }
  };

  const sampleIconMap: Record<string, any> = {
    heart: Heart,
    "trending-up": TrendingUp,
    users: Users,
    home: HomeIcon,
    "graduation-cap": GraduationCap,
  };

  const sampleColorMap: Record<string, { text: string; bg: string; border: string; glow: string }> = {
    Healthcare: { text: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20", glow: "from-rose-600 to-pink-600" },
    Business: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", glow: "from-emerald-600 to-teal-600" },
    Marketing: { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", glow: "from-amber-600 to-orange-600" },
    "Real Estate": { text: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/20", glow: "from-sky-600 to-blue-600" },
    Education: { text: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20", glow: "from-violet-600 to-purple-600" },
  };

  const loadSampleDataset = async (datasetKey: string, datasetName: string) => {
    if (!token || loadingSample) return;
    setLoadingSample(datasetKey);
    setSampleBanner(null);
    resetState();
    setIsAnalyzing(true);
    try {
      const res = await axios.post(`${API_BASE}/load-sample/${datasetKey}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTaskId(res.data.task_id);
      setSampleBanner(`Sample dataset loaded successfully. You can now explore analysis, build models, or ask questions using the AI assistant.`);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to load sample dataset.");
      setIsAnalyzing(false);
    } finally {
      setLoadingSample(null);
    }
  };

  const fetchDatasets = async (authToken: string) => {
    try {
      const res = await axios.get(`${API_BASE}/datasets`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setDatasets(res.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        // Token expired or invalid — silently clear and redirect to login state
        localStorage.removeItem("agentiq_token");
        setToken(null);
      } else {
        console.error("Failed to fetch datasets", err);
      }
    }
  };

  const resetState = () => {
    setIsAnalyzing(false);
    setStatus(null);
    setChatHistory([]);
    setPredictionInput({});
    setPredictionResult(null);
    setAvailableColumns(null);
    setSelectedTarget("");
    setIsPredicting(false);
    setActiveTab("eda");
  };

  function getStepStatus(id: string): "waiting" | "running" | "completed" {
    if (!status || !status.completed_steps) return "waiting";
    if (status.completed_steps.includes(id)) return "completed";
    if (status.next_agent === `${id}_agent`) return "running";
    return "waiting";
  }

  // --- HANDLERS (No logic changes, just reorganization) ---
  const handleUpload = async () => {
    if (!file || !token) return;
    resetState();
    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(`${API_BASE}/upload`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTaskId(res.data.task_id);
      setSampleBanner(`Dataset uploaded successfully! Running analysis pipeline...`);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.detail || "Upload failed. Please check your connection.");
      setIsAnalyzing(false);
    }
  };

  const selectDemoDataset = async (dataset: any) => {
    try {
      resetState();
      setIsAnalyzing(true);
      const res = await axios.post(`${API_BASE}/resume/${dataset.id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTaskId(res.data.task_id);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteDataset = async (id: number) => {
    if (!token || !confirm("Are you sure you want to delete this dataset?")) return;
    try {
      await axios.delete(`${API_BASE}/datasets/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDatasets(token);
    } catch (err) {
      console.error("Failed to delete dataset", err);
    }
  };

  const handleChat = async (queryOverride?: string) => {
    const query = queryOverride || chatQuery;
    if (!query || !taskId) return;

    setIsChatting(true);
    if (!queryOverride) setChatQuery("");
    if (!isChatOpen) setIsChatOpen(true);

    // Add user message
    setChatHistory(prev => [...prev, { role: 'user', content: query }]);
    // Add empty assistant message that we'll stream into
    setChatHistory(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      const response = await fetch(`${API_BASE}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ task_id: taskId, query }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('No response body');

      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        // Keep incomplete last line in buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;

          const payload = trimmed.slice(6);
          if (payload === '[DONE]') continue;

          try {
            const parsed = JSON.parse(payload);
            if (parsed.token) {
              setChatHistory(prev => {
                const updated = [...prev];
                const lastMsg = updated[updated.length - 1];
                if (lastMsg && lastMsg.role === 'assistant') {
                  updated[updated.length - 1] = {
                    ...lastMsg,
                    content: lastMsg.content + parsed.token,
                  };
                }
                return updated;
              });
            }
          } catch {
            // Skip malformed JSON lines
          }
        }
      }
    } catch (err) {
      console.error(err);
      setChatHistory(prev => {
        const updated = [...prev];
        const lastMsg = updated[updated.length - 1];
        if (lastMsg && lastMsg.role === 'assistant' && !lastMsg.content) {
          updated[updated.length - 1] = {
            ...lastMsg,
            content: '⚠️ Connection interrupted. Please try again.',
          };
        }
        return updated;
      });
    } finally {
      setIsChatting(false);
    }
  };

  const fetchColumns = async () => {
    if (!taskId || !token) return;
    try {
      const res = await axios.get(`${API_BASE}/columns/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAvailableColumns(res.data);
      if (res.data.recommended_target) {
        setSelectedTarget(res.data.recommended_target);
      }
    } catch (err) {
      console.error("Failed to fetch columns", err);
    }
  };

  const handlePredict = async () => {
    if (!taskId || !token) return;
    setIsPredicting(true);
    setPredictionResult(null);

    try {
      const res = await axios.post(`${API_BASE}/predict`, {
        task_id: taskId,
        input_data: predictionInput,
        use_auto_target: useAutoTarget,
        target_column: useAutoTarget ? null : selectedTarget
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.error) {
        setPredictionResult({ error: res.data.error });
      } else {
        setPredictionResult(res.data);
      }
    } catch (err: any) {
      setPredictionResult({ error: err.response?.data?.detail || "Prediction failed" });
    } finally {
      setIsPredicting(false);
    }
  };

  // Effects
  useEffect(() => {
    if (activeTab === "predict" && taskId && !availableColumns) {
      fetchColumns();
    }
    if (activeTab === "ml" && selectedSubTab === "predict" && taskId && !availableColumns) {
      fetchColumns();
    }
  }, [activeTab, taskId, selectedSubTab]);

  useEffect(() => {
    let interval: any;
    if (taskId && isAnalyzing) {
      interval = setInterval(async () => {
        try {
          const res = await axios.get(`${API_BASE}/status/${taskId}`);
          setStatus(res.data);
          if (res.data.status === "completed") {
            setIsAnalyzing(false);
            clearInterval(interval);
          }
        } catch (err) {
          console.error(err);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [taskId, isAnalyzing]);


  // --- STEPS CONFIG (Refined for UI) ---
  const steps = [
    { id: "eda", name: "Data Intel", icon: Activity, desc: "Profiling & Stats" },
    { id: "ml", name: "AutoML Engine", icon: Cpu, desc: "Training & Models" },
    { id: "dashboard", name: "Visualizer", icon: Zap, desc: "Interactive Charts" },
    { id: "rag", name: "RAG Assistant", icon: Bot, desc: "AI Knowledge Base" },
    { id: "report", name: "Reporting", icon: FileText, desc: "Export Assets" },
  ];

  return (
    <main className="min-h-screen selection:bg-indigo-500/30 text-[var(--foreground)] transition-colors duration-500">

      {/* Background Ambience */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-[var(--accent-glow)] rounded-full blur-[120px] opacity-40 animate-pulse" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] bg-[var(--accent-glow)] rounded-full blur-[100px] opacity-30 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-[1800px] mx-auto p-4 md:p-6 lg:p-8 h-screen flex flex-col">

        {/* --- HEADER --- */}
        <header className="flex justify-between items-center mb-6 glass-card px-6 py-4 z-50 shrink-0">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => setActiveTab('eda')}>
            <div className="relative w-10 h-10 flex items-center justify-center rounded-xl border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.3)] group-hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all duration-300">
              <img src="/logo.png" alt="AgentIQ Logo" className="w-8 h-8 object-contain group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight gradient-text">AGENTIQ AI</h1>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            {/* Theme Toggle */}
            <div className="hidden md:flex p-1 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-full">
              <button onClick={() => setTheme('light')} className={`p-2 rounded-full transition-all ${theme === 'light' ? 'bg-white text-yellow-500 shadow-sm' : 'text-gray-400 hover:text-white'}`}>
                <Sun className="w-4 h-4" />
              </button>
              <button onClick={() => setTheme('default')} className={`p-2 rounded-full transition-all ${theme === 'default' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}>
                <Sparkles className="w-4 h-4" />
              </button>
              <button onClick={() => setTheme('midnight')} className={`p-2 rounded-full transition-all ${theme === 'midnight' ? 'bg-black text-blue-400 shadow-sm' : 'text-gray-400 hover:text-white'}`}>
                <Moon className="w-4 h-4" />
              </button>
            </div>

            <Link
              href="/docs"
              className="hidden md:flex items-center gap-2 px-5 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all font-medium text-sm"
            >
              <Book className="w-4 h-4" />
              <span>User Guide</span>
            </Link>

            {token && (
              <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--card-border)] transition-all ${isChatOpen ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-[var(--card-bg)] hover:bg-[var(--card-border)]'}`}
              >
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm font-medium">Assistant</span>
              </button>
            )}

            {token ? (
              <div className="flex items-center gap-3">
                <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                  <Menu className="w-6 h-6" />
                </button>
                <div className="hidden md:block h-8 w-[1px] bg-[var(--card-border)]" />
                <button
                  onClick={() => {
                    const confirmed = confirm("Are you sure you want to disconnect? This will clear your current session.");
                    if (confirmed) {
                      localStorage.removeItem("agentiq_token");
                      window.location.reload();
                    }
                  }}
                  className="hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all group"
                  title="Disconnect Session"
                >
                  <X className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                </button>
              </div>
            ) : (
              <Link href="/login" className="px-6 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg shadow-blue-500/25 transition-all text-sm">
                Login
              </Link>
            )}
          </div>
        </header>

        {/* --- MOBILE MENU --- */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-20 right-4 left-4 z-50 glass-panel p-6 rounded-2xl border border-[var(--card-border)] md:hidden shadow-2xl origin-top"
            >
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Theme Settings</span>
                  <div className="flex gap-3">
                    <button onClick={() => setTheme('light')} className={`p-3 rounded-xl ${theme === 'light' ? 'bg-white text-yellow-500 shadow-lg' : 'bg-[var(--foreground)]/5 text-[var(--text-muted)]'}`}><Sun className="w-5 h-5" /></button>
                    <button onClick={() => setTheme('default')} className={`p-3 rounded-xl ${theme === 'default' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-[var(--foreground)]/5 text-[var(--text-muted)]'}`}><Sparkles className="w-5 h-5" /></button>
                    <button onClick={() => setTheme('midnight')} className={`p-3 rounded-xl ${theme === 'midnight' ? 'bg-black text-blue-400 shadow-lg shadow-blue-500/30' : 'bg-[var(--foreground)]/5 text-[var(--text-muted)]'}`}><Moon className="w-5 h-5" /></button>
                  </div>
                </div>

                <div className="h-[1px] bg-[var(--card-border)]" />

                <Link
                  href="/docs"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold"
                >
                  <div className="flex items-center gap-3">
                    <Book className="w-5 h-5" />
                    <span>User Documentation</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </Link>

                <button
                  onClick={() => { localStorage.removeItem("agentiq_token"); window.location.reload(); }}
                  className="w-full py-4 bg-red-500/10 text-red-500 rounded-xl font-bold text-sm hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" /> Disconnect Session
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- MAIN LAYOUT --- */}
        <AnimatePresence mode="wait">
          {!taskId ? (
            /* LANDING STATE */
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="flex-1 flex flex-col items-center text-center max-w-7xl mx-auto w-full pb-0 pt-12 overflow-y-auto scrollbar-premium"
            >
              <div className="mb-8 relative group">
                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-3xl animate-pulse group-hover:bg-purple-500/20 transition-colors duration-1000" />
                <Bot className="w-24 h-24 text-[var(--foreground)] relative z-10 drop-shadow-2xl opacity-90" style={{ animation: 'float 6s ease-in-out infinite' }} />
              </div>

              <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight">
                Data Science on <br />
                <span className="gradient-text">Auto-Pilot</span>
              </h1>

              <p className="text-lg md:text-xl text-[var(--text-muted)] max-w-2xl mb-12 leading-relaxed">
                Upload raw CSV data. Our autonomous swarm builds models, visualizes insights, and creates predictive APIs in seconds.
              </p>

              <div className="glass-card w-full max-w-xl p-1 relative  group hover:scale-[1.005] transition-transform duration-500">
                <div className="bg-[var(--glass-panel)] rounded-2xl p-8 md:p-12 border border-white/5 relative z-10">
                  {!token ? (
                    <div className="text-center py-6">
                      <Link href="/login" className="inline-flex items-center gap-2 px-8 py-3 bg-white text-black rounded-lg font-bold hover:bg-gray-200 transition-all shadow-xl">
                        Start Session <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-8">
                      {/* Section Heading */}
                      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 text-left">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                              <Upload className="w-4 h-4 text-blue-400" />
                            </div>
                            <h2 className="text-2xl font-bold">Upload Your Dataset</h2>
                          </div>
                          <p className="text-sm text-[var(--text-muted)]">Supported formats: <span className="text-[var(--foreground)] font-medium">CSV, Excel, JSON</span></p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/5 border border-blue-500/10">
                          <Shield className="w-3.5 h-3.5 text-blue-400" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Secure Processing</span>
                        </div>
                      </div>

                      <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                      />
                      {!file ? (
                        <label htmlFor="file-upload" className="w-full border-2 border-dashed border-[var(--card-border)] rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group/upload relative overflow-hidden">
                          <div className="absolute inset-0 bg-blue-500/0 group-hover/upload:bg-blue-500/5 transition-colors" />
                          <div className="w-14 h-14 rounded-xl bg-[var(--card-bg)] flex items-center justify-center mb-4 group-hover/upload:scale-110 transition-transform shadow-xl relative z-10">
                            <Upload className="w-6 h-6 text-blue-500" />
                          </div>
                          <p className="font-semibold text-lg mb-1 relative z-10 text-[var(--foreground)]">Drag & drop your CSV file here</p>
                          <p className="text-sm text-[var(--text-muted)] relative z-10 mb-8">or click to browse from your device</p>

                          <div className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 group-hover/upload:bg-blue-500 transition-colors relative z-10">
                            Select File
                          </div>
                        </label>
                      ) : (
                        <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                          <div className="flex items-center justify-between p-5 bg-[var(--card-bg)] rounded-2xl mb-8 border border-[var(--card-border)] shadow-sm">
                            <div className="flex items-center gap-4 overflow-hidden">
                              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                                <FileText className="w-6 h-6 text-green-400" />
                              </div>
                              <div className="text-left min-w-0">
                                <p className="font-bold text-lg truncate">{file.name}</p>
                                <p className="text-xs text-[var(--text-muted)]">{(file.size / 1024 / 1024).toFixed(2)} MB • Ready for analysis</p>
                              </div>
                            </div>
                            <button onClick={() => setFile(null)} className="p-3 hover:bg-red-500/10 rounded-xl transition-colors group/trash">
                              <Trash2 className="w-5 h-5 text-[var(--text-muted)] group-hover/trash:text-red-400" />
                            </button>
                          </div>

                          <button
                            onClick={handleUpload}
                            disabled={isAnalyzing}
                            className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl font-bold text-lg text-white shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-[1.01] transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-3"
                          >
                            {isAnalyzing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6 fill-current" />}
                            <span>{isAnalyzing ? "Processing Dataset..." : "Launch AI Analysis"}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* ═══ YOUR DATASETS SECTION ═══ */}
              {token && datasets.user_datasets?.length > 0 && (
                <div className="mt-14 w-full max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                        <Database className="w-4 h-4 text-indigo-400" />
                      </div>
                      <h2 className="text-xl font-bold">Your Datasets</h2>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] px-3 py-1 rounded-full bg-[var(--card-bg)] border border-[var(--card-border)]">
                      {datasets.user_datasets.length} Files Saved
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {datasets.user_datasets.map((ds: any, idx: number) => (
                      <motion.div
                        key={ds.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="group relative p-5 rounded-2xl bg-[var(--glass-panel)] border border-[var(--card-border)] hover:border-indigo-500/30 transition-all"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-10 h-10 rounded-xl bg-[var(--card-bg)] flex items-center justify-center border border-[var(--card-border)] group-hover:scale-110 transition-transform">
                            <FileText className="w-5 h-5 text-indigo-400" />
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => deleteDataset(ds.id)}
                              className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 rounded-lg transition-all text-red-400"
                              title="Delete Dataset"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <h3 className="font-bold text-sm mb-1 truncate pr-8">{ds.name}</h3>
                        <p className="text-[10px] text-[var(--text-muted)] mb-5">
                          {ds.file_size ? `${(ds.file_size / 1024 / 1024).toFixed(2)} MB • ` : ""}Last modified: {new Date(ds.created_at || Date.now()).toLocaleDateString()}
                        </p>

                        <button
                          onClick={() => selectDemoDataset(ds)}
                          className="w-full py-2 bg-[var(--foreground)]/5 hover:bg-indigo-600 hover:text-white border border-[var(--card-border)] rounded-xl text-xs font-bold transition-all"
                        >
                          Load Analysis
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* ═══ VISUAL SEPARATOR ═══ */}
              <div className="mt-16 mb-2 w-full max-w-2xl flex items-center gap-4">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[var(--card-border)] to-[var(--card-border)]" />
                <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] whitespace-nowrap opacity-60">or try one of our sample datasets</span>
                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[var(--card-border)] to-[var(--card-border)]" />
              </div>

              {/* ═══ SAMPLE DATASETS SECTION ═══ */}
              {token && sampleDatasets.length > 0 && (
                <div className="mt-14 w-full max-w-5xl">

                  {/* Success Banner */}
                  <AnimatePresence>
                    {sampleBanner && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-3"
                      >
                        <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                        <p className="text-sm text-green-300 font-medium">{sampleBanner}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Dataset Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sampleDatasets.map((ds: any, idx: number) => {
                      const IconComponent = sampleIconMap[ds.icon] || Database;
                      const colors = sampleColorMap[ds.category] || { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", glow: "from-blue-600 to-indigo-600" };
                      const isLoading = loadingSample === ds.key;

                      return (
                        <motion.div
                          key={ds.key}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.08 }}
                          className={`group relative rounded-2xl bg-[var(--glass-panel)] border ${colors.border} hover:border-opacity-60 transition-all duration-300 hover:shadow-lg hover:shadow-[var(--foreground)]/5 overflow-hidden`}
                        >
                          {/* Top Gradient Accent */}
                          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.glow} opacity-60 group-hover:opacity-100 transition-opacity`} />

                          <div className="p-5">
                            {/* Icon + Category */}
                            <div className="flex items-start justify-between mb-4">
                              <div className={`w-11 h-11 rounded-xl ${colors.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                <IconComponent className={`w-5 h-5 ${colors.text}`} />
                              </div>
                              <span className={`text-[10px] font-bold uppercase tracking-widest ${colors.text} px-2.5 py-1 rounded-full ${colors.bg}`}>
                                {ds.category}
                              </span>
                            </div>

                            {/* Title + Description */}
                            <h3 className="font-bold text-sm mb-1.5 text-[var(--foreground)]">{ds.name}</h3>
                            <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-4">{ds.description}</p>

                            {/* Row/Column Badges */}
                            <div className="flex items-center gap-3 mb-5">
                              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--foreground)]/5 border border-[var(--card-border)]">
                                <Rows3 className="w-3 h-3 text-[var(--text-muted)]" />
                                <span className="text-[10px] font-bold">{ds.rows.toLocaleString()}</span>
                                <span className="text-[10px] text-[var(--text-muted)]">rows</span>
                              </div>
                              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--foreground)]/5 border border-[var(--card-border)]">
                                <Columns3 className="w-3 h-3 text-[var(--text-muted)]" />
                                <span className="text-[10px] font-bold">{ds.columns}</span>
                                <span className="text-[10px] text-[var(--text-muted)]">cols</span>
                              </div>
                            </div>

                            {/* Load Button */}
                            <button
                              onClick={() => loadSampleDataset(ds.key, ds.name)}
                              disabled={!!loadingSample}
                              className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${isLoading
                                ? 'bg-[var(--foreground)]/10 text-[var(--text-muted)] cursor-wait'
                                : `bg-gradient-to-r ${colors.glow} text-white shadow-md hover:shadow-lg active:scale-[0.98]`
                                } disabled:opacity-60`}
                            >
                              {isLoading ? (
                                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading...</>
                              ) : (
                                <><Play className="w-3.5 h-3.5 fill-current" /> Load Dataset</>
                              )}
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Legacy Demo Datasets (DB-seeded) */}
              {token && datasets.demo_datasets?.length > 0 && (
                <div className="mt-8 w-full max-w-2xl">
                  <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-widest mb-4">Or try a demo dataset</p>
                  <div className="flex flex-wrap justify-center gap-3">
                    {datasets.demo_datasets.map((ds: any) => (
                      <button
                        key={ds.id}
                        onClick={() => selectDemoDataset(ds)}
                        className="px-4 py-2 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-blue-500/30 hover:bg-[var(--card-border)] transition-all text-sm font-medium flex items-center gap-2"
                      >
                        <Database className="w-3.5 h-3.5 text-blue-400" />
                        {ds.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ═══ LANDING PAGE SECTIONS (Features, Workflow, Preview, Badges, Footer) ═══ */}
              <LandingSections />
            </motion.div>
          ) : (
            /* ACTIVE WORKSPACE */
            <motion.div
              key="workspace"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col lg:flex-row gap-6 lg:h-[calc(100vh-140px)] min-h-0"
            >
              {/* SIDEBAR NAVIGATION */}
              <div className="hidden lg:flex lg:w-64 xl:w-72 flex-col gap-4 shrink-0">
                {/* ID Card */}
                <div className="glass-card p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg text-lg">
                    AI
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-bold text-sm tracking-wide">Mission Control</h2>
                    <p className="text-xs text-[var(--text-muted)] truncate">Task: {taskId.substring(0, 8)}</p>
                  </div>
                </div>

                {/* Navigation Steps */}
                <nav className="glass-card p-2 flex flex-col gap-1 overflow-y-auto">
                  {steps.map((step) => {
                    const statusState = getStepStatus(step.id);
                    const isActive = activeTab === step.id;

                    // Handle RAG click specifically for chat toggle if needed
                    // But here we'll use it as a button that sets 'rag' tab OR opens chat
                    const isRag = step.id === 'rag';

                    return (
                      <button
                        key={step.id}
                        onClick={() => {
                          if (isRag) {
                            setIsChatOpen(true);
                          } else if (step.id === 'docs') {
                            window.location.href = '/docs';
                          } else {
                            setActiveTab(step.id);
                          }
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all group ${isActive && !isRag
                          ? 'bg-[var(--foreground)]/10 text-[var(--foreground)] shadow-sm font-semibold'
                          : 'text-[var(--text-muted)] hover:bg-[var(--foreground)]/5 hover:text-[var(--foreground)]'
                          }`}
                      >
                        <step.icon className={`w-5 h-5 ${isActive ? 'text-blue-500' : 'opacity-70 group-hover:opacity-100'}`} />
                        <div className="flex-1">
                          <span className="block text-sm">{step.name}</span>
                          <span className="block text-[10px] opacity-60 font-normal">{step.desc}</span>
                        </div>

                        {statusState === 'completed' && <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />}
                        {statusState === 'running' && <Loader2 className="w-3 h-3 animate-spin text-blue-500" />}
                      </button>
                    );
                  })}
                </nav>

                {/* Small Status Log */}
                <div className="glass-card p-4 flex-1 flex flex-col min-h-[200px] overflow-hidden">
                  <h3 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Activity className="w-3 h-3" />
                    Live Telemetry
                  </h3>
                  <div className="space-y-2 overflow-y-auto flex-1 scrollbar-premium pr-2">
                    {status?.logs?.slice().reverse().map((log: any, i: number) => (
                      <div key={i} className="text-[10px] font-mono p-2 rounded-lg bg-[var(--foreground)]/5 border border-[var(--card-border)]">
                        <span className="text-blue-500 font-bold mr-1">[{log.agent.toUpperCase()}]</span>
                        <span className="opacity-70">{log.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* MAIN CONTENT AREA */}
              <div className="flex-1 glass-card p-6 md:p-8 relative overflow-hidden flex flex-col pb-24 lg:pb-8">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-b from-blue-500/5 to-transparent rounded-full blur-3xl -z-10 pointer-events-none" />

                <div className="flex-1 overflow-y-auto scrollbar-premium pr-2">
                  {activeTab === "eda" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-6">
                        <div>
                          <h2 className="text-3xl font-bold mb-1">Data Intelligence</h2>
                          <p className="text-[var(--text-muted)]">Real-time profiling and statistical analysis</p>
                        </div>
                        <div className="flex items-center gap-3">
                          {status?.industry && (
                            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs font-bold uppercase tracking-widest">
                              <Database className="w-3 h-3" />
                              {status.industry}
                            </span>
                          )}
                        </div>
                      </div>

                      {status?.data_profile ? (
                        <>
                          {/* ═══ STATS OVERVIEW ROW ═══ */}
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                            {[
                              { label: 'Total Rows', value: status.data_profile.total_rows?.toLocaleString(), icon: Rows3, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                              { label: 'Total Columns', value: status.data_profile.total_columns, icon: Columns3, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                              { label: 'Completeness', value: `${(100 - (status.data_profile.missing_percentage || 0)).toFixed(1)}%`, icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10' },
                              { label: 'Missing Cells', value: status.data_profile.missing_cells?.toLocaleString() || '0', icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                              { label: 'Duplicates', value: status.data_profile.duplicate_rows?.toLocaleString() || '0', icon: Search, color: 'text-red-400', bg: 'bg-red-500/10' },
                              { label: 'Memory', value: `${status.data_profile.memory_usage_mb || 0} MB`, icon: HardDrive, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                            ].map((stat, i) => (
                              <div key={i} className="p-4 rounded-xl bg-[var(--foreground)]/5 border border-[var(--card-border)] hover:border-blue-500/20 transition-all">
                                <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center mb-2`}>
                                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                                </div>
                                <p className="text-xl font-bold">{stat.value}</p>
                                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-bold mt-1">{stat.label}</p>
                              </div>
                            ))}
                          </div>

                          {/* ═══ HEALTH SCORE + FEATURE DISTRIBUTION ═══ */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Data Health Score */}
                            {status.data_health_score != null && (
                              <div className="p-6 rounded-xl bg-[var(--foreground)]/5 border border-[var(--card-border)]">
                                <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4 flex items-center gap-2">
                                  <Shield className="w-3.5 h-3.5" /> Data Health Score
                                </h3>
                                <div className="flex items-center gap-6">
                                  <div className="relative w-24 h-24 shrink-0">
                                    <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                                      <circle cx="50" cy="50" r="42" fill="none" stroke="var(--card-border)" strokeWidth="8" />
                                      <circle cx="50" cy="50" r="42" fill="none"
                                        stroke={status.data_health_score >= 80 ? '#22c55e' : status.data_health_score >= 60 ? '#f59e0b' : '#ef4444'}
                                        strokeWidth="8" strokeLinecap="round"
                                        strokeDasharray={`${status.data_health_score * 2.64} 264`}
                                      />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <span className="text-2xl font-bold">{status.data_health_score}</span>
                                    </div>
                                  </div>
                                  <div className="flex-1 space-y-2">
                                    {status.data_health_breakdown && Object.entries(status.data_health_breakdown).map(([key, val]: [string, any]) => (
                                      <div key={key}>
                                        <div className="flex justify-between text-[10px] mb-0.5">
                                          <span className="uppercase tracking-wider opacity-60 font-bold">{key.replace('_', ' ')}</span>
                                          <span className="font-bold">{val.score}/{val.max}</span>
                                        </div>
                                        <div className="h-1.5 bg-[var(--foreground)]/10 rounded-full overflow-hidden">
                                          <div className="h-full rounded-full transition-all" style={{ width: `${(val.score / val.max) * 100}%`, background: (val.score / val.max) >= 0.7 ? '#22c55e' : (val.score / val.max) >= 0.4 ? '#f59e0b' : '#ef4444' }} />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Feature Distribution */}
                            <div className="p-6 rounded-xl bg-[var(--foreground)]/5 border border-[var(--card-border)]">
                              <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4 flex items-center gap-2">
                                <BarChart3 className="w-3.5 h-3.5" /> Feature Distribution
                              </h3>
                              <div className="space-y-4">
                                {[
                                  { label: 'Numeric', count: status.data_profile.numeric_columns || 0, icon: Hash, color: '#3b82f6' },
                                  { label: 'Categorical', count: status.data_profile.categorical_columns || 0, icon: Type, color: '#8b5cf6' },
                                  { label: 'DateTime', count: status.data_profile.datetime_columns || 0, icon: Calendar, color: '#10b981' },
                                ].map((feat, i) => {
                                  const total = status.data_profile.total_columns || 1;
                                  const pct = ((feat.count / total) * 100);
                                  return (
                                    <div key={i}>
                                      <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                          <feat.icon className="w-3.5 h-3.5" style={{ color: feat.color }} />
                                          <span className="text-xs font-semibold">{feat.label}</span>
                                        </div>
                                        <span className="text-xs font-bold">{feat.count} <span className="opacity-50">({pct.toFixed(0)}%)</span></span>
                                      </div>
                                      <div className="h-2 bg-[var(--foreground)]/10 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: i * 0.1 }} className="h-full rounded-full" style={{ background: feat.color }} />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Target Detection */}
                              {status.statistical_summary?.target_analysis && (
                                <div className="mt-4 pt-4 border-t border-[var(--card-border)]">
                                  <div className="flex items-center gap-2 text-xs">
                                    <Target className="w-3.5 h-3.5 text-red-400" />
                                    <span className="font-bold">Target Detected:</span>
                                    <span className="px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 font-mono text-[11px]">{status.statistical_summary.target_analysis.column}</span>
                                    <span className="opacity-50">({status.statistical_summary.target_analysis.unique_values} classes)</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* ═══ TOP CORRELATIONS + OUTLIERS ═══ */}
                          {(status.statistical_summary?.top_correlations || status.statistical_summary?.outliers) && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              {/* Top Correlations */}
                              {status.statistical_summary?.top_correlations?.length > 0 && (
                                <div className="p-5 rounded-xl bg-[var(--foreground)]/5 border border-[var(--card-border)]">
                                  <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Link2 className="w-3.5 h-3.5" /> Top Correlations
                                  </h3>
                                  <div className="space-y-2">
                                    {status.statistical_summary.top_correlations.slice(0, 5).map((corr: any, i: number) => (
                                      <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 transition-colors">
                                        <span className="text-xs font-medium">
                                          <span className="font-bold">{corr.feature1}</span>
                                          <span className="opacity-40 mx-2">↔</span>
                                          <span className="font-bold">{corr.feature2}</span>
                                        </span>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${Math.abs(corr.correlation) > 0.7 ? 'bg-green-500/10 text-green-400' : Math.abs(corr.correlation) > 0.4 ? 'bg-amber-500/10 text-amber-400' : 'bg-[var(--foreground)]/10 opacity-70'}`}>
                                          r = {corr.correlation}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Outlier Summary */}
                              {status.statistical_summary?.outliers && Object.keys(status.statistical_summary.outliers).length > 0 && (
                                <div className="p-5 rounded-xl bg-[var(--foreground)]/5 border border-[var(--card-border)]">
                                  <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <AlertTriangle className="w-3.5 h-3.5" /> Outlier Detection
                                  </h3>
                                  <div className="space-y-2">
                                    {Object.entries(status.statistical_summary.outliers).slice(0, 5).map(([col, info]: [string, any], i: number) => (
                                      <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--foreground)]/5">
                                        <span className="text-xs font-bold">{col}</span>
                                        <div className="flex items-center gap-3">
                                          <span className="text-xs opacity-60">{info.count} outliers</span>
                                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${info.percentage > 10 ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                            {info.percentage}%
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* ═══ SMART INSIGHTS ═══ */}
                          {status.eda_insights && status.eda_insights.length > 0 && (
                            <div>
                              <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Sparkles className="w-3.5 h-3.5" /> Smart Insights
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {status.eda_insights.map((insight: string, i: number) => {
                                  const insightIcon = insight.toLowerCase().includes('correlation') ? Link2
                                    : insight.toLowerCase().includes('target') ? Target
                                      : insight.toLowerCase().includes('outlier') ? AlertTriangle
                                        : insight.toLowerCase().includes('numeric') ? Hash
                                          : insight.toLowerCase().includes('categorical') ? Type
                                            : insight.toLowerCase().includes('duplicate') ? Search
                                              : insight.toLowerCase().includes('classification') || insight.toLowerCase().includes('regression') ? TrendingUp
                                                : insight.toLowerCase().includes('domain') || insight.toLowerCase().includes('industry') ? Database
                                                  : Activity;
                                  const InsightIcon = insightIcon;
                                  return (
                                    <button
                                      key={i}
                                      onClick={() => setExpandedInsight(expandedInsight === i ? null : i)}
                                      className={`p-4 rounded-xl bg-[var(--foreground)]/5 border border-[var(--card-border)] hover:border-blue-500/30 transition-all text-left group ${expandedInsight === i ? 'border-blue-500/30 bg-blue-500/5' : ''}`}
                                    >
                                      <div className="flex items-start gap-3">
                                        <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                          <InsightIcon className="w-3.5 h-3.5 text-blue-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm leading-relaxed opacity-90">{insight}</p>
                                        </div>
                                        <ChevronDown className={`w-4 h-4 opacity-30 shrink-0 transition-transform ${expandedInsight === i ? 'rotate-180' : ''}`} />
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* ═══ QUICK ACTION BUTTONS ═══ */}
                          <div className="flex flex-wrap gap-3">
                            <button onClick={() => setActiveTab('dashboard')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--foreground)]/5 border border-[var(--card-border)] hover:border-blue-500/30 hover:bg-blue-500/5 transition-all text-xs font-bold">
                              <BarChart3 className="w-3.5 h-3.5 text-blue-400" /> View Correlation Matrix
                            </button>
                            <button onClick={() => { setActiveTab('ml'); setSelectedSubTab('training'); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--foreground)]/5 border border-[var(--card-border)] hover:border-purple-500/30 hover:bg-purple-500/5 transition-all text-xs font-bold">
                              <Cpu className="w-3.5 h-3.5 text-purple-400" /> Start Model Training
                            </button>
                            <button onClick={() => setIsChatOpen(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--foreground)]/5 border border-[var(--card-border)] hover:border-green-500/30 hover:bg-green-500/5 transition-all text-xs font-bold">
                              <Bot className="w-3.5 h-3.5 text-green-400" /> Ask AI Assistant
                            </button>
                          </div>

                          {/* ═══ CHARTS ═══ */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {status.eda_charts?.slice(0, 2).map((chart: any, i: number) => (
                              <div key={i} className="h-[320px] overflow-hidden">
                                <DynamicChart chart={chart} />
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="h-[400px] flex flex-col items-center justify-center opacity-50">
                          <Loader2 className="w-12 h-12 animate-spin mb-4 text-blue-500" />
                          <p className="font-medium tracking-wide">Orchestrating AI Swarm...</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "ml" && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
                      {/* ═══ HEADER + 4-TAB SWITCHER ═══ */}
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[var(--card-border)] pb-6">
                        <div>
                          <h2 className="text-3xl font-bold mb-1 tracking-tight">ML Intelligence</h2>
                          <p className="text-[var(--text-muted)]">AutoML Pipeline · Multi-Model Comparison · Predictions</p>
                        </div>
                        <div className="flex p-1 bg-[var(--foreground)]/5 border border-[var(--card-border)] rounded-xl backdrop-blur-sm">
                          {[
                            { id: "dataintel", label: "DATA INTEL", icon: Database },
                            { id: "training", label: "TRAINING", icon: Cpu },
                            { id: "leaderboard", label: "LEADERBOARD", icon: TrendingUp },
                            { id: "predict", label: "PREDICT", icon: Zap },
                          ].map((tab) => (
                            <button
                              key={tab.id}
                              onClick={() => setSelectedSubTab(tab.id)}
                              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${selectedSubTab === tab.id
                                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                                : "opacity-50 hover:opacity-90 hover:bg-[var(--foreground)]/5"
                                }`}
                            >
                              <tab.icon className="w-3 h-3" />
                              <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* ═══════════════════════════════════════════════════════ */}
                      {/* DATA INTEL SUB-TAB */}
                      {/* ═══════════════════════════════════════════════════════ */}
                      {selectedSubTab === "dataintel" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                          {status?.ml_results?.data_intelligence ? (() => {
                            const di = status.ml_results.data_intelligence;
                            const dq = di?.data_quality || {};
                            const ft = di?.feature_types || {};
                            const cb = di?.class_balance;
                            const shape = di?.dataset_shape || {};
                            return (
                              <>
                                {/* Overview Stats */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                  {[
                                    { label: 'Rows', value: shape.rows?.toLocaleString() || '—', color: 'text-blue-400', bg: 'bg-blue-500/10', icon: Rows3 },
                                    { label: 'Columns', value: shape.columns || '—', color: 'text-purple-400', bg: 'bg-purple-500/10', icon: Columns3 },
                                    { label: 'Features Used', value: di?.selected_features?.length || '—', color: 'text-green-400', bg: 'bg-green-500/10', icon: CheckCircle2 },
                                    { label: 'Cols Removed', value: di?.removed_columns?.length || '0', color: 'text-red-400', bg: 'bg-red-500/10', icon: Trash2 },
                                  ].map((stat, i) => (
                                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                      className="p-4 rounded-xl bg-[var(--foreground)]/5 border border-[var(--card-border)] hover:border-blue-500/20 transition-all group"
                                    >
                                      <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                                        <stat.icon className={`w-4 h-4 ${stat.color}`} />
                                      </div>
                                      <p className="text-2xl font-bold">{stat.value}</p>
                                      <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-bold mt-1">{stat.label}</p>
                                    </motion.div>
                                  ))}
                                </div>

                                {/* Feature Types + Data Quality */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                  {/* Feature Type Breakdown */}
                                  <div className="p-6 rounded-2xl bg-[var(--foreground)]/5 border border-[var(--card-border)]">
                                    <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-5 flex items-center gap-2">
                                      <Hash className="w-3.5 h-3.5" /> Feature Type Distribution
                                    </h3>
                                    <div className="space-y-4">
                                      {[
                                        { label: 'Numeric', count: ft.numeric || 0, color: '#3b82f6', gradient: 'from-blue-500 to-cyan-400' },
                                        { label: 'Categorical', count: ft.categorical || 0, color: '#8b5cf6', gradient: 'from-purple-500 to-pink-400' },
                                        { label: 'DateTime', count: ft.datetime || 0, color: '#10b981', gradient: 'from-emerald-500 to-green-400' },
                                      ].map((feat, i) => {
                                        const total = (ft.numeric || 0) + (ft.categorical || 0) + (ft.datetime || 0) || 1;
                                        const pct = (feat.count / total) * 100;
                                        return (
                                          <div key={i}>
                                            <div className="flex items-center justify-between mb-1.5">
                                              <span className="text-xs font-semibold flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 rounded-full" style={{ background: feat.color }} />
                                                {feat.label}
                                              </span>
                                              <span className="text-xs font-bold">{feat.count} <span className="opacity-40">({pct.toFixed(0)}%)</span></span>
                                            </div>
                                            <div className="h-2.5 bg-[var(--foreground)]/10 rounded-full overflow-hidden">
                                              <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: i * 0.1 }}
                                                className={`h-full rounded-full bg-gradient-to-r ${feat.gradient}`} />
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                    {/* Target Info */}
                                    <div className="mt-5 pt-4 border-t border-[var(--card-border)]">
                                      <div className="flex items-center gap-2 text-xs">
                                        <Target className="w-3.5 h-3.5 text-red-400" />
                                        <span className="font-bold">Target:</span>
                                        <span className="px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 font-mono text-[11px]">{di?.target_column || '—'}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Data Quality Issues */}
                                  <div className="p-6 rounded-2xl bg-[var(--foreground)]/5 border border-[var(--card-border)]">
                                    <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-5 flex items-center gap-2">
                                      <Shield className="w-3.5 h-3.5" /> Data Quality Audit
                                    </h3>
                                    <div className="space-y-3">
                                      {[
                                        { label: 'Missing Values', value: `${dq.missing_total?.toLocaleString() || 0} cells (${dq.missing_pct || 0}%)`, status: (dq.missing_pct || 0) < 5 ? 'good' : (dq.missing_pct || 0) < 20 ? 'warn' : 'bad' },
                                        { label: 'Duplicate Rows', value: dq.duplicate_rows?.toLocaleString() || '0', status: (dq.duplicate_rows || 0) === 0 ? 'good' : 'warn' },
                                        { label: 'Outlier Columns', value: `${Object.keys(dq.outliers || {}).length} detected`, status: Object.keys(dq.outliers || {}).length === 0 ? 'good' : Object.keys(dq.outliers || {}).length < 3 ? 'warn' : 'bad' },
                                        { label: 'High Cardinality', value: `${(dq.high_cardinality || []).length} columns`, status: (dq.high_cardinality || []).length === 0 ? 'good' : 'warn' },
                                      ].map((item, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/8 transition-colors">
                                          <span className="text-xs font-semibold">{item.label}</span>
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold opacity-70">{item.value}</span>
                                            <div className={`w-2 h-2 rounded-full ${item.status === 'good' ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]' : item.status === 'warn' ? 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]' : 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]'}`} />
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                    {/* Class Balance */}
                                    {cb && (
                                      <div className="mt-4 pt-3 border-t border-[var(--card-border)]">
                                        <div className="flex items-center justify-between text-xs mb-2">
                                          <span className="font-bold flex items-center gap-1.5">
                                            <BarChart3 className="w-3 h-3 text-indigo-400" /> Class Balance
                                          </span>
                                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${cb.is_imbalanced ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                                            {cb.is_imbalanced ? `Imbalanced (${cb.imbalance_ratio}:1)` : 'Balanced'}
                                          </span>
                                        </div>
                                        {cb.distribution && Object.entries(cb.distribution).map(([cls, pct]: [string, any], i: number) => (
                                          <div key={i} className="mt-1.5">
                                            <div className="flex justify-between text-[10px] mb-0.5">
                                              <span className="opacity-60 font-bold">{cls}</span>
                                              <span className="font-bold">{pct}%</span>
                                            </div>
                                            <div className="h-1.5 bg-[var(--foreground)]/10 rounded-full overflow-hidden">
                                              <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }}
                                                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Removed Columns */}
                                {di?.removed_columns?.length > 0 && (
                                  <div className="p-5 rounded-2xl bg-[var(--foreground)]/5 border border-[var(--card-border)]">
                                    <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4 flex items-center gap-2">
                                      <Trash2 className="w-3.5 h-3.5" /> Auto-Removed Columns
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                      {di.removed_columns.map((rc: any, i: number) => (
                                        <div key={i} className="group relative px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs font-mono">
                                          <span className="text-red-400">{rc.column || rc}</span>
                                          {rc.reason && (
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[var(--background)] border border-[var(--card-border)] rounded-lg text-[10px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
                                              {rc.reason}
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* LLM Data Prep Suggestions */}
                                {status.ml_results.data_prep_suggestions?.length > 0 && (
                                  <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-purple-500/5 border border-blue-500/20 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl -z-10" />
                                    <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                      <Sparkles className="w-3.5 h-3.5" /> AI Data Preparation Insights
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      {status.ml_results.data_prep_suggestions.map((suggestion: string, i: number) => (
                                        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                                          className="flex items-start gap-3 p-3.5 rounded-xl bg-[var(--foreground)]/5 border border-[var(--card-border)] hover:border-blue-500/30 transition-all group"
                                        >
                                          <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-blue-500/20 transition-colors">
                                            <span className="text-[10px] font-black text-blue-400">{i + 1}</span>
                                          </div>
                                          <p className="text-xs leading-relaxed opacity-80">{suggestion}</p>
                                        </motion.div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </>
                            );
                          })() : (
                            <div className="h-[400px] flex flex-col items-center justify-center opacity-50">
                              <Database className="w-12 h-12 mb-4 text-[var(--text-muted)] animate-pulse" />
                              <p className="font-bold text-sm">Data Intelligence Loading...</p>
                              <p className="text-xs text-[var(--text-muted)] mt-1">Training must complete to generate data intelligence</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* ═══════════════════════════════════════════════════════ */}
                      {/* TRAINING SUB-TAB */}
                      {/* ═══════════════════════════════════════════════════════ */}
                      {selectedSubTab === "training" && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                          {status?.ml_results?.target_column ? (
                            <div className="space-y-8">
                              {/* Champion Stats Row */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}
                                  className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/20 hover:border-blue-500/40 transition-all relative overflow-hidden group"
                                >
                                  <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />
                                  <span className="text-blue-400 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse inline-block" /> Champion Model
                                  </span>
                                  <p className="text-xl font-bold truncate relative z-10" title={status?.ml_results?.best_model_name}>
                                    {status?.ml_results?.best_model_name}
                                  </p>
                                </motion.div>
                                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                                  className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent border border-purple-500/20 hover:border-purple-500/40 transition-all"
                                >
                                  <p className="text-purple-400 text-[10px] font-black uppercase tracking-widest mb-2">Task Architecture</p>
                                  <p className="text-xl font-bold capitalize">{status.ml_type?.replace('_', ' ')}</p>
                                </motion.div>
                                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                                  className="p-6 rounded-2xl bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-transparent border border-green-500/20 hover:border-green-500/40 transition-all"
                                >
                                  <p className="text-green-400 text-[10px] font-black uppercase tracking-widest mb-2">Primary Metric</p>
                                  <p className="text-4xl font-mono tracking-tight font-bold">
                                    {(Object.values(status?.ml_results?.metrics || {})[0] as number || 0).toFixed(4)}
                                  </p>
                                </motion.div>
                              </div>

                              {/* All Metrics Grid */}
                              {status?.ml_results?.metrics && Object.keys(status.ml_results.metrics).length > 0 && (
                                <div className="p-5 rounded-2xl bg-[var(--foreground)]/5 border border-[var(--card-border)]">
                                  <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Activity className="w-3.5 h-3.5" /> Performance Metrics
                                  </h3>
                                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                                    {Object.entries(status.ml_results.metrics).map(([key, val]: [string, any], i: number) => {
                                      const numVal = typeof val === 'number' ? val : parseFloat(val);
                                      const isGood = numVal >= 0.8;
                                      const isMid = numVal >= 0.6 && numVal < 0.8;
                                      return (
                                        <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
                                          className="p-3.5 rounded-xl bg-[var(--foreground)]/5 border border-[var(--card-border)] hover:bg-[var(--foreground)]/8 transition-all text-center"
                                        >
                                          <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">{key}</p>
                                          <p className={`text-lg font-mono font-bold ${isGood ? 'text-green-400' : isMid ? 'text-amber-400' : 'text-red-400'}`}>
                                            {typeof numVal === 'number' && !isNaN(numVal) ? numVal.toFixed(4) : val}
                                          </p>
                                        </motion.div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Feature Importance + Model Explanation */}
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Feature Importance */}
                                <div className="p-6 rounded-2xl bg-[var(--foreground)]/5 border border-[var(--card-border)]">
                                  <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <BarChart3 className="w-3.5 h-3.5" /> Feature Importance
                                  </h3>
                                  <div className="space-y-4">
                                    {Object.entries(status?.ml_results?.feature_importance || {})
                                      .sort((a, b) => (b[1] as number) - (a[1] as number))
                                      .slice(0, 8)
                                      .map(([feat, val]: any, i: number) => {
                                        const colors = ['from-blue-500 to-cyan-400', 'from-indigo-500 to-blue-400', 'from-purple-500 to-indigo-400', 'from-pink-500 to-purple-400', 'from-amber-500 to-orange-400', 'from-green-500 to-emerald-400', 'from-teal-500 to-cyan-400', 'from-rose-500 to-pink-400'];
                                        return (
                                          <div key={i} className="group">
                                            <div className="flex justify-between text-xs mb-1.5">
                                              <span className="font-semibold opacity-80 uppercase tracking-wide truncate max-w-[60%]">{feat}</span>
                                              <span className="font-bold text-blue-400">{(val * 100).toFixed(1)}%</span>
                                            </div>
                                            <div className="h-2.5 w-full bg-[var(--foreground)]/10 rounded-full overflow-hidden">
                                              <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min(val * 100, 100)}%` }}
                                                transition={{ duration: 1, ease: "easeOut", delay: i * 0.08 }}
                                                className={`h-full bg-gradient-to-r ${colors[i % colors.length]} rounded-full`}
                                              />
                                            </div>
                                          </div>
                                        );
                                      })}
                                    {Object.keys(status?.ml_results?.feature_importance || {}).length === 0 && (
                                      <div className="text-center opacity-40 italic text-sm py-8">Not applicable for this algorithm</div>
                                    )}
                                  </div>
                                </div>

                                {/* Model Explanation */}
                                <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 border border-indigo-500/20 relative overflow-hidden">
                                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl" />
                                  <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-5 flex items-center gap-2 relative z-10">
                                    <Sparkles className="w-3.5 h-3.5" /> AI Model Explanation
                                  </h3>
                                  {status?.ml_results?.model_explanation ? (
                                    <div className="relative z-10">
                                      <p className="text-sm leading-relaxed opacity-85 italic">
                                        &ldquo;{status.ml_results.model_explanation}&rdquo;
                                      </p>
                                      <div className="mt-5 pt-4 border-t border-[var(--card-border)]">
                                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-1.5">
                                          <Bot className="w-3 h-3" /> Generated by AGENTIQ AI Engine
                                        </p>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-center opacity-40 italic text-sm py-8 relative z-10">
                                      Generating model analysis...
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Quick Compare Chart */}
                              <div className="p-6 rounded-2xl bg-[var(--foreground)]/5 border border-[var(--card-border)]">
                                <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-5 flex items-center gap-2">
                                  <TrendingUp className="w-3.5 h-3.5" /> Model Performance Overview
                                </h3>
                                <div className="h-[250px] w-full">
                                  {status?.ml_results?.model_comparison?.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                      <BarChart data={status.ml_results.model_comparison.slice(0, 5)} layout="vertical" margin={{ left: 10, right: 30, top: 5, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" horizontal={false} />
                                        <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} domain={[0, 1]} />
                                        <YAxis dataKey="Model" type="category" width={100} tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                                        <Tooltip cursor={{ fill: 'var(--card-border)' }} contentStyle={{ background: 'var(--glass-panel)', border: '1px solid var(--card-border)', borderRadius: '12px', fontSize: '11px' }} />
                                        <Bar dataKey={(status.ml_results.model_comparison?.[0] && Object.keys(status.ml_results.model_comparison[0]).find(k => k !== 'Model')) || 'Accuracy'} fill="#4f46e5" radius={[0, 6, 6, 0]} barSize={22}>
                                          {status.ml_results.model_comparison.slice(0, 5).map((_e: any, i: number) => (
                                            <Cell key={i} fill={i === 0 ? '#4f46e5' : i === 1 ? 'rgba(79, 70, 229, 0.5)' : 'rgba(79, 70, 229, 0.2)'} />
                                          ))}
                                        </Bar>
                                      </BarChart>
                                    </ResponsiveContainer>
                                  ) : (
                                    <div className="h-full flex flex-col items-center justify-center opacity-40">
                                      <Loader2 className="w-6 h-6 animate-spin mb-2" />
                                      <p className="text-xs uppercase tracking-widest">Generating Benchmarks...</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="h-[400px] flex flex-col items-center justify-center opacity-60">
                              <div className="relative mb-6">
                                <div className="absolute inset-0 bg-blue-500/20 blur-xl animate-pulse rounded-full" />
                                <Cpu className="w-16 h-16 text-blue-500 animate-pulse relative z-10" />
                              </div>
                              <h3 className="text-xl font-bold mb-2">Optimizing Neural Grid</h3>
                              <p className="max-w-md text-center text-sm opacity-60">PyCaret is training multiple models in parallel. This may take a minute...</p>
                              <div className="mt-4 flex gap-1">
                                {[0, 1, 2, 3, 4].map((i) => (
                                  <motion.div key={i} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                                    className="w-2 h-2 rounded-full bg-blue-500" />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* ═══════════════════════════════════════════════════════ */}
                      {/* LEADERBOARD SUB-TAB */}
                      {/* ═══════════════════════════════════════════════════════ */}
                      {selectedSubTab === "leaderboard" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                          {status?.ml_results?.leaderboard?.length > 0 ? (() => {
                            const lb = status.ml_results.leaderboard;
                            const metricKeys = Object.keys(lb[0] || {}).filter(k => !['rank', 'Model', 'model_name'].includes(k));
                            return (
                              <>
                                {/* Champion Banner */}
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                                  className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-orange-500/10 border border-amber-500/30 flex items-center gap-4"
                                >
                                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0">
                                    <span className="text-2xl">🏆</span>
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-0.5">Champion Model</p>
                                    <p className="text-lg font-bold">{lb[0]?.Model || lb[0]?.model_name}</p>
                                  </div>
                                  <div className="ml-auto text-right">
                                    {metricKeys.slice(0, 2).map((key, i) => (
                                      <p key={i} className="text-xs font-mono">
                                        <span className="opacity-50">{key}: </span>
                                        <span className="font-bold text-amber-400">{typeof lb[0][key] === 'number' ? lb[0][key].toFixed(4) : lb[0][key]}</span>
                                      </p>
                                    ))}
                                  </div>
                                </motion.div>

                                {/* Leaderboard Table */}
                                <div className="rounded-2xl border border-[var(--card-border)] overflow-hidden bg-[var(--foreground)]/5">
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-xs">
                                      <thead>
                                        <tr className="border-b border-[var(--card-border)] bg-[var(--foreground)]/5">
                                          <th className="px-4 py-3.5 text-left font-black uppercase tracking-widest text-[10px] text-[var(--text-muted)]">Rank</th>
                                          <th className="px-4 py-3.5 text-left font-black uppercase tracking-widest text-[10px] text-[var(--text-muted)]">Model</th>
                                          {metricKeys.map((key) => (
                                            <th key={key} className="px-4 py-3.5 text-right font-black uppercase tracking-widest text-[10px] text-[var(--text-muted)]">{key}</th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {lb.map((entry: any, i: number) => {
                                          const rank = entry.rank || i + 1;
                                          const isChampion = rank === 1;
                                          return (
                                            <motion.tr key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                                              className={`border-b border-[var(--card-border)] transition-colors ${isChampion ? 'bg-amber-500/5 hover:bg-amber-500/10' : 'hover:bg-[var(--foreground)]/5'}`}
                                            >
                                              <td className="px-4 py-3.5">
                                                {isChampion ? (
                                                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white font-black text-[10px] shadow-lg shadow-amber-500/30">1</span>
                                                ) : rank === 2 ? (
                                                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-slate-400 to-gray-500 text-white font-black text-[10px]">2</span>
                                                ) : rank === 3 ? (
                                                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-amber-700 to-amber-800 text-white font-black text-[10px]">3</span>
                                                ) : (
                                                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[var(--foreground)]/10 font-bold text-[var(--text-muted)]">{rank}</span>
                                                )}
                                              </td>
                                              <td className={`px-4 py-3.5 font-bold ${isChampion ? 'text-amber-400' : ''}`}>
                                                {entry.Model || entry.model_name}
                                              </td>
                                              {metricKeys.map((key) => {
                                                const val = entry[key];
                                                const numVal = typeof val === 'number' ? val : parseFloat(val);
                                                const isGood = !isNaN(numVal) && numVal >= 0.8;
                                                const isMid = !isNaN(numVal) && numVal >= 0.6 && numVal < 0.8;
                                                return (
                                                  <td key={key} className="px-4 py-3.5 text-right font-mono">
                                                    <span className={`${isChampion ? 'text-amber-400 font-bold' : isGood ? 'text-green-400' : isMid ? 'text-amber-400' : 'opacity-70'}`}>
                                                      {typeof numVal === 'number' && !isNaN(numVal) ? numVal.toFixed(4) : val || '—'}
                                                    </span>
                                                  </td>
                                                );
                                              })}
                                            </motion.tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>

                                {/* Model Count Summary */}
                                <div className="flex items-center justify-center gap-2 text-xs text-[var(--text-muted)]">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                                  <span className="font-bold">{lb.length} algorithms</span> evaluated and ranked by PyCaret AutoML
                                </div>
                              </>
                            );
                          })() : (
                            <div className="h-[400px] flex flex-col items-center justify-center opacity-50">
                              <TrendingUp className="w-12 h-12 mb-4 text-[var(--text-muted)] animate-pulse" />
                              <p className="font-bold text-sm">Leaderboard Loading...</p>
                              <p className="text-xs text-[var(--text-muted)] mt-1">Model training must complete to populate leaderboard</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* ═══════════════════════════════════════════════════════ */}
                      {/* PREDICT SUB-TAB */}
                      {/* ═══════════════════════════════════════════════════════ */}
                      {selectedSubTab === "predict" && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                          {status?.ml_results?.model_ready || status?.completed_steps?.includes("ml") ? (
                            <PredictionTab
                              availableColumns={availableColumns}
                              predictionInput={predictionInput}
                              setPredictionInput={setPredictionInput}
                              useAutoTarget={useAutoTarget}
                              setUseAutoTarget={setUseAutoTarget}
                              selectedTarget={selectedTarget}
                              setSelectedTarget={setSelectedTarget}
                              handlePredict={handlePredict}
                              isPredicting={isPredicting}
                              predictionResult={predictionResult}
                            />
                          ) : (
                            <div className="h-[400px] flex flex-col items-center justify-center text-center opacity-50">
                              <Shield className="w-16 h-16 mb-4 text-[var(--text-muted)]" />
                              <h3 className="text-lg font-bold">Prediction Engine Locked</h3>
                              <p className="text-sm">Model training must complete first.</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "report" && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="border-b border-[var(--card-border)] pb-6">
                        <h2 className="text-3xl font-bold mb-1">Executive Reporting</h2>
                        <p className="text-[var(--text-muted)]">Downloadable assets and presentations</p>
                      </div>

                      {(status?.completed_steps?.includes("report") || status?.report_status === "ready") ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {/* PDF CARD */}
                          <div className="glass-card p-8 flex flex-col items-center text-center group bg-[var(--glass-panel)] hover:border-red-500/30 transition-all">
                            <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                              <FileText className="w-10 h-10 text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Analysis Whitepaper</h3>
                            <p className="opacity-60 text-sm mb-8 leading-relaxed">
                              Deep-dive PDF document containing statistical audit, model architecture, and feature insights.
                            </p>
                            <a
                              href={`${API_BASE}/download/pdf?task_id=${taskId}`}
                              target="_blank"
                              className="w-full py-4 rounded-xl border border-[var(--card-border)] bg-[var(--foreground)]/5 hover:bg-red-500 hover:text-white hover:border-red-600 transition-all font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                            >
                              <Zap className="w-4 h-4 fill-current" /> Download PDF
                            </a>
                          </div>

                          {/* PPTX CARD */}
                          <div className="glass-card p-8 flex flex-col items-center text-center group bg-[var(--glass-panel)] hover:border-orange-500/30 transition-all">
                            <div className="w-20 h-20 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                              <LayoutGrid className="w-10 h-10 text-orange-500" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Strategy Deck</h3>
                            <p className="opacity-60 text-sm mb-8 leading-relaxed">
                              Presentation-ready PowerPoint slides optimized for stakeholder meetings.
                            </p>
                            <a
                              href={`${API_BASE}/download/pptx?task_id=${taskId}`}
                              target="_blank"
                              className="w-full py-4 rounded-xl border border-[var(--card-border)] bg-[var(--foreground)]/5 hover:bg-orange-500 hover:text-white hover:border-orange-600 transition-all font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                            >
                              <Zap className="w-4 h-4 fill-current" /> Download Deck
                            </a>
                          </div>
                        </div>
                      ) : status?.completed_steps?.includes("ml") ? (
                        <div className="h-[400px] flex flex-col items-center justify-center opacity-60">
                          <Loader2 className="w-10 h-10 animate-spin mb-4 text-purple-500" />
                          <p className="font-bold uppercase tracking-[0.2em] text-xs">Compiling Scientific Assets...</p>
                        </div>
                      ) : (
                        <div className="h-[400px] flex flex-col items-center justify-center text-center opacity-40">
                          <FileText className="w-12 h-12 mb-4" />
                          <h3 className="font-bold">Report Generation Pending</h3>
                          <p className="text-sm">Complete the analysis first.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "dashboard" && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                      <div className="sticky top-4 z-30 bg-[var(--glass-panel)]/60 backdrop-blur-2xl border border-[var(--card-border)] rounded-3xl p-5 mb-8 flex items-center justify-between shadow-2xl transition-all hover:bg-[var(--glass-panel)]/80">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                            <Sparkles className="w-6 h-6 animate-pulse" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-black tracking-tight gradient-text">
                              Visualizer
                            </h2>
                            <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-widest opacity-70">Interactive Dashboard</p>
                          </div>
                        </div>
                        <div className="hidden md:flex gap-2">
                          <div className="px-4 py-2 rounded-full bg-[var(--background)]/40 border border-[var(--card-border)] text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-2 shadow-inner">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-[pulse-glow_2s_infinite]" />
                            Live
                          </div>
                        </div>
                      </div>

                      {status?.eda_charts && status.eda_charts.length > 0 ? (
                        <>
                          {/* Univariate Section */}
                          <section>
                            <div className="relative group overflow-hidden rounded-2xl p-6 mb-8 bg-gradient-to-r from-blue-500/10 to-transparent border border-blue-500/10 hover:border-blue-500/30 transition-all shadow-lg hover:shadow-blue-500/10">
                              <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-700">
                                <BarChart3 className="w-48 h-48 text-blue-500" />
                              </div>
                              <div className="relative z-10">
                                <h3 className="text-2xl font-bold mb-2 flex items-center gap-3 text-[var(--foreground)]">
                                  <span className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/40">
                                    <BarChart3 className="w-5 h-5 text-white" />
                                  </span>
                                  Univariate Analysis
                                </h3>
                                <p className="text-sm text-[var(--text-muted)] max-w-lg leading-relaxed">
                                  Deep dive into single-variable distributions. Understand the shape, central tendency, and spread of individual features in your dataset.
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {status.eda_charts
                                .filter((c: any) => ['area', 'bar', 'pie', 'histogram'].includes(c.type?.toLowerCase()))
                                .map((chart: any, i: number) => (
                                  <div key={`uni-${i}`} className="h-[280px] overflow-hidden">
                                    <DynamicChart chart={chart} />
                                  </div>
                                ))}
                            </div>
                          </section>

                          {/* Bivariate Section */}
                          <section>
                            <div className="relative group overflow-hidden rounded-2xl p-6 mb-8 mt-12 bg-gradient-to-r from-purple-500/10 to-transparent border border-purple-500/10 hover:border-purple-500/30 transition-all shadow-lg hover:shadow-purple-500/10">
                              <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-700">
                                <Activity className="w-48 h-48 text-purple-500" />
                              </div>
                              <div className="relative z-10">
                                <h3 className="text-2xl font-bold mb-2 flex items-center gap-3 text-[var(--foreground)]">
                                  <span className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/40">
                                    <Activity className="w-5 h-5 text-white" />
                                  </span>
                                  Bivariate Analysis
                                </h3>
                                <p className="text-sm text-[var(--text-muted)] max-w-lg leading-relaxed">
                                  Explore relationships between pairs of variables. Identify trends, correlations, and potential causal links impacting your target.
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {status.eda_charts
                                .filter((c: any) => ['line', 'trend', 'scatter', 'boxplot', 'stats_table'].includes(c.type?.toLowerCase()))
                                .map((chart: any, i: number) => (
                                  <div key={`bi-${i}`} className="h-[320px] overflow-hidden">
                                    <DynamicChart chart={chart} />
                                  </div>
                                ))}
                              {status.eda_charts.filter((c: any) => ['line', 'trend', 'scatter', 'boxplot', 'stats_table'].includes(c.type?.toLowerCase())).length === 0 && (
                                <div className="col-span-full h-[200px] flex items-center justify-center border border-dashed border-[var(--card-border)] rounded-xl opacity-50 bg-[var(--foreground)]/5">
                                  <p className="text-sm flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-[var(--text-muted)]" />
                                    Processing relational patterns...
                                  </p>
                                </div>
                              )}
                            </div>
                          </section>

                          {/* Multivariate Section */}
                          <section>
                            <div className="relative group overflow-hidden rounded-2xl p-6 mb-8 mt-12 bg-gradient-to-r from-green-500/10 to-transparent border border-green-500/10 hover:border-green-500/30 transition-all shadow-lg hover:shadow-green-500/10">
                              <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-700">
                                <LayoutGrid className="w-48 h-48 text-green-500" />
                              </div>
                              <div className="relative z-10">
                                <h3 className="text-2xl font-bold mb-2 flex items-center gap-3 text-[var(--foreground)]">
                                  <span className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/40">
                                    <LayoutGrid className="w-5 h-5 text-white" />
                                  </span>
                                  Multivariate Analysis
                                </h3>
                                <p className="text-sm text-[var(--text-muted)] max-w-lg leading-relaxed">
                                  Uncover complex interactions involving three or more variables. Visualize high-dimensional patterns with heatmaps and clusters.
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {status.eda_charts
                                .filter((c: any) => ['heatmap', 'radar', 'pairplot', 'pca', 'feature_importance', 'feature_plot', 'correlation_matrix', 'bubble'].includes(c.type?.toLowerCase()))
                                .map((chart: any, i: number) => (
                                  <div key={`multi-${i}`} className="h-[380px] overflow-hidden">
                                    <DynamicChart chart={chart} />
                                  </div>
                                ))}
                              {status.eda_charts.filter((c: any) => ['heatmap', 'radar', 'pairplot', 'pca', 'feature_importance', 'feature_plot', 'correlation_matrix', 'bubble'].includes(c.type?.toLowerCase())).length === 0 && (
                                <div className="h-[200px] flex items-center justify-center border border-dashed border-[var(--card-border)] rounded-xl opacity-50 bg-[var(--foreground)]/5">
                                  <p className="text-sm">Not enough data dimensions for multivariate analysis.</p>
                                </div>
                              )}
                            </div>
                          </section>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-[500px] opacity-50">
                          <Loader2 className="w-12 h-12 mb-4 animate-spin text-blue-500" />
                          <h3 className="text-xl font-bold">Generated Visualizations</h3>
                          <p className="text-sm">Waiting for Data Intelligence agent...</p>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- MOBILE BOTTOM NAVIGATION --- */}
        {taskId && !isChatOpen && (
          <nav className="fixed bottom-0 left-0 right-0 bg-[var(--glass-panel)] backdrop-blur-2xl border-t border-[var(--card-border)] z-[200] lg:hidden pb-safe">
            <div className="flex justify-around items-center p-2">
              {steps.map((step) => {
                const isActive = activeTab === step.id;
                const isRag = step.id === 'rag';
                return (
                  <button
                    key={step.id}
                    onClick={() => {
                      if (isRag) {
                        setIsChatOpen(true);
                      } else {
                        setActiveTab(step.id);
                      }
                    }}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isActive && !isRag
                      ? 'text-blue-500 bg-blue-500/10'
                      : 'text-[var(--text-muted)] hover:text-[var(--foreground)]'
                      }`}
                  >
                    <step.icon className={`w-6 h-6 ${isActive && !isRag ? 'fill-current' : 'stroke-current'}`} />
                    <span className="text-[10px] font-medium">{step.name.split(' ')[0]}</span>
                    {getStepStatus(step.id) === 'running' && (
                      <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                    )}
                  </button>
                )
              })}
            </div>
          </nav>
        )}
      </div>

      {/* --- FLOATING CHAT PANEL --- */}
      <AnimatePresence>
        {isChatOpen && (
          <>
            {/* Backdrop for mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsChatOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] lg:hidden"
            />

            <motion.div
              initial={{ x: "100%", opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0.5 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 h-full w-[85vw] md:w-[450px] bg-[var(--glass-panel)] border-l border-[var(--card-border)] backdrop-blur-2xl shadow-2xl z-[100] flex flex-col"
            >
              {/* Chat Header */}
              <div className="flex items-center justify-between p-6 border-b border-[var(--card-border)] bg-[var(--background)]/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/20">
                    <Bot className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">AI Assistant</h3>
                    <p className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      Online & Ready
                    </p>
                  </div>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-[var(--foreground)]/10 rounded-full transition-colors">
                  <X className="w-5 h-5 opacity-50 hover:opacity-100" />
                </button>
              </div>

              {/* Chat Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-premium bg-[var(--background)]/30">
                {chatHistory.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 opacity-60">
                    <Sparkles className="w-8 h-8 text-blue-400 mb-4" />
                    <h4 className="font-bold mb-2">How can I help you?</h4>
                    <p className="text-sm mb-6">Ask me about trends, outliers, or specific data points.</p>

                    {status?.suggested_questions && (
                      <div className="flex flex-col gap-2 w-full">
                        {status.suggested_questions.map((q: string, i: number) => (
                          <button key={i} onClick={() => handleChat(q)} className="text-xs p-3 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-blue-500/50 hover:text-blue-500 transition-all text-left">
                            "{q}"
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  chatHistory.map((msg, i) => (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={i}
                      className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-indigo-500/20' : 'bg-blue-500/20'}`}>
                        {msg.role === 'user' ? <Cpu className="w-4 h-4 text-indigo-400" /> : <Bot className="w-4 h-4 text-blue-400" />}
                      </div>
                      <div className={`p-4 rounded-2xl text-sm leading-relaxed max-w-[85%] shadow-md ${msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--foreground)] rounded-tl-none'
                        }`}>
                        {msg.role === 'assistant' ? (
                          <div className="prose prose-sm prose-invert max-w-none [&>p]:mb-2 [&>ul]:mb-2 [&>ol]:mb-2 [&>h3]:text-base [&>h3]:font-bold [&>h3]:mt-3 [&>h3]:mb-1 [&_li]:mb-0.5 [&>p:last-child]:mb-0">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content || '▍'}</ReactMarkdown>
                          </div>
                        ) : (
                          msg.content
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
                {isChatting && (
                  <div className="flex items-center gap-2 p-2 opacity-50">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100" />
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200" />
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-[var(--glass-panel)] border-t border-[var(--card-border)] pb-safe" style={{ paddingBottom: `max(1rem, env(safe-area-inset-bottom))` }}>
                <div className="relative flex items-center">
                  <input
                    autoFocus
                    type="text"
                    value={chatQuery}
                    onChange={(e) => setChatQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleChat()}
                    placeholder="Ask anything..."
                    disabled={isChatting}
                    className="w-full bg-[var(--foreground)]/5 border border-[var(--card-border)] rounded-full pl-5 pr-12 py-3.5 focus:outline-none focus:border-blue-500/50 transition-all text-sm font-medium"
                  />
                  <button
                    onClick={() => handleChat()}
                    disabled={!chatQuery || isChatting}
                    className="absolute right-2 p-2 bg-blue-600 rounded-full text-white hover:bg-blue-500 transition-all disabled:opacity-50 disabled:bg-gray-500"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Floating Chat Button (if closed) */}
      {token && !isChatOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-20 right-4 p-4 bg-blue-600 rounded-full text-white shadow-2xl shadow-blue-600/40 z-[190] hover:scale-110 transition-transform lg:hidden"
        >
          <MessageSquare className="w-6 h-6" />
        </motion.button>
      )}
    </main>
  );
}
