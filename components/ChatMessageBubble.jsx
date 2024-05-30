import Image from "next/image";

const ChatMessageBubble = (props) => {
  const { message, sources } = props;

  const colorClassName =
    message.role === "user" ? "bg-sky-600" : "bg-slate-50 text-black";
  const alignmentClassName = message.role === "user" ? "ml-auto" : "mr-auto";

  return (
    <div
      className={`${alignmentClassName} ${colorClassName} rounded px-4 py-2 max-w-[80%] mb-8 flex`}
    >
      <div className="whitespace-pre-wrap flex flex-col">
        <span>{message.content}</span>
        {sources && sources.length ? (
          <>
            <code className="mt-4 mr-auto bg-slate-600 px-2 py-1 rounded">
              <h2>🔍 Surse:</h2>
            </code>
            <code className="mt-1 mr-2 bg-slate-600 px-2 py-1 rounded text-xs">
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
                    width={400}
                    height={400}
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
