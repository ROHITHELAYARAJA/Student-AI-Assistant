import { ragEngine } from './ragEngine.js';

export interface DeepExplanationResult {
  title: string;
  explanation: string;
  category: string;
  keyPoints: string[];
  codeExample?: string;
  examTip?: string;
}

// Ingest foundational CS, ML, DL, RAG, and Systems knowledge into RAG on startup
export function initializeCoreRagKnowledge(): void {
  // 1. Git & GitHub
  ragEngine.ingestDocument(
    'Git & GitHub Architecture',
    `Git is a distributed version control system (DVCS) created by Linus Torvalds in 2005. It tracks changes in source code across time via an immutable directed acyclic graph (DAG) of commit objects. Every commit represents a cryptographic snapshot of the repository state identified by a SHA-1/SHA-256 hash.
GitHub is a cloud-hosted platform built on top of Git. While Git handles local branching, tracking, and merging, GitHub provides centralized collaboration infrastructure: remote repository hosting, Pull Requests (PRs) with inline code review, Issue tracking, GitHub Actions (automated CI/CD pipelines), Forking workflows, and Branch Protection rules.
Key Git Operations:
- git clone: clones a remote repo locally.
- git branch & checkout: manages non-linear development threads.
- git add & commit: stages changes to the index and records a snapshot.
- git push & pull: syncs local commits with remote GitHub refs.`,
    'notes'
  );

  // 2. Machine Learning & Deep Learning
  ragEngine.ingestDocument(
    'Machine Learning & Deep Learning Foundations',
    `Machine Learning (ML) algorithms build mathematical models based on sample training data to make predictions or decisions without being explicitly programmed. Deep Learning (DL) is a subset of ML based on Artificial Neural Networks with multiple representation layers (hierarchical feature learning).
Core Concepts:
- Neural Network Forward Pass: Computes linear transformations z = Wx + b followed by non-linear activations (ReLU, GELU, Sigmoid) across layers.
- Loss Functions: Measures error between predictions and ground-truth targets (e.g., Cross-Entropy Loss for classification, Mean Squared Error for regression).
- Backpropagation & Gradient Descent: Computes partial derivatives of the loss with respect to all weights using the calculus chain rule (dL/dW). Optimizers (SGD, Adam, AdamW) update weights: W = W - alpha * dL/dW.
- Overfitting Mitigation: Dropout, Weight Decay (L2 regularization), Data Augmentation, and Early Stopping.`,
    'notes'
  );

  // 3. RAG & LLM Architectures
  ragEngine.ingestDocument(
    'RAG & Large Language Model Architecture',
    `Retrieval-Augmented Generation (RAG) combines dense semantic retrieval with parametric generative LLMs to ground AI outputs in verified external knowledge, eliminating hallucinations and enabling real-time domain awareness.
RAG Pipeline Architecture:
1. Ingestion & Chunking: Source documents (PDFs, Markdown, docs) are split into semantic chunks (e.g. 500-1000 tokens) with sliding window overlap.
2. Embedding Generation: Each chunk is passed through an embedding model (e.g. text-embedding-004, Titan Embeddings) to produce high-dimensional dense vectors (e.g., 768 or 1536 dimensions).
3. Vector Indexing & Search: Vectors are indexed in vector stores (Pinecone, Milvus, pgvector). At query time, user input is embedded and top-K nearest neighbors are retrieved using Cosine Similarity or Dot Product.
4. Context Injection & Prompt Synthesis: Retrieved chunks are prepended to the LLM system prompt as verified grounding evidence before response synthesis.`,
    'notes'
  );

  // 4. Operating Systems & Concurrency
  ragEngine.ingestDocument(
    'Operating Systems Concurrency & Deadlocks',
    `Deadlock in operating systems is a condition where a set of concurrent processes are permanently blocked because each process holds a resource and waits for another resource held by another process in the same set.
The 4 Coffman Conditions (Must all hold simultaneously for a deadlock):
1. Mutual Exclusion: At least one resource is held in a non-shareable mode.
2. Hold and Wait: A process currently holding at least one resource is requesting additional resources held by other processes.
3. No Preemption: Resources cannot be forcibly taken from a process holding them; they must be released voluntarily.
4. Circular Wait: A closed chain of processes exists such that P0 waits for P1, P1 waits for P2, ..., Pn waits for P0.
Deadlock Prevention involves invalidating at least one of these four conditions (e.g., imposing global resource ordering to break circular wait). Deadlock Avoidance uses dynamic state inspection such as Dijkstra's Banker's Algorithm.`,
    'notes'
  );
}

// Run initial ingestion immediately
initializeCoreRagKnowledge();

export function synthesizeDeepExplanation(topic: string, userQuery: string): DeepExplanationResult {
  const query = userQuery.toLowerCase().trim();
  const cleanTopic = topic.trim();
  const lowerTopic = cleanTopic.toLowerCase();

  // Search RAG context
  const ragResults = ragEngine.search(userQuery + ' ' + topic, 3);
  const ragContext = ragResults.map((r) => r.content).join('\n');

  // Check specific domain matches
  if (lowerTopic.includes('git hub') || lowerTopic.includes('github') || query.includes('github') || query.includes('git hub')) {
    return {
      title: 'GitHub & Git Version Control System',
      category: 'Software Engineering & DevOps',
      explanation: `**GitHub** is the world's leading cloud-based platform for software development, code hosting, and version control using **Git**.

### 1. The Core Difference: Git vs. GitHub
• **Git** is the local command-line tool (created by Linus Torvalds in 2005) that tracks historical changes, branches, and merges on your own computer.
• **GitHub** is the cloud platform that hosts Git repositories online, allowing teams across the world to collaborate, review code, and deploy software together.

### 2. Foundational Concepts Every Developer Needs
1. **Repository (Repo)**: A project folder containing all your files and the complete commit history tracked by Git.
2. **Commit**: A permanent cryptographic snapshot of your code at a specific point in time, identified by a unique SHA hash.
3. **Branching**: Parallel lines of development (e.g., \`main\`, \`feature/login\`, \`bugfix/auth\`) that let you write code without breaking production.
4. **Pull Request (PR)**: The core collaboration mechanism. When your feature is ready, you submit a PR for teammates to review, comment on diffs, and approve before merging.
5. **Merge & Conflict Resolution**: Combining changes from one branch into another. If two developers edit the same lines, Git highlights the conflict for manual resolution.

### 3. Advanced Ecosystem: CI/CD & Automation
• **GitHub Actions**: Automated CI/CD pipelines that trigger on push or PR to run unit tests, lint checks, build Docker containers, and deploy to AWS, Vercel, or Kubernetes.
• **Forking**: Creating an independent copy of another user's open-source repository to propose upstream contributions.
• **Issues & Project Boards**: Agile Kanban project management directly integrated with commits and PRs.`,
      keyPoints: [
        'Git is the local version control engine; GitHub is the cloud collaboration and DevOps platform.',
        'Pull Requests provide structured code review, CI/CD verification, and branch protection before merging.',
        'GitHub Actions automates testing, container builds, and cloud deployments on every push.',
        'Branching allows multiple engineers to work concurrently without interfering with production code.'
      ],
      codeExample: `# Standard GitHub Workflow
git clone https://github.com/username/repo.git
cd repo
git checkout -b feature/dynamic-learning-path
# make code edits...
git add .
git commit -m "feat: add interactive learning path and quiz"
git push origin feature/dynamic-learning-path
# Now open a Pull Request on GitHub to review and merge!`,
      examTip: 'Remember for software engineering exams: Git uses a Directed Acyclic Graph (DAG) of commits with content-addressable storage.'
    };
  }

  // Machine Learning / Deep Learning / Neural Networks
  if (
    lowerTopic.includes('machine learning') ||
    lowerTopic.includes('deep learning') ||
    lowerTopic.includes('neural network') ||
    lowerTopic.includes('gradient descent') ||
    lowerTopic.includes('backpropagation') ||
    query.includes('neural') ||
    query.includes('machine learning') ||
    query.includes('deep learning')
  ) {
    return {
      title: `${cleanTopic} — Machine Learning & Deep Learning Mastery`,
      category: 'Artificial Intelligence & Machine Learning',
      explanation: `**${cleanTopic}** is a cornerstone of modern Artificial Intelligence and Deep Neural Architectures.

### 1. Mathematical & Theoretical Framework
Artificial neural networks learn continuous representations through parameterized transformations:
$$z^{[l]} = W^{[l]} a^{[l-1]} + b^{[l]}$$
$$a^{[l]} = \\sigma(z^{[l]})$$
where $W^{[l]}$ is the weight tensor, $b^{[l]}$ is the bias, and $\\sigma$ is a non-linear activation function (e.g., **ReLU**, **GELU**, or **Swish**) that enables the network to approximate arbitrary non-linear functions (Universal Approximation Theorem).

### 2. The Learning Loop: Optimization via Backpropagation
1. **Forward Propagation**: Input tensors cascade through successive hidden layers to compute the output prediction $\\hat{y}$.
2. **Objective Loss Calculation**: Computes error against ground truth using loss functions like Cross-Entropy $\\mathcal{L}(y, \\hat{y}) = -\\sum y_i \\log(\\hat{y}_i)$.
3. **Backward Propagation (Backprop)**: Uses the calculus chain rule to compute exact partial gradients $\\frac{\\partial \\mathcal{L}}{\\partial W}$ across all computational nodes.
4. **Parameter Update**: Optimizers (**SGD with Momentum**, **AdamW**) adjust weights along the negative gradient vector:
$$W \\leftarrow W - \\eta \\cdot \\frac{\\partial \\mathcal{L}}{\\partial W}$$

### 3. Practical Architecture & Generalization Guarantees
• **Overfitting Prevention**: Regularize using **Weight Decay** (L2 penalty), **Dropout** (stochastic neuron deactivation during training), and **Layer Normalization**.
• **Learning Rate Scheduling**: Utilize cosine annealing with warm-up steps to avoid getting trapped in poor local saddle points.`,
      keyPoints: [
        'Non-linear activations (ReLU, GELU) prevent deep networks from collapsing into a single linear matrix multiplication.',
        'Backpropagation efficiently calculates the gradient of the loss function using recursive chain rule application.',
        'AdamW combines adaptive learning rates for each parameter with decoupled weight decay regularization.',
        'Batch Normalization and Residual Skip Connections (ResNets) solve the vanishing gradient problem in deep models.'
      ],
      codeExample: `# PyTorch Deep Learning Training Step
import torch
import torch.nn as nn

model = nn.Sequential(nn.Linear(128, 64), nn.ReLU(), nn.Linear(64, 10))
optimizer = torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-2)
criterion = nn.CrossEntropyLoss()

# Training loop step
optimizer.zero_grad()
outputs = model(inputs)
loss = criterion(outputs, targets)
loss.backward()      # Backpropagation
optimizer.step()     # Gradient update`,
      examTip: 'For ML exams: Always distinguish between parameters (learned weights/biases) and hyperparameters (learning rate, batch size, dropout rate).'
    };
  }

  // RAG & Large Language Models
  if (
    lowerTopic.includes('rag') ||
    lowerTopic.includes('retrieval') ||
    lowerTopic.includes('llm') ||
    lowerTopic.includes('transformer') ||
    lowerTopic.includes('attention') ||
    query.includes('rag') ||
    query.includes('llm') ||
    query.includes('transformer')
  ) {
    return {
      title: `${cleanTopic} — RAG & Transformer LLM Architecture`,
      category: 'Generative AI & Natural Language Processing',
      explanation: `**${cleanTopic}** represents the state-of-the-art paradigm in generative AI systems and enterprise knowledge retrieval.

### 1. Transformer Architecture & Attention Mechanism
Modern LLMs are built on the Transformer architecture introduced in *"Attention Is All You Need"* (Vaswani et al.). The core engine is **Scaled Dot-Product Self-Attention**:
$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{Q K^T}{\\sqrt{d_k}}\\right) V$$
• **Query ($Q$)**: What the current token is seeking.
• **Key ($K$)**: What other tokens offer in representation.
• **Value ($V$)**: The actual semantic information transported to the output.

### 2. Retrieval-Augmented Generation (RAG) System Architecture
RAG solves the fundamental limitations of static LLMs (hallucinations, token cutoff dates, private enterprise data isolation):
1. **Document Ingestion**: Parsing text into semantically cohesive chunks (typically 256–512 tokens with 50-token overlap).
2. **Dense Vector Embeddings**: Mathematical projection of text chunks into continuous latent space using embedding models.
3. **Approximate Nearest Neighbor (ANN) Search**: HNSW or IVF indexes query vector space using cosine distance to retrieve top-$k$ relevant chunks in milliseconds.
4. **Context Grounding**: The LLM synthesizes an answer using strictly the retrieved evidence, ensuring factual precision.`,
      keyPoints: [
        'Self-Attention allows models to dynamically weigh relationships between all tokens regardless of distance.',
        'RAG decouples knowledge storage (vector database) from reasoning capability (LLM weights).',
        'Hybrid Search combines dense vector semantic search with sparse keyword search (BM25) for maximum recall.',
        'Re-ranking models (Cross-Encoders) refine top retrieved candidates to boost precision before prompt injection.'
      ],
      codeExample: `# Conceptual RAG Retrieval Pipeline
query_embedding = embed_model.encode(user_prompt)
retrieved_chunks = vector_db.similarity_search(query_embedding, top_k=4)

context_str = "\\n---\\n".join([chunk.text for chunk in retrieved_chunks])
augmented_prompt = f"""Use the following verified context to answer:
{context_str}

User Question: {user_prompt}
Answer with precision and cite sources."""`,
      examTip: 'RAG mitigates hallucinations by converting a free generation task into a grounded open-book comprehension task.'
    };
  }

  // Operating Systems & Deadlocks / Concurrency
  if (
    lowerTopic.includes('operating system') ||
    lowerTopic.includes('deadlock') ||
    lowerTopic.includes('process') ||
    lowerTopic.includes('thread') ||
    lowerTopic.includes('concurrency') ||
    query.includes('deadlock') ||
    query.includes('operating system')
  ) {
    return {
      title: `${cleanTopic} — Operating Systems & Concurrency`,
      category: 'Computer Systems Architecture',
      explanation: `**${cleanTopic}** is a critical topic in operating systems, multi-threaded programming, and distributed systems.

### 1. The 4 Coffman Conditions for Deadlock
A deadlock can occur **if and only if** all four conditions hold simultaneously:
1. **Mutual Exclusion**: At least one resource must be held in a non-shareable mode (only one process at a time).
2. **Hold and Wait**: A process holds at least one resource and is waiting to acquire additional resources held by other processes.
3. **No Preemption**: Resources cannot be forcibly seized; a resource is released only voluntarily by the holding process.
4. **Circular Wait**: A closed loop of processes exists where $P_0$ waits for $P_1$, $P_1$ waits for $P_2$, ..., and $P_n$ waits for $P_0$.

### 2. Deadlock Handling Strategies
• **Prevention**: Invalidate at least one Coffman condition (e.g., impose strict global hierarchy on resource acquisition to eliminate circular wait).
• **Avoidance**: Dynamically check resource allocation state (e.g., **Dijkstra's Banker's Algorithm**) to ensure the system never enters an *Unsafe State*.
• **Detection & Recovery**: Allow deadlocks to occur, detect cycles via Resource Allocation Graphs (RAG), and recover via process termination or resource preemption.`,
      keyPoints: [
        'Breaking any single Coffman condition guarantees deadlock cannot occur.',
        'An unsafe state in Banker\'s Algorithm does not guarantee a deadlock, but deadlock is only possible from an unsafe state.',
        'Mutexes provide exclusive locking with ownership; Semaphores manage signaling across counting resources.',
        'Starvation occurs when a runnable process is indefinitely delayed; Deadlock is a permanent collective freeze.'
      ],
      codeExample: `# Deadlock-Safe Resource Acquisition (Global Ordering)
import threading

lock_a = threading.Lock()
lock_b = threading.Lock()

def safe_transfer():
    # Always acquire locks in uniform global order (A then B)
    with lock_a:
        with lock_b:
            # Critical Section executed safely without circular wait
            pass`,
      examTip: 'Exam distinction: Deadlock Prevention is static (rules enforced beforehand); Deadlock Avoidance is dynamic (runtime safety evaluation).'
    };
  }

  // General Academic Synthesis Fallback (Intelligent, customized to the prompt)
  return {
    title: `Academic Mastery Guide: ${cleanTopic}`,
    category: 'Computer Science & Academic Foundations',
    explanation: `### Comprehensive Academic Breakdown of ${cleanTopic}

${cleanTopic} is an essential academic subject. Below is a structured conceptual breakdown designed for rigorous study and exam readiness:

### 1. Foundational Architecture & Core Axioms
• **Core Purpose**: Understand why ${cleanTopic} was developed, the computational problem it solves, and its boundary conditions.
• **Primary Invariants**: Identify the baseline guarantees and state representations that remain constant throughout system execution.

### 2. High-Yield Mechanisms & Trade-off Analysis
• **Time & Space Asymptotics**: Evaluate execution efficiency (best, average, and worst-case time bounds) against memory overhead.
• **Common Edge Cases**: Be aware of corner conditions, boundary overflows, and subtle traps frequently tested in university and competitive examinations.

### 3. Practical Implementation Guidelines
• Formulate solutions starting from simple, verifiable implementations before introducing multi-threaded or distributed optimizations.
• Review the dynamic **Roadmap**, take the **Quiz**, and study the generated **Notes** below for complete retention.`,
    keyPoints: [
      `Mastering ${cleanTopic} begins with strict understanding of its core definitions and state boundaries.`,
      'Examine edge cases and failure modes where conventional assumptions break down.',
      'Connect conceptual theory with hands-on coding and verification tasks.'
    ],
    codeExample: `# Core verification prototype for ${cleanTopic}
def analyze_concept():
    # Verify invariants and process valid inputs
    print("Mastering ${cleanTopic} through active recall and structured practice.")`,
    examTip: `In exams, always state the base definitions and time/space complexity before diving into implementation details.`
  };
}
