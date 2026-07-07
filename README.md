# Semantic Profile Chat

Semantic Profile Chat is a small React and Express application that answers questions from a local JSON knowledge base using semantic search.

The API embeds the questions from `server/data/data-model.json` with Ollama, compares the user's question against those embeddings, and returns the best matching answer when the score is high enough.

## Stack

- React, TypeScript, and Vite for the web UI
- Express and TypeScript for the API
- Ollama for local text embeddings
- `nomic-embed-text` as the default embedding model
- Docker Compose for running the full app

## Project Structure

```txt
.
|-- docker-compose.yml          # Production-style local stack
|-- docker-compose.dev.yml      # Development override for the web service
|-- Makefile                    # Common Docker Compose commands
|-- server/
|   |-- data/
|   |   |-- data-model.json
|   |   `-- data-model.example.json
|   `-- src/
|       |-- config.ts
|       |-- data.ts
|       |-- index.ts
|       |-- ollama.ts
|       |-- semantic-index.ts
|       `-- similarity.ts
`-- web/
    `-- src/
        `-- App.tsx
```

## Quick Start

The easiest way to run the whole project is with Docker Compose:

```sh
make up
```

Then open:

```txt
http://localhost:8080
```

On first startup, Compose pulls the Ollama embedding model into the `ollama-data` volume. This can take a little while.

To watch logs while developing:

```sh
make dev
```

The development web server is available at:

```txt
http://localhost:8081
```

Stop the containers with:

```sh
make down
```

## How It Works

1. The API reads `server/data/data-model.json` at startup.
2. The data file is validated with Zod.
3. Each stored question is embedded through Ollama.
4. The API keeps those embeddings in memory as a semantic index.
5. When a user submits a question, the API embeds that question.
6. The API compares the query embedding with the stored question embeddings using cosine similarity.
7. If the best score is above `MATCH_THRESHOLD`, the matching answer is returned.
8. Otherwise, the API returns a fallback message and suggested related questions.

## API Endpoints

### `GET /api/health`

Returns a readiness response with the number of answers and indexed questions.

Example response:

```json
{
  "status": "ready",
  "answers": 21,
  "questions": 63
}
```

### `GET /api/sample-questions`

Returns sample questions used by the UI placeholder animation.

Example response:

```json
{
  "questions": ["Tell me about Switzerland?"]
}
```

### `POST /api/query`

Accepts a user question.

Example request:

```json
{
  "question": "What languages are spoken in Switzerland?"
}
```

Matched response:

```json
{
  "matched": true,
  "answer": "Switzerland has four national languages: German, French, Italian, and Romansh..."
}
```

Fallback response:

```json
{
  "matched": false,
  "message": "I could not find a reliable answer.",
  "suggestions": ["What languages are spoken in Switzerland?"]
}
```

## Editing the Data Model

The main knowledge base lives in:

```txt
server/data/data-model.json
```

Each entry must follow this shape:

```json
{
  "id": "switzerland-languages",
  "title": "Languages of Switzerland",
  "questions": [
    "What languages are spoken in Switzerland?",
    "What are Switzerland's official languages?"
  ],
  "answer": "Switzerland has four national languages: German, French, Italian, and Romansh.",
  "tags": ["switzerland", "languages"]
}
```

Rules enforced at startup:

- The file must contain a non-empty JSON array.
- Every record must have a non-empty `id`, `title`, `questions`, and `answer`.
- `questions` must contain at least one non-empty string.
- `id` values must be unique.
- `tags` are optional, but each tag must be a non-empty string.

After editing the data model, restart the API so it rebuilds the semantic index:

```sh
make restart
```

## Configuration

The API reads these environment variables:

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `3000` | API port |
| `OLLAMA_URL` | `http://localhost:11434` | Ollama server URL |
| `EMBEDDING_MODEL` | `nomic-embed-text` | Ollama embedding model |
| `DATA_MODEL_PATH` | `server/data/data-model.json` | Path to the JSON knowledge base |
| `MATCH_THRESHOLD` | `0.6` | Minimum similarity score required to return an answer |
| `QUERY_MAX_LENGTH` | `500` | Maximum accepted user question length |
| `SUGGESTION_COUNT` | `3` | Number of suggestions returned for weak matches |

Docker Compose sets these values for the containerized API in `docker-compose.yml`.

## Useful Commands

```sh
make help          # Show available commands
make up            # Start the full stack in the background
make dev           # Start the stack with development web server and logs
make status        # Show container status
make logs          # Follow all service logs
make logs-api      # Follow API logs
make logs-web      # Follow web logs
make logs-ollama   # Follow Ollama logs
make config        # Validate and render Compose configuration
make build         # Build images
make rebuild       # Rebuild and recreate services
make down          # Stop and remove containers
make reset         # Remove containers and volumes, including downloaded models
```

## Notes

- The semantic index is kept in memory and rebuilt when the API starts.

## Future Improvements

- Store the semantic index in Redis or another external service instead of keeping it only in memory. The current in-memory index is simple, but it is a limitation because it has to be rebuilt whenever the API starts and cannot be shared across multiple API instances. Plus as the data grows in size, the more memory the app uses.
