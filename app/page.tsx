import { PrismaClient } from '@prisma/client';
import ChatInterface from './components/ChatInterface';

const prisma = new PrismaClient();

async function getConversations() {
  const conversations = await prisma.conversation.findMany({
    include: {
      messages: {
        orderBy: { timestamp: 'asc' }
      }
    }
  });
  return conversations;
}

export default async function Home() {
  const conversations = await getConversations();

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-foreground/5 border-b border-foreground/10 py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold font-[family-name:var(--font-geist-sans)]">
            Chat Dashboard
          </h1>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6">
        <ChatInterface initialConversations={conversations} />
      </main>
    </div>
  );
}