import Image from "next/image";
import { savePetDetails } from "../lib";
import { useState } from "react";
import Markdown from 'react-markdown'

const ChatMessageBubble = (props) => {
  const { message, sources, setIsConversationOver } = props;
  const [showSources, setShowSources] = useState(false);
  
  const colorClassName =
    message.role === "user" ? "bg-sky-600" : "bg-slate-50 text-black";
  const alignmentClassName = message.role === "user" ? "ml-auto" : "mr-auto";

  const checkForFinalMessage = (message) => {
    return message.content.includes("următoarea etapă");
  };

  const isFinalMessage = checkForFinalMessage(message);

  if (isFinalMessage) {
    savePetDetails(message.content);
    setIsConversationOver(true);
  }

  return (
    <div
      className={`${alignmentClassName} ${colorClassName} rounded px-4 py-2 max-w-[80%] mb-8 flex`}
    >
      <div className="flex flex-col">
        <div onClick={(() => setShowSources(prev => !prev))}><Markdown className='cursor-pointer'>{message.content}</Markdown></div>
        {isFinalMessage && (
          <a
            href="/retrieval"
            className="inline-block px-6 py-2 text-xs font-medium leading-6 text-center text-white uppercase transition bg-blue-700 rounded shadow ripple hover:shadow-lg hover:bg-blue-800 focus:outline-none"
          >
            Vezi produsele recomandate
          </a>
        )}
        {/* {sources && sources.length ? ( */}
        {sources && sources.length && showSources ? (
          <>
            <code className="mt-4 mr-auto bg-slate-600 px-2 py-1 rounded">
              <h2>🔍 Surse:</h2>
            </code>
            <code className="mt-1 mr-2 bg-slate-600 px-2 py-1 rounded text-xs flex gap-8">
              {sources.map((source, i) => (
                <div className="mt-2" key={"source:" + i}>
                  {(function () {
                    // Split the pageContent on the '\n' character to get the title and the rest of the content
                    const [title, ...restOfContent] =
                      source.pageContent.split("\n");
                    return (
                      <>
                        <a
                          href={source.metadata?.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white underline hover:no-decoration"
                        >
                          {i + 1}. &quot;{title}&quot;
                        </a>
                        <p>{restOfContent.join("\n")}</p>
                      </>
                    );
                  })()}
                  {source.metadata?.loc?.lines !== undefined ? (
                    <div>
                      <br />
                      Lines {source.metadata?.loc?.lines?.from} to{" "}
                      {source.metadata?.loc?.lines?.to}
                    </div>
                  ) : (
                    ""
                  )}
                  <Image
                    src={source.metadata?.image}
                    alt="image"
                    width={250}
                    height={250}
                  />
                </div>
              ))}
            </code>
          </>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default ChatMessageBubble;
