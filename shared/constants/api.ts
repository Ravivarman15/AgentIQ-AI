/**
 * AGENTIQ AI — Shared API Route Constants
 * Single source of truth for all backend endpoints.
 * Used for documentation, testing, and frontend API client consistency.
 */

export const API_ROUTES = {
  // Auth
  AUTH: {
    REGISTER: "/register",
    LOGIN: "/token",
  },

  // Datasets & Upload
  DATASET: {
    UPLOAD: "/upload",
    LIST: "/datasets",
    DELETE: (id: string | number) => `/datasets/${id}`,
    RESUME: (id: string | number) => `/resume/${id}`,
    SAMPLES: "/sample-datasets",
    LOAD_SAMPLE: (key: string) => `/load-sample/${key}`,
  },

  // ML Pipeline
  ML: {
    PREDICT: "/predict",
    COLUMNS: (taskId: string) => `/columns/${taskId}`,
    FEATURE_SELECTION: "/feature-selection",
    RERUN_FULL: "/rerun_full",
  },

  // Status & System
  STATUS: {
    POLL: (taskId: string) => `/status/${taskId}`,
    INFO: (taskId: string) => `/dataset-info/${taskId}`,
    PYTHON_CHECK: "/python-check",
    HEALTH: "/",
  },

  // RAG Chat
  CHAT: {
    BASE: "/chat",
    STREAM: "/chat/stream",
  },

  // Reports
  REPORT: {
    DOWNLOAD: (type: "pdf" | "pptx", taskId: string) => `/download/${type}?task_id=${taskId}`,
  },
};
