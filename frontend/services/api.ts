/**
 * AGENTIQ AI — Centralized API Service
 * All backend API calls go through this module.
 * Uses NEXT_PUBLIC_API_URL env variable for deployment flexibility.
 */

import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";
import { API_ROUTES } from "@shared/constants/api";

// ═══════════════════════════════════════════════════════════════════════════════
// API BASE URL — from environment variable
// ═══════════════════════════════════════════════════════════════════════════════

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// ═══════════════════════════════════════════════════════════════════════════════
// AXIOS INSTANCE — pre-configured with base URL and interceptors
// ═══════════════════════════════════════════════════════════════════════════════

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 120000, // 2 min timeout for ML operations
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor — automatically attach auth token
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("agentiq_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor — handle auth errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("agentiq_token");
      // Don't redirect here — let components handle it
    }
    return Promise.reject(error);
  }
);

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH API
// ═══════════════════════════════════════════════════════════════════════════════

export const authApi = {
  login: async (email: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);
    const res = await apiClient.post(API_ROUTES.AUTH.LOGIN, formData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return res.data;
  },

  register: async (email: string, password: string) => {
    const res = await apiClient.post(API_ROUTES.AUTH.REGISTER, { email, password });
    return res.data;
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// DATASET API
// ═══════════════════════════════════════════════════════════════════════════════

export const datasetApi = {
  list: async () => {
    const res = await apiClient.get(API_ROUTES.DATASET.LIST);
    return res.data;
  },

  upload: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await apiClient.post(API_ROUTES.DATASET.UPLOAD, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  delete: async (datasetId: number) => {
    const res = await apiClient.delete(API_ROUTES.DATASET.DELETE(datasetId));
    return res.data;
  },

  resume: async (datasetId: number) => {
    const res = await apiClient.post(API_ROUTES.DATASET.RESUME(datasetId), {});
    return res.data;
  },

  getSampleDatasets: async () => {
    const res = await apiClient.get(API_ROUTES.DATASET.SAMPLES);
    return res.data;
  },

  loadSample: async (datasetKey: string) => {
    const res = await apiClient.post(API_ROUTES.DATASET.LOAD_SAMPLE(datasetKey), {});
    return res.data;
  },

  getInfo: async (taskId: string) => {
    const res = await apiClient.get(API_ROUTES.STATUS.INFO(taskId));
    return res.data;
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// ML API
// ═══════════════════════════════════════════════════════════════════════════════

export const mlApi = {
  getStatus: async (taskId: string) => {
    const res = await apiClient.get(API_ROUTES.STATUS.POLL(taskId));
    return res.data;
  },

  predict: async (
    taskId: string,
    inputData: Record<string, any>,
    useAutoTarget: boolean = true,
    targetColumn?: string
  ) => {
    const res = await apiClient.post(API_ROUTES.ML.PREDICT, {
      task_id: taskId,
      input_data: inputData,
      use_auto_target: useAutoTarget,
      target_column: useAutoTarget ? null : targetColumn,
    });
    return res.data;
  },

  getColumns: async (taskId: string) => {
    const res = await apiClient.get(API_ROUTES.ML.COLUMNS(taskId));
    return res.data;
  },

  setFeatureSelection: async (
    taskId: string,
    targetColumn?: string,
    features?: string[],
    autoMode: boolean = true
  ) => {
    const res = await apiClient.post(API_ROUTES.ML.FEATURE_SELECTION, {
      task_id: taskId,
      target_column: targetColumn,
      features,
      auto_mode: autoMode,
    });
    return res.data;
  },

  rerunFull: async (taskId: string) => {
    const res = await apiClient.post(`${API_ROUTES.ML.RERUN_FULL}?task_id=${taskId}`);
    return res.data;
  },

  pythonCheck: async () => {
    const res = await apiClient.get(API_ROUTES.STATUS.PYTHON_CHECK);
    return res.data;
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// RAG CHAT API
// ═══════════════════════════════════════════════════════════════════════════════

export const chatApi = {
  send: async (taskId: string, query: string) => {
    const res = await apiClient.post(API_ROUTES.CHAT.BASE, {
      task_id: taskId,
      query,
    });
    return res.data;
  },

  /**
   * Stream chat response via SSE.
   * Returns a ReadableStream reader for token-by-token consumption.
   */
  stream: async (taskId: string, query: string) => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("agentiq_token")
        : null;

    const response = await fetch(`${API_BASE}${API_ROUTES.CHAT.STREAM}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ task_id: taskId, query }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response;
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// REPORT API
// ═══════════════════════════════════════════════════════════════════════════════

export const reportApi = {
  download: (fileType: "pdf" | "pptx", taskId: string) => {
    return `${API_BASE}${API_ROUTES.REPORT.DOWNLOAD(fileType, taskId)}`;
  },
};

export default apiClient;
