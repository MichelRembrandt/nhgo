# nhgo

A small [Model Context Protocol](https://modelcontextprotocol.io) (MCP) server that helps an MCP client such as Claude study Japanese kanji. Given one or more kanji, it returns a prompt that kicks off a breakdown of their meaning and origin.

It runs over stdio or Streamable HTTP and is written in TypeScript.

## Tools

| Tool | Inputs | Description |
| --- | --- | --- |
| `breakdown` | `kanji` | Returns the prompt that starts a breakdown of the meaning and origin of the given kanji. |

`kanji` is a string of 1 to 5 characters.

- With a single kanji, the prompt asks for the meanings of the parts that make up that kanji.
- With several characters (a word), the prompt asks for the meaning of each kanji in the word and of the parts that make up those kanji.

The tool only builds the prompt; the client's model does the actual breakdown.

## Requirements

- Node.js 20.12 or newer
- npm

## Setup

```sh
npm install
npm run build
```

The build compiles `src/` to `build/`.

## Usage

The server supports two transports: stdio (the default, normally launched by an MCP client) and Streamable HTTP.

### Claude Desktop

Add it to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "nhgo": {
      "command": "node",
      "args": ["/absolute/path/to/nhgo/build/index.js"]
    }
  }
}
```

### Claude Code

```sh
claude mcp add nhgo -- node /absolute/path/to/nhgo/build/index.js
```

### HTTP

Start the HTTP server (no build needed, it uses `tsx`):

```sh
npm run start:http
```

It listens on `http://127.0.0.1:3000/nhgo` (localhost only). Set `PORT` to change the port:

```sh
PORT=8080 npm run start:http
```

The server is stateless: each `POST /nhgo` request gets its own server and transport instance. Connect a client to it, for example:

```sh
claude mcp add --transport http nhgo http://127.0.0.1:3000/nhgo
```

### MCP Inspector

```sh
npx @modelcontextprotocol/inspector node build/index.js
```

## Project structure

```
src/
  index.ts    # Entry point: connects the server to a stdio transport
  http.ts     # Entry point: serves the MCP server over Streamable HTTP (Express)
  server.ts   # Builds the MCP server and registers the tools
  nhgo.ts     # Builds the kanji breakdown prompt
```

## Notes

- Logging goes to stderr, since stdout is reserved for the MCP protocol in stdio mode.
