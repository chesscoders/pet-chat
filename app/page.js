"use client";
import { ChatWindow } from "@/components/ChatWindow";

const Page = () => {
  const InfoCard = (
    <div className="p-4 md:p-8 rounded bg-[#25252d] w-full max-h-[85%] overflow-hidden">
      <h1 className="text-3xl md:text-4xl mb-4">Pet chat v 0.1 🐶🔗</h1>
    </div>
  );

  return (
    <ChatWindow
      endpoint={`${process.env.API_BASE_URL}/chat`}
      titleText="Pet Chat"
      placeholder="Iti pot raspunde la intrebari legate de animalutele tale! 🐶🐱🐦"
      emptyStateComponent={InfoCard}
      showIngestForm
    />
  );
};

export default Page;
