// #context/UIContext.tsx
import { createContext, useContext, useState, type ReactNode } from 'react';
import { MessageBox } from '#components/ui/notification';

interface Notice {
  title: string;
  msg: string | string[];
}

interface UIContextType {
  showNotice: (title: string, msg: string | string[]) => void;
  clearNotice: () => void;
}

const UIContext = createContext<UIContextType | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [notice, setNotice] = useState<Notice | null>(null);

  const showNotice = (title: string, msg: string | string[]) => setNotice({ title, msg });
  const clearNotice = () => setNotice(null);

  return (
    <UIContext.Provider value={{ showNotice, clearNotice }}>
      {children}
      {notice && (
        <MessageBox
          title={notice.title}
          message={Array.isArray(notice.msg) ? notice.msg : [notice.msg]}
          onClose={clearNotice}
          onContinue={clearNotice}
        />
      )}
    </UIContext.Provider>
  );
}

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI must be used within UIProvider');
  return context;
};
