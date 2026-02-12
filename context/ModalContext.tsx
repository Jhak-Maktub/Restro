import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ModalContent {
  title: string;
  body: React.ReactNode;
}

interface ModalContextType {
  isOpen: boolean;
  content: ModalContent | null;
  openModal: (title: string, body: React.ReactNode) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<ModalContent | null>(null);

  const openModal = (title: string, body: React.ReactNode) => {
    setContent({ title, body });
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    // Delay clearing content to allow animation to finish if needed, 
    // but for now immediate is fine or small timeout
    setTimeout(() => setContent(null), 300); 
  };

  return (
    <ModalContext.Provider value={{ isOpen, content, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) throw new Error('useModal must be used within a ModalProvider');
  return context;
};