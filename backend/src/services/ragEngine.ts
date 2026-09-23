export interface DocumentChunk {
  id: string;
  docId: string;
  title: string;
  content: string;
  tokenCount: number;
  score?: number;
}

export interface IngestedDocument {
  id: string;
  title: string;
  sourceType: 'text' | 'pdf' | 'slides' | 'notes';
  rawContent: string;
  chunks: DocumentChunk[];
  createdAt: string;
}

class RagEngine {
  private documents: Map<string, IngestedDocument> = new Map();
  private allChunks: DocumentChunk[] = [];

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2);
  }

  private splitIntoChunks(text: string, title: string, docId: string): DocumentChunk[] {
    const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
    const chunks: DocumentChunk[] = [];
    let currentChunk = '';
    let chunkIndex = 0;

    for (const para of paragraphs) {
      if ((currentChunk + ' ' + para).length > 800) {
        if (currentChunk.trim().length > 0) {
          chunks.push({
            id: `${docId}-chunk-${chunkIndex}`,
            docId,
            title,
            content: currentChunk.trim(),
            tokenCount: this.tokenize(currentChunk).length
          });
          chunkIndex++;
        }
        currentChunk = para;
      } else {
        currentChunk = currentChunk ? `${currentChunk}\n\n${para}` : para;
      }
    }

    if (currentChunk.trim().length > 0) {
      chunks.push({
        id: `${docId}-chunk-${chunkIndex}`,
        docId,
        title,
        content: currentChunk.trim(),
        tokenCount: this.tokenize(currentChunk).length
      });
    }

    if (chunks.length === 0 && text.trim().length > 0) {
      chunks.push({
        id: `${docId}-chunk-0`,
        docId,
        title,
        content: text.trim(),
        tokenCount: this.tokenize(text).length
      });
    }

    return chunks;
  }

  public ingestDocument(title: string, rawContent: string, sourceType: 'text' | 'pdf' | 'slides' | 'notes' = 'notes'): IngestedDocument {
    const docId = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const chunks = this.splitIntoChunks(rawContent, title, docId);

    const doc: IngestedDocument = {
      id: docId,
      title,
      sourceType,
      rawContent,
      chunks,
      createdAt: new Date().toISOString()
    };

    this.documents.set(docId, doc);
    this.refreshAllChunks();
    return doc;
  }

  private refreshAllChunks(): void {
    const combined: DocumentChunk[] = [];
    for (const doc of this.documents.values()) {
      combined.push(...doc.chunks);
    }
    this.allChunks = combined;
  }

  public getAllDocuments(): IngestedDocument[] {
    return Array.from(this.documents.values());
  }

  public getDocument(id: string): IngestedDocument | undefined {
    return this.documents.get(id);
  }

  public deleteDocument(id: string): boolean {
    const deleted = this.documents.delete(id);
    if (deleted) {
      this.refreshAllChunks();
    }
    return deleted;
  }

  public search(query: string, topK: number = 4): DocumentChunk[] {
    const queryTokens = this.tokenize(query);
    if (queryTokens.length === 0 || this.allChunks.length === 0) {
      return [];
    }

    const queryTokenSet = new Set(queryTokens);
    const scored = this.allChunks.map((chunk) => {
      const chunkTokens = this.tokenize(chunk.content);
      const chunkTokenSet = new Set(chunkTokens);

      let intersectionCount = 0;
      for (const token of queryTokenSet) {
        if (chunkTokenSet.has(token)) {
          intersectionCount++;
        }
      }

      const exactMatchBonus = chunk.content.toLowerCase().includes(query.toLowerCase()) ? 2.5 : 0;
      const jaccard = intersectionCount / (queryTokenSet.size + chunkTokenSet.size - intersectionCount || 1);
      const score = jaccard * 10 + exactMatchBonus;

      return {
        ...chunk,
        score: Math.round(score * 100) / 100
      };
    });

    return scored
      .filter((c) => (c.score || 0) > 0.05)
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, topK);
  }
}

export const ragEngine = new RagEngine();
