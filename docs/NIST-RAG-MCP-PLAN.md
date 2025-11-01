# NIST RAG + MCP Server Integration Plan

## Overview

This document outlines the strategy for integrating the existing NIST_LLM RAG (Retrieval-Augmented Generation) implementation with a Model Context Protocol (MCP) server, enabling the NIST Assistant widget in World Papers to provide evidence-based answers from the NIST SP-800 corpus.

## Current State Analysis

### Existing NIST_LLM Implementation

Located in [NIST_LLM/](../NIST_LLM/) directory:

**Architecture (from BUTLER_LLM_ONBOARDING.md):**
- **Vision**: Local-first assistant with evidence-based answers over NIST SP-800 corpus
- **Services**: Ollama (LLM) + ChromaDB (vectors) + FastAPI (API) + Streamlit (UI)
- **Privacy**: LAN-only by default, no cloud dependencies
- **Status**: 🚧 Partially implemented, RAG pipeline incomplete

**Current Components:**
1. **PDF Processing** ([scripts/txt_processing.py](../NIST_LLM/scripts/txt_processing.py))
   - Extract text and metadata from NIST PDFs
   - Clean and assess text quality
   - Store results in SQLite

2. **Database** ([scripts/store_results.py](../NIST_LLM/scripts/store_results.py))
   - SQLite: `document_results` table
   - Stores: filename, title, cleanliness score, timestamp

3. **Frontend** ([scripts/frontend/app.py](../NIST_LLM/scripts/frontend/app.py))
   - Streamlit UI with search, upload, about pages
   - Connects to SQLite to display documents
   - Basic prototype, no RAG yet

4. **Dependencies** ([requirements.txt](../NIST_LLM/requirements.txt))
   - ✅ `sentence-transformers==2.2.2` - Embeddings
   - ✅ `langchain==0.2.0` - LLM framework
   - ✅ `faiss-cpu` - Vector search
   - ✅ `streamlit==1.40.1` - UI
   - ✅ `fastapi==0.103.1` - API framework

**Missing Implementations:**
- ❌ Text chunking and embedding pipeline
- ❌ FAISS/ChromaDB vector store setup
- ❌ RAG retrieval logic (k-NN search)
- ❌ LLM integration with Ollama
- ❌ Evidence citation formatting
- ❌ API endpoints for Q&A

### World Papers NIST Assistant Widget

Located in [components/widgets/NISTAssistant.tsx](../components/widgets/NISTAssistant.tsx):

**Current Features:**
- Static UI with search input
- Mock glossary terms
- Links to NIST resources
- No live Q&A capability

**Desired Features:**
- Real-time question answering
- Evidence snippets with source citations
- NIST SP-800 context awareness
- Conversation history

## MCP (Model Context Protocol) Overview

### What is MCP?

MCP is Anthropic's protocol for connecting AI assistants to external data sources and tools. It enables:
- **Standardized Interface**: Consistent way for LLMs to access context
- **Resource Management**: Structured access to documents, databases, APIs
- **Tool Execution**: Function calling for actions (search, compute, etc.)
- **Streaming**: Real-time updates for long-running operations

### MCP Server Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    World Papers (Next.js)                    │
│                                                               │
│  ┌──────────────────────┐         ┌──────────────────────┐  │
│  │  NIST Assistant      │────────▶│   MCP Client         │  │
│  │  (React Component)   │         │   (TypeScript SDK)   │  │
│  └──────────────────────┘         └──────────────────────┘  │
│                                            │                  │
└────────────────────────────────────────────┼─────────────────┘
                                             │
                                             │ stdio/HTTP
                                             ▼
                         ┌────────────────────────────────────┐
                         │     MCP Server (Python/Node)      │
                         │                                    │
                         │  ┌──────────────────────────┐      │
                         │  │  Resources:              │      │
                         │  │  - nist://documents      │      │
                         │  │  - nist://glossary       │      │
                         │  └──────────────────────────┘      │
                         │                                    │
                         │  ┌──────────────────────────┐      │
                         │  │  Tools:                  │      │
                         │  │  - search_nist()         │      │
                         │  │  - get_definition()      │      │
                         │  └──────────────────────────┘      │
                         │                                    │
                         └────────────────────────────────────┘
                                             │
                    ┌────────────────────────┼────────────────────────┐
                    ▼                        ▼                        ▼
            ┌──────────────┐        ┌──────────────┐        ┌──────────────┐
            │   FAISS      │        │    Ollama    │        │   SQLite     │
            │ Vector Store │        │  (llama3.1)  │        │   Database   │
            └──────────────┘        └──────────────┘        └──────────────┘
```

## Integration Strategy

### Phase 1: Complete RAG Pipeline (NIST_LLM)

**Goal**: Build missing pieces to create functional RAG system

#### 1.1 Implement Chunking & Embedding

```python
# NIST_LLM/scripts/create_embeddings.py

from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
import sqlite3
from pathlib import Path
import pickle

class NISTEmbedder:
    def __init__(self, db_path: str, vector_store_path: str):
        self.db_path = db_path
        self.vector_store_path = Path(vector_store_path)
        self.model = SentenceTransformer('all-MiniLM-L6-v2')  # Fast, good quality

    def chunk_text(self, text: str, chunk_size: int = 512, overlap: int = 50) -> list[str]:
        """Split text into overlapping chunks for better context"""
        words = text.split()
        chunks = []

        for i in range(0, len(words), chunk_size - overlap):
            chunk = ' '.join(words[i:i + chunk_size])
            if len(chunk) > 100:  # Minimum chunk size
                chunks.append(chunk)

        return chunks

    def process_documents(self):
        """Extract, chunk, and embed all NIST documents"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # Get all documents with text
        cursor.execute("""
            SELECT file_name, metadata_title, full_text
            FROM document_results
            WHERE cleanliness_score > 80
        """)

        documents = []
        embeddings = []
        metadata = []

        for file_name, title, text in cursor.fetchall():
            chunks = self.chunk_text(text)

            for idx, chunk in enumerate(chunks):
                # Create embedding
                embedding = self.model.encode(chunk)

                documents.append(chunk)
                embeddings.append(embedding)
                metadata.append({
                    'file_name': file_name,
                    'title': title,
                    'chunk_id': idx,
                    'total_chunks': len(chunks),
                })

        conn.close()

        # Build FAISS index
        embeddings_array = np.array(embeddings).astype('float32')

        # Use IndexFlatL2 for exact search (good for < 1M vectors)
        dimension = embeddings_array.shape[1]
        index = faiss.IndexFlatL2(dimension)
        index.add(embeddings_array)

        # Save to disk
        self.vector_store_path.mkdir(parents=True, exist_ok=True)

        faiss.write_index(index, str(self.vector_store_path / 'nist.index'))

        with open(self.vector_store_path / 'documents.pkl', 'wb') as f:
            pickle.dump(documents, f)

        with open(self.vector_store_path / 'metadata.pkl', 'wb') as f:
            pickle.dump(metadata, f)

        print(f"✅ Indexed {len(documents)} chunks from {len(set(m['file_name'] for m in metadata))} documents")

# Usage
if __name__ == "__main__":
    embedder = NISTEmbedder(
        db_path='./data/nist_llm.db',
        vector_store_path='./data/vector_store'
    )
    embedder.process_documents()
```

#### 1.2 Implement RAG Retrieval

```python
# NIST_LLM/scripts/rag_search.py

import faiss
import pickle
from sentence_transformers import SentenceTransformer
from pathlib import Path
import numpy as np

class NISTRetriever:
    def __init__(self, vector_store_path: str):
        self.vector_store_path = Path(vector_store_path)
        self.model = SentenceTransformer('all-MiniLM-L6-v2')

        # Load FAISS index
        self.index = faiss.read_index(str(self.vector_store_path / 'nist.index'))

        # Load documents and metadata
        with open(self.vector_store_path / 'documents.pkl', 'rb') as f:
            self.documents = pickle.load(f)

        with open(self.vector_store_path / 'metadata.pkl', 'rb') as f:
            self.metadata = pickle.load(f)

    def search(self, query: str, top_k: int = 5) -> list[dict]:
        """Semantic search over NIST corpus"""
        # Encode query
        query_embedding = self.model.encode([query]).astype('float32')

        # Search FAISS index
        distances, indices = self.index.search(query_embedding, top_k)

        # Format results
        results = []
        for dist, idx in zip(distances[0], indices[0]):
            results.append({
                'text': self.documents[idx],
                'metadata': self.metadata[idx],
                'score': float(1 / (1 + dist)),  # Convert distance to similarity
                'distance': float(dist),
            })

        return results

# Usage
if __name__ == "__main__":
    retriever = NISTRetriever('./data/vector_store')
    results = retriever.search("What are the password requirements for federal systems?")

    for i, result in enumerate(results, 1):
        print(f"\n{i}. {result['metadata']['title']} (chunk {result['metadata']['chunk_id']})")
        print(f"   Score: {result['score']:.3f}")
        print(f"   {result['text'][:200]}...")
```

#### 1.3 Create FastAPI Endpoints

```python
# NIST_LLM/api/main.py

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import sys
sys.path.append('..')

from scripts.rag_search import NISTRetriever

app = FastAPI(title="NIST RAG API", version="0.1.0")

# CORS for World Papers frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://gailp.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize retriever
retriever = NISTRetriever('./data/vector_store')

class QueryRequest(BaseModel):
    query: str
    top_k: Optional[int] = 5

class Evidence(BaseModel):
    text: str
    source: str
    chunk_id: int
    score: float

class QueryResponse(BaseModel):
    query: str
    answer: str
    evidence: list[Evidence]
    model: str

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "nist-rag-api"}

@app.post("/search", response_model=list[Evidence])
async def search_nist(request: QueryRequest):
    """Semantic search endpoint"""
    try:
        results = retriever.search(request.query, request.top_k)

        evidence = [
            Evidence(
                text=r['text'],
                source=r['metadata']['title'],
                chunk_id=r['metadata']['chunk_id'],
                score=r['score']
            )
            for r in results
        ]

        return evidence
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ask", response_model=QueryResponse)
async def ask_nist(request: QueryRequest):
    """RAG Q&A endpoint - returns answer with evidence"""
    try:
        # 1. Retrieve relevant context
        results = retriever.search(request.query, request.top_k)

        # 2. Build context for LLM
        context = "\n\n".join([
            f"[{r['metadata']['title']}]\n{r['text']}"
            for r in results
        ])

        # 3. Generate answer (placeholder - integrate Ollama next)
        answer = f"Based on NIST guidance: {context[:200]}..."

        # 4. Format evidence
        evidence = [
            Evidence(
                text=r['text'][:300] + "...",
                source=r['metadata']['title'],
                chunk_id=r['metadata']['chunk_id'],
                score=r['score']
            )
            for r in results
        ]

        return QueryResponse(
            query=request.query,
            answer=answer,
            evidence=evidence,
            model="nist-rag-0.1"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### Phase 2: Build MCP Server

**Goal**: Wrap RAG API in MCP protocol for standardized access

#### 2.1 Create MCP Server (Python)

```python
# NIST_LLM/mcp/server.py

import asyncio
import json
from typing import Any
from mcp.server import Server, NotificationOptions
from mcp.server.models import InitializationOptions
from mcp.server.stdio import stdio_server
from mcp.types import Resource, Tool, TextContent

from scripts.rag_search import NISTRetriever

# Initialize retriever
retriever = NISTRetriever('../data/vector_store')

# Create MCP server instance
app = Server("nist-assistant")

@app.list_resources()
async def list_resources() -> list[Resource]:
    """List available NIST resources"""
    return [
        Resource(
            uri="nist://documents",
            name="NIST SP-800 Documents",
            description="Collection of NIST Special Publications 800 series",
            mimeType="text/plain"
        ),
        Resource(
            uri="nist://glossary",
            name="NIST Glossary",
            description="Cybersecurity and privacy term definitions",
            mimeType="application/json"
        )
    ]

@app.read_resource()
async def read_resource(uri: str) -> str:
    """Read a specific NIST resource"""
    if uri == "nist://documents":
        # Return list of all indexed documents
        unique_docs = set(m['title'] for m in retriever.metadata)
        return json.dumps(list(unique_docs))

    elif uri == "nist://glossary":
        # Return glossary terms
        # TODO: Extract from NIST glossary document
        return json.dumps({"placeholder": "Glossary goes here"})

    else:
        raise ValueError(f"Unknown resource: {uri}")

@app.list_tools()
async def list_tools() -> list[Tool]:
    """List available tools"""
    return [
        Tool(
            name="search_nist",
            description="Semantic search over NIST SP-800 corpus",
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Search query or question"
                    },
                    "top_k": {
                        "type": "integer",
                        "description": "Number of results to return",
                        "default": 5
                    }
                },
                "required": ["query"]
            }
        ),
        Tool(
            name="get_definition",
            description="Get NIST glossary definition for a term",
            inputSchema={
                "type": "object",
                "properties": {
                    "term": {
                        "type": "string",
                        "description": "Security/privacy term to define"
                    }
                },
                "required": ["term"]
            }
        )
    ]

@app.call_tool()
async def call_tool(name: str, arguments: Any) -> list[TextContent]:
    """Execute a tool"""
    if name == "search_nist":
        query = arguments["query"]
        top_k = arguments.get("top_k", 5)

        results = retriever.search(query, top_k)

        # Format results as text
        output = []
        for i, result in enumerate(results, 1):
            output.append(
                f"{i}. [{result['metadata']['title']}] "
                f"(score: {result['score']:.3f})\n"
                f"{result['text']}\n"
            )

        return [TextContent(
            type="text",
            text="\n".join(output)
        )]

    elif name == "get_definition":
        term = arguments["term"]

        # Search for definition in glossary
        results = retriever.search(f"definition of {term}", top_k=1)

        if results:
            return [TextContent(
                type="text",
                text=f"**{term}**: {results[0]['text']}"
            )]
        else:
            return [TextContent(
                type="text",
                text=f"Definition for '{term}' not found in NIST corpus."
            )]

    else:
        raise ValueError(f"Unknown tool: {name}")

async def main():
    """Run the MCP server"""
    async with stdio_server() as (read_stream, write_stream):
        await app.run(
            read_stream,
            write_stream,
            InitializationOptions(
                server_name="nist-assistant",
                server_version="0.1.0",
                capabilities=app.get_capabilities(
                    notification_options=NotificationOptions(),
                    experimental_capabilities={}
                )
            )
        )

if __name__ == "__main__":
    asyncio.run(main())
```

#### 2.2 MCP Server Configuration

```json
// NIST_LLM/mcp/server-config.json

{
  "mcpServers": {
    "nist-assistant": {
      "command": "python",
      "args": [
        "/path/to/NIST_LLM/mcp/server.py"
      ],
      "env": {
        "PYTHONPATH": "/path/to/NIST_LLM"
      }
    }
  }
}
```

### Phase 3: Integrate MCP Client in World Papers

**Goal**: Connect NIST Assistant widget to MCP server

#### 3.1 Install MCP SDK

```json
// package.json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.5.0"
  }
}
```

#### 3.2 Create MCP Client Wrapper

```typescript
// lib/mcp-client.ts

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

class NISTMCPClient {
  private client: Client | null = null;
  private transport: StdioClientTransport | null = null;

  async connect() {
    // Create stdio transport
    this.transport = new StdioClientTransport({
      command: 'python',
      args: ['/path/to/NIST_LLM/mcp/server.py'],
      env: { PYTHONPATH: '/path/to/NIST_LLM' },
    });

    this.client = new Client(
      {
        name: 'world-papers-nist-client',
        version: '1.0.0',
      },
      {
        capabilities: {},
      }
    );

    await this.client.connect(this.transport);
    console.log('✅ Connected to NIST MCP server');
  }

  async searchNIST(query: string, topK: number = 5) {
    if (!this.client) {
      throw new Error('MCP client not connected');
    }

    const result = await this.client.callTool({
      name: 'search_nist',
      arguments: { query, top_k: topK },
    });

    return result.content[0].text;
  }

  async getDefinition(term: string) {
    if (!this.client) {
      throw new Error('MCP client not connected');
    }

    const result = await this.client.callTool({
      name: 'get_definition',
      arguments: { term },
    });

    return result.content[0].text;
  }

  async listResources() {
    if (!this.client) {
      throw new Error('MCP client not connected');
    }

    return await this.client.listResources();
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      this.client = null;
    }
  }
}

let mcpClient: NISTMCPClient | null = null;

export async function getNISTMCPClient(): Promise<NISTMCPClient> {
  if (!mcpClient) {
    mcpClient = new NISTMCPClient();
    await mcpClient.connect();
  }
  return mcpClient;
}
```

#### 3.3 Create API Route for NIST Queries

```typescript
// app/api/nist/ask/route.ts

import { NextResponse } from 'next/server';
import { getNISTMCPClient } from '@/lib/mcp-client';

export const dynamic = 'force-dynamic';

interface AskRequest {
  query: string;
}

export async function POST(request: Request) {
  try {
    const { query }: AskRequest = await request.json();

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Get MCP client
    const client = await getNISTMCPClient();

    // Search NIST corpus
    const results = await client.searchNIST(query, 3);

    // Parse results (simplified - actual parsing depends on format)
    return NextResponse.json({
      query,
      results,
      source: 'nist-mcp',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('NIST MCP error:', error);

    // Fallback to mock response
    return NextResponse.json({
      query: 'error',
      results: 'NIST Assistant is currently unavailable. Please try again later.',
      source: 'mock',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
```

#### 3.4 Update NIST Assistant Component

```typescript
// components/widgets/NISTAssistant.tsx (add interactive Q&A)

'use client';

import { useState } from 'react';
import { Search, Loader } from 'lucide-react';
import { Card } from '../ui/Card';

export function NISTAssistant() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) return;

    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch('/api/nist/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();
      setResponse(data.results);
    } catch (error) {
      setResponse('Error connecting to NIST Assistant. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">NIST Assistant</h3>

        <form onSubmit={handleSearch} className="mb-4">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about NIST standards..."
              className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-2 top-2 p-2 text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50"
            >
              {loading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
            </button>
          </div>
        </form>

        {response && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-gray-800 whitespace-pre-wrap">
              {response}
            </p>
          </div>
        )}

        {/* Keep existing glossary terms as fallback */}
      </div>
    </Card>
  );
}
```

## Deployment Architecture

### Development Setup

```yaml
# docker-compose.yml (in NIST_LLM/)

version: '3.9'

services:
  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ollama:/root/.ollama
    restart: unless-stopped

  nist-api:
    build: ./api
    ports:
      - "8000:8000"
    volumes:
      - ./data:/app/data
    depends_on:
      - ollama
    environment:
      - OLLAMA_URL=http://ollama:11434
    restart: unless-stopped

  mcp-server:
    build: ./mcp
    volumes:
      - ./data:/app/data
    stdin_open: true
    tty: true
    restart: unless-stopped

volumes:
  ollama:
```

### Production Deployment

**Option 1: Separate Service**
- Deploy NIST_LLM stack on dedicated server/VM
- Expose API at `https://nist-api.worldpapers.com`
- World Papers calls HTTP API instead of MCP stdio

**Option 2: Serverless Functions**
- Package RAG retriever as AWS Lambda / Vercel Function
- Store FAISS index in S3 / Vercel Blob
- Cold start optimization needed (~2-3s)

**Option 3: Embedded (Recommended for MVP)**
- Run MCP server as child process in Next.js API route
- Bundle FAISS index with deployment
- Use in-memory caching for frequently accessed vectors

## Timeline & Milestones

| Phase | Tasks | Duration | Status |
|-------|-------|----------|--------|
| **Phase 1: RAG Pipeline** | | | |
| 1.1 | Implement chunking & embedding | 3-4 hours | ⏳ Pending |
| 1.2 | Build FAISS vector store | 2-3 hours | ⏳ Pending |
| 1.3 | Create RAG retrieval | 2-3 hours | ⏳ Pending |
| 1.4 | FastAPI endpoints | 2 hours | ⏳ Pending |
| **Phase 2: MCP Server** | | | |
| 2.1 | MCP server implementation | 4-5 hours | ⏳ Pending |
| 2.2 | Tool definitions | 1-2 hours | ⏳ Pending |
| 2.3 | Testing & debugging | 2-3 hours | ⏳ Pending |
| **Phase 3: Integration** | | | |
| 3.1 | MCP client wrapper | 2-3 hours | ⏳ Pending |
| 3.2 | World Papers API routes | 1-2 hours | ⏳ Pending |
| 3.3 | Update NIST Assistant UI | 2-3 hours | ⏳ Pending |
| 3.4 | E2E testing | 2-3 hours | ⏳ Pending |
| **Total** | | **25-36 hours** | Across 4-5 sessions |

## Risk Assessment

### High Risk
- **MCP Protocol Maturity**: SDK still in beta (v0.5.0)
  - Mitigation: Build REST fallback API in parallel

### Medium Risk
- **Vector Index Size**: NIST corpus could be 50-100MB
  - Mitigation: Use quantization, smaller embedding model

- **Cold Start Latency**: First query may take 3-5 seconds
  - Mitigation: Pre-warm index, implement caching

### Low Risk
- **Ollama Dependency**: Requires separate service
  - Mitigation: Can use OpenAI API as fallback

## Success Criteria

- [ ] NIST corpus fully indexed (all SP-800 PDFs)
- [ ] RAG retrieval returns relevant results (>70% accuracy)
- [ ] MCP server responds to search_nist tool calls
- [ ] World Papers NIST Assistant provides live answers
- [ ] Response time < 3 seconds for typical queries
- [ ] Evidence citations include source document names
- [ ] Fallback to mock data when MCP unavailable
- [ ] No performance regression on homepage

## Future Enhancements

### Short-term
- [ ] Conversation history (multi-turn Q&A)
- [ ] Glossary term autocomplete
- [ ] Export Q&A as markdown report
- [ ] Highlighted evidence snippets

### Long-term
- [ ] Multi-modal RAG (include diagrams, tables)
- [ ] Fine-tuned model on NIST Q&A pairs
- [ ] Integration with FreshRSS (policy context)
- [ ] Collaborative filtering (trending questions)
- [ ] API key authentication for public access

## Resources

### Documentation
- [MCP Protocol Specification](https://spec.modelcontextprotocol.io/)
- [MCP Python SDK](https://github.com/modelcontextprotocol/python-sdk)
- [LangChain RAG Tutorial](https://python.langchain.com/docs/use_cases/question_answering/)
- [FAISS Documentation](https://faiss.ai/)

### NIST Resources
- [NIST SP 800 Series](https://csrc.nist.gov/publications/sp800)
- [NIST Glossary](https://csrc.nist.gov/glossary)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

---

**Document Version**: 1.0
**Last Updated**: 2025-10-31
**Owner**: World Papers Team
