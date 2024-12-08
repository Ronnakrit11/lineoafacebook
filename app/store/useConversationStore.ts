import { create } from 'zustand';
import { ConversationWithMessages } from '../types/chat';
import { Message } from '@prisma/client';

interface ConversationStore {
  conversations: ConversationWithMessages[];
  selectedConversation: ConversationWithMessages | null;
  setConversations: (conversations: ConversationWithMessages[]) => void;
  setSelectedConversation: (conversation: ConversationWithMessages | null) => void;
  updateConversation: (updatedConversation: ConversationWithMessages) => void;
  addMessage: (message: Message) => void;
}

export const useConversationStore = create<ConversationStore>((set) => ({
  conversations: [],
  selectedConversation: null,
  setConversations: (conversations) => set({ conversations }),
  setSelectedConversation: (conversation) => set({ selectedConversation: conversation }),
  updateConversation: (updatedConversation) =>
    set((state) => {
      if (!updatedConversation) return state;

      const updatedConversations = state.conversations.map((conv) =>
        conv.id === updatedConversation.id ? updatedConversation : conv
      );

      return {
        conversations: updatedConversations,
        selectedConversation:
          state.selectedConversation?.id === updatedConversation.id
            ? updatedConversation
            : state.selectedConversation,
      };
    }),
  addMessage: (message) =>
    set((state) => {
      if (!message || !message.conversationId) return state;

      const updatedConversations = state.conversations.map((conv) => {
        if (conv.id === message.conversationId) {
          const messages = Array.isArray(conv.messages) ? [...conv.messages] : [];
          if (!messages.some(m => m.id === message.id)) {
            messages.push(message);
          }
          return { ...conv, messages };
        }
        return conv;
      });

      const updatedSelectedConversation = state.selectedConversation && 
        state.selectedConversation.id === message.conversationId
          ? {
              ...state.selectedConversation,
              messages: Array.isArray(state.selectedConversation.messages)
                ? [...state.selectedConversation.messages, message]
                : [message],
            }
          : state.selectedConversation;

      return {
        conversations: updatedConversations,
        selectedConversation: updatedSelectedConversation,
      };
    }),
}));