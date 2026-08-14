const extensionRoot = "C:/Users/Ghost/AppData/Local/Programs/Nimbalyst/resources/extensions/gemini-antigravity";
const backendModule = await import(`file:///${extensionRoot}/dist/agent.js`);

const context = {
  runtimeContext: {
    extensionId: "gemini-antigravity",
    extensionPath: extensionRoot,
    logger: console,
  },
  services: {
    logRaw: async () => {},
    devToolExecutor: async () => "Tools are disabled during this connection test.",
    toolExecutor: async () => "Tools are disabled during this connection test.",
  },
};

const backend = await backendModule.activate(context);

async function testModel(model, expected) {
  const sessionId = `connection-test-${model}`;
  await backend.methods.createSession({
    sessionId,
    workspacePath: "C:/Users/Ghost/Documents/Health-Intelligence-OS",
    model: `antigravity-gemini-agent:${model}`,
    systemPrompt: "Return only the exact token requested by the user.",
    tools: [],
  });

  let combined = "";
  for await (const event of backend.methods.sendMessage({
    sessionId,
    message: `Reply with exactly ${expected}`,
    tools: [],
  })) {
    if (typeof event.text === "string") combined += event.text;
    if (typeof event.content === "string") combined += event.content;
    if (event.type === "error") throw new Error(event.error);
  }

  backend.methods.cleanupSession(sessionId);
  if (!combined.includes(expected)) {
    throw new Error(`${model} returned an unexpected response: ${combined}`);
  }

  console.log(`${model}=OK`);
}

await testModel("gemini-3.7-flash-tiered", "NIMBALYST_37_OK");
await testModel("gemini-pro-agent", "NIMBALYST_31_PRO_OK");
