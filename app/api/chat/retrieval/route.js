import { NextResponse } from "next/server";
import { StreamingTextResponse } from "ai";

import { createClient } from "@supabase/supabase-js";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { RunnableSequence } from "@langchain/core/runnables";
import {
  BytesOutputParser,
  StringOutputParser,
} from "@langchain/core/output_parsers";

export const runtime = "edge";

const combineDocumentsFn = (docs) => {
  const serializedDocs = docs.map((doc) => doc.pageContent);
  return serializedDocs.join("\n\n");
};

const formatVercelMessages = (chatHistory) => {
  const formattedDialogueTurns = chatHistory.map((message) => {
    if (message.role === "user") {
      return `Human: ${message.content}`;
    } else if (message.role === "assistant") {
      return `Assistant: ${message.content}`;
    } else {
      return `${message.role}: ${message.content}`;
    }
  });
  return formattedDialogueTurns.join("\n");
};

const CONDENSE_QUESTION_TEMPLATE = `Având în vedere următoarea conversație, detaliile despre animalul de companie și o întrebare ulterioară, reformulează întrebarea ulterioară pentru a fi o întrebare independentă în română.

<chat_history>
  {chat_history}
</chat_history>

<pet_details>
  {pet_details}
</pet_details>

Întrebare ulterioară: {question}`;

const condenseQuestionPrompt = PromptTemplate.fromTemplate(
  CONDENSE_QUESTION_TEMPLATE,
);

const ANSWER_TEMPLATE = `Ești un cățeluș energic pe nume Marta și trebuie să răspunzi la toate întrebările în română ca un câine fericit care vorbește. Folosește jocuri de cuvinte uneori, dar nu prea des. Asigură-te că răspunzi doar în română și nu recomanzi mai mult de 2 produse.

Răspunde la întrebare bazându-te doar pe următorul context, istoric al conversației și detalii despre animalul de companie:

<context>
  {context}
</context>
<chat_history>
{chat_history}
</chat_history>

<pet_details>
  {pet_details}
</pet_details>

Instrucțiuni suplimentare:

- Nu recomanda produse pentru pui dacă vârsta este peste 12 luni.
- Recomandă produse pentru pui dacă vârsta este sub 12 luni.
- Nu recomanda produse care conțin cuvântul "adult" în titlu dacă vârsta este sub 12 luni.
- Menționează doar produsele relevante pentru specia, rasa, vârsta, sexul și problemele de sănătate menționate în detaliile despre animalul de companie.
- Nu face recomandări dacă nu ai suficiente informații.
- Răspunde întotdeauna în română.

Întrebare: {question}
`;
const answerPrompt = PromptTemplate.fromTemplate(ANSWER_TEMPLATE);

export async function POST(req) {
  try {
    const body = await req.json();
    const petDetails = body.petDetails;
    const messages = body.messages ?? [];
    const previousMessages = messages.slice(0, -1);
    const currentMessageContent = messages[messages.length - 1].content;

    const model = new ChatOpenAI({
      modelName: "gpt-4o",
      temperature: 0.2,
    });

    const client = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_PRIVATE_KEY,
    );
    const vectorstore = new SupabaseVectorStore(new OpenAIEmbeddings(), {
      client,
      tableName: "documents",
      queryName: "match_documents",
    });

    const standaloneQuestionChain = RunnableSequence.from([
      condenseQuestionPrompt,
      model,
      new StringOutputParser(),
    ]);

    let resolveWithDocuments;
    const documentPromise = new Promise((resolve) => {
      resolveWithDocuments = resolve;
    });

    const retriever = vectorstore.asRetriever({
      k: 2,
      callbacks: [
        {
          handleRetrieverEnd(documents) {
            resolveWithDocuments(documents);
          },
        },
      ],
    });

    const retrievalChain = retriever.pipe(combineDocumentsFn);

    const answerChain = RunnableSequence.from([
      {
        context: RunnableSequence.from([
          (input) => input.question,
          retrievalChain,
        ]),
        chat_history: (input) => input.chat_history,
        pet_details: (input) => input.pet_details,
        question: (input) => input.question,
      },
      answerPrompt,
      model,
    ]);

    const conversationalRetrievalQAChain = RunnableSequence.from([
      {
        question: standaloneQuestionChain,
        chat_history: (input) => input.chat_history,
        pet_details: (input) => input.pet_details,
      },
      answerChain,
      new BytesOutputParser(),
    ]);

    const stream = await conversationalRetrievalQAChain.stream({
      question: currentMessageContent,
      chat_history: formatVercelMessages(previousMessages),
      pet_details: petDetails,
    });

    const documents = await documentPromise;

    const serializedSources = Buffer.from(
      JSON.stringify(
        documents.map((doc) => {
          return {
            pageContent: `${doc.metadata.name}\n${doc.metadata.shortDescription}`,
            metadata: doc.metadata,
          };
        }),
      ),
    ).toString("base64");

    return new StreamingTextResponse(stream, {
      headers: {
        "x-message-index": (previousMessages.length + 1).toString(),
        "x-sources": serializedSources,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}

export default POST;
