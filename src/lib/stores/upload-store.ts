import { create } from 'zustand';

interface UploadState {
  uploads: Map<
    string,
    {
      progress: number;
      status: 'pending' | 'uploading' | 'completed' | 'error';
      filePath: string;
      error?: string;
    }
  >;

  // Actions
  addUpload: (id: string, filePath: string) => void;
  updateProgress: (id: string, progress: number) => void;
  setError: (id: string, error: string) => void;
  setCompleted: (id: string) => void;
  removeUpload: (id: string) => void;
}

export const useUploadStore = create<UploadState>((set) => ({
  uploads: new Map(),

  addUpload: (id, filePath) =>
    set((state) => {
      const newUploads = new Map(state.uploads);
      newUploads.set(id, {
        progress: 0,
        status: 'pending',
        filePath,
      });
      return { uploads: newUploads };
    }),

  updateProgress: (id, progress) =>
    set((state) => {
      const newUploads = new Map(state.uploads);
      const upload = newUploads.get(id);
      if (upload) {
        newUploads.set(id, {
          ...upload,
          progress,
          status: 'uploading',
        });
      }
      return { uploads: newUploads };
    }),

  setError: (id, error) =>
    set((state) => {
      const newUploads = new Map(state.uploads);
      const upload = newUploads.get(id);
      if (upload) {
        newUploads.set(id, {
          ...upload,
          status: 'error',
          error,
        });
      }
      return { uploads: newUploads };
    }),

  setCompleted: (id) =>
    set((state) => {
      const newUploads = new Map(state.uploads);
      const upload = newUploads.get(id);
      if (upload) {
        newUploads.set(id, {
          ...upload,
          status: 'completed',
          progress: 100,
        });
      }
      return { uploads: newUploads };
    }),

  removeUpload: (id) =>
    set((state) => {
      const newUploads = new Map(state.uploads);
      newUploads.delete(id);
      return { uploads: newUploads };
    }),
}));
