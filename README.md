# @indiavenkatesh/mcp

A monorepo of MCP (Model Context Protocol) servers — plug-and-play tools that give LLMs real-world capabilities.

## Packages

| Package | Description | Status |
|---------|-------------|--------|
| [`@indiavenkatesh/mcp-threejs`](./packages/threejs-mcp) | Generate Three.js 3D animations from natural language | ✅ |

> More servers coming soon.

## What is MCP?

[Model Context Protocol](https://modelcontextprotocol.io) is an open standard by Anthropic that lets LLMs securely call external tools, read resources, and follow guided prompts. Each package in this repo is a self-contained MCP server you can wire into Claude Desktop, Cursor, Windsurf, VS Code, or any other MCP-compatible client.

## Getting Started

```bash
git clone https://github.com/indiavenkatesh/mcp.git
cd mcp

# Install deps for a specific package
cd packages/threejs-mcp
npm install
node src/index.js
```

## Adding to Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS):

```json
{
  "mcpServers": {
    "threejs": {
      "command": "node",
      "args": ["/absolute/path/to/mcp/packages/threejs-mcp/src/index.js"]
    }
  }
}
```

Restart Claude Desktop — the tools will appear automatically.

## Contributing

Each MCP server lives in `packages/<name>/`. To add a new one:

1. `mkdir packages/your-mcp && cd packages/your-mcp`
2. Create `src/index.js` using `@modelcontextprotocol/sdk`
3. Add a `README.md` and `package.json`
4. Update the packages table in this README
