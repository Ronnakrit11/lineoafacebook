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
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === updatedConversation.id ? updatedConversation : conv
      ),
      selectedConversation:
        state.selectedConversation?.id === updatedConversation.id
          ? updatedConversation
          : state.selectedConversation,
    })),
  addMessage: (message) =>
    set((state) => {
      const updatedConversations = state.conversations.map((conv) => {
        if (conv.id === message.conversationId) {
          return {
            ...conv,
            messages: Array.isArray(conv.messages) 
              ? [...conv.messages, message]
              : [message],
          };
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