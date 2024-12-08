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
      if (!message?.conversationId) return state;

      const updatedConversations = state.conversations.map((conv) => {
        if (conv.id === message.conversationId) {
          // Ensure we don't add duplicate messages
          const existingMessage = conv.messages.find(m => 
            m.id === message.id || m.externalId === message.externalId
          );
          
          if (!existingMessage) {
            return {
              ...conv,
              messages: [...conv.messages, message].sort(
                (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
              )
            };
          }
        }
        return conv;
      });

      const updatedSelectedConversation = state.selectedConversation?.id === message.conversationId
        ? {
            ...state.selectedConversation,
            messages: [...state.selectedConversation.messages, message].sort(
              (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
            )
          }
        : state.selectedConversation;

      return {
        conversations: updatedConversations,
        selectedConversation: updatedSelectedConversation,
      };
    }),
}));