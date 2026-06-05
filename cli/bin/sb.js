#!/usr/bin/env node
import { program } from "commander";
import { registerSearch } from "../src/commands/search.js";
import { registerQuery } from "../src/commands/query.js";
import { registerTopics } from "../src/commands/topics.js";
import { registerCompare } from "../src/commands/compare.js";
import { registerContext } from "../src/commands/context.js";
import { registerNew } from "../src/commands/new.js";
import { registerServe } from "../src/commands/serve.js";

program
  .name("sb")
  .description("Super Brain — query your personal knowledge base from the terminal")
  .version("0.1.0");

registerSearch(program);
registerQuery(program);
registerCompare(program);
registerContext(program);
registerTopics(program);
registerNew(program);
registerServe(program);

program
  .command("mcp-serve")
  .description("Start the MCP server (stdio transport, for AI agent integration)")
  .action(async () => {
    const { startMcpServer } = await import("../src/mcp/server.js");
    await startMcpServer();
  });

program.parse();
