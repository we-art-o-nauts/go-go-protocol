type Persistence = {
  setItem(key: string, value: string): Promise<void>;
  getItem(key: string): Promise<string | null>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
};

export const persistence: Persistence = {
  setItem(key, value) {
    return null;
    return window.persistentStorage.setItem(key, value);
  },
  getItem(key) {
    return null;
    return window.persistentStorage.getItem(key);
  },
  removeItem(key) {
    return null;
    return window.persistentStorage.removeItem(key);
  },
  clear() {
    return null;
    return window.persistentStorage.clear();
  },
};
