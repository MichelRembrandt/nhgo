# nhgo

A small [Model Context Protocol](https://modelcontextprotocol.io) (MCP) server that helps an MCP client such as Claude study Japanese kanji. It can break down kanji, look words up on Jisho, and add flashcards to Anki.

It runs over stdio or Streamable HTTP and is written in TypeScript.

## Tools

| Tool | Inputs | Description |
| --- | --- | --- |
| `breakdown` | `kanji` | Returns the prompt that starts a breakdown of the meaning and origin of the given kanji, enriched with Jisho data. |
| `lookup` | `word` | Looks up a Japanese word on [Jisho](https://jisho.org) and returns the raw result as JSON. |
| `add_to_anki` | `deck`, `japanese`, `emoji`, `reading`, `translation` | Adds a Basic card (front: Japanese, back: emoji, reading, translation) to an Anki deck, creating the deck if needed. |

### `breakdown`

`kanji` is a string of 1 to 5 characters.

- With a single kanji, the prompt asks for the meanings of the parts that make up that kanji.
- With several characters (a word), the prompt asks for the meaning of each kanji in the word and of the parts that make up those kanji.

The tool only builds the prompt; the client's model does the actual breakdown. If Jisho can't be reached, the prompt tells the model to rely on its own knowledge.

### `add_to_anki`

Requires Anki to be running with the [AnkiConnect](https://ankiweb.net/shared/info/2055492159) add-on (listening on `127.0.0.1:8765`). Duplicate cards within a deck are rejected.

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
npm run http
```

It listens on `http://127.0.0.1:3000/mcp` (localhost only). Set `PORT` to change the port:

```sh
PORT=8080 npm run http
```

The server is stateless: each `POST /mcp` request gets its own server and transport instance. Connect a client to it, for example:

```sh
claude mcp add --transport http nhgo http://127.0.0.1:3000/mcp
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
  jisho.ts    # Jisho API client
  anki.ts     # AnkiConnect client
```

## Notes

- Logging goes to stderr, since stdout is reserved for the MCP protocol in stdio mode.
