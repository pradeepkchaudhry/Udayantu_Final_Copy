// In-memory / localStorage-backed fallback Supabase client used when
// VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY are not configured.

export interface MockStorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

type Row = Record<string, any>;

const STORAGE_PREFIX = "udayantu_mock_sb_table_";
const SESSION_KEY = "udayantu_mock_sb_session";

const DEFAULT_SEED_TABLES: Record<string, Row[]> = {
  blog_posts: [
    {
      id: "seed-blog-1",
      title: "How Tier 3 & 4 Graduates Are Breaking Into High-Growth Business Development Roles",
      slug: "tier-3-4-graduates-business-development-roles",
      excerpt:
        "Discover the practical communication habits, CRM fundamentals, and daily outreach routines that help rural graduates land corporate offers within weeks.",
      content:
        "<p>Breaking into modern corporate roles no longer requires moving to a metro city before you are ready. With structured role-specific training and daily mentor feedback, graduates from Tier 3 and Tier 4 towns are consistently outperforming expectations in Business Development and Customer Success teams.</p><h2>1. Focus on Problem-Solving Over Scripts</h2><p>Hiring managers look for clarity, curiosity, and structured listening. Practicing mock discovery calls with mentors builds lasting confidence.</p><h2>2. Build Proof of Work</h2><p>Documenting mock pipelines, outreach playbooks, and customer onboarding checklists gives recruiters concrete evidence of job readiness.</p>",
      featured_image: null,
      author: "UdaYantu Career Team",
      category: "Career Guidance",
      published: true,
      published_at: "2026-01-15T10:00:00.000Z",
      views_count: 142,
      created_at: "2026-01-15T10:00:00.000Z",
    },
    {
      id: "seed-blog-2",
      title: "Customer Success 101: Why Empathy and Clarity Beat Fancy Jargon",
      slug: "customer-success-101-empathy-and-clarity",
      excerpt:
        "A beginner-friendly guide to SaaS Customer Success roles, onboarding playbooks, and how to ace your very first corporate interview.",
      content:
        "<p>Customer Success is one of India's fastest-growing entry-level career tracks. Companies need dependable communicators who can guide clients through onboarding, track adoption, and resolve issues calmly.</p><h2>What Employers Evaluate</h2><ul><li>Clear spoken and written communication</li><li>Structured follow-ups and documentation</li><li>Calm troubleshooting under pressure</li></ul>",
      featured_image: null,
      author: "Priya Deshmukh",
      category: "Role Playbooks",
      published: true,
      published_at: "2026-02-02T09:30:00.000Z",
      views_count: 98,
      created_at: "2026-02-02T09:30:00.000Z",
    },
    {
      id: "seed-blog-3",
      title: "From First Interview to Offer Letter: Preparing With Pay-After-Placement Mentorship",
      slug: "first-interview-to-offer-letter-mentorship",
      excerpt:
        "Learn how structured mock interviews, resume audits, and role-readiness assessments turn interview anxiety into repeatable confidence.",
      content:
        "<p>For first-generation corporate job seekers, the biggest barrier is rarely capability—it is knowing what interviewers actually look for. Structured readiness milestones remove the guesswork and help every learner track measurable weekly progress.</p>",
      featured_image: null,
      author: "UdaYantu Placement Cell",
      category: "Success Stories",
      published: true,
      published_at: "2026-02-18T11:15:00.000Z",
      views_count: 116,
      created_at: "2026-02-18T11:15:00.000Z",
    },
  ],
};

function createMemoryStorage(): MockStorageAdapter {
  const map = new Map<string, string>();
  return {
    getItem: (k) => (map.has(k) ? map.get(k)! : null),
    setItem: (k, v) => {
      map.set(k, v);
    },
    removeItem: (k) => {
      map.delete(k);
    },
  };
}

function getDefaultStorage(): MockStorageAdapter {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const key = "__udayantu_sb_mock_probe__";
      window.localStorage.setItem(key, "1");
      window.localStorage.removeItem(key);
      return window.localStorage;
    }
  } catch {
    // Fall back to memory storage
  }
  return createMemoryStorage();
}

function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `mock_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function compareValues(a: any, b: any): number {
  if (a === b) return 0;
  if (a === null || a === undefined) return -1;
  if (b === null || b === undefined) return 1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b));
}

function matchesPattern(value: any, pattern: string, caseInsensitive: boolean): boolean {
  if (value === null || value === undefined) return false;
  const escaped = pattern
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/%/g, ".*")
    .replace(/_/g, ".");
  const regex = new RegExp(`^${escaped}$`, caseInsensitive ? "i" : "");
  return regex.test(String(value));
}

type FilterFn = (row: Row) => boolean;

function parseOrExpression(expr: string): FilterFn {
  const parts = expr.split(",").map((p) => p.trim()).filter(Boolean);
  return (row: Row) =>
    parts.some((part) => {
      const firstDot = part.indexOf(".");
      if (firstDot === -1) return false;
      const column = part.slice(0, firstDot);
      const rest = part.slice(firstDot + 1);
      const secondDot = rest.indexOf(".");
      if (secondDot === -1) return false;
      const op = rest.slice(0, secondDot);
      const rawVal = rest.slice(secondDot + 1);
      const val = row[column];

      switch (op) {
        case "eq":
          return String(val) === rawVal;
        case "neq":
          return String(val) !== rawVal;
        case "ilike":
          return matchesPattern(val, rawVal, true);
        case "like":
          return matchesPattern(val, rawVal, false);
        case "gt":
          return compareValues(val, rawVal) > 0;
        case "gte":
          return compareValues(val, rawVal) >= 0;
        case "lt":
          return compareValues(val, rawVal) < 0;
        case "lte":
          return compareValues(val, rawVal) <= 0;
        case "is":
          return rawVal === "null" ? val === null || val === undefined : String(val) === rawVal;
        default:
          return false;
      }
    });
}

class MockQueryBuilder {
  private operation: "select" | "insert" | "update" | "upsert" | "delete" = "select";
  private payload: any = null;
  private filters: FilterFn[] = [];
  private orders: Array<{ column: string; ascending: boolean }> = [];
  private limitCount: number | null = null;
  private rangeBounds: [number, number] | null = null;
  private returnMode: "many" | "single" | "maybeSingle" = "many";
  private countMode: string | null = null;
  private headOnly = false;
  private selectAfterMutation = false;

  constructor(
    private readonly table: string,
    private readonly readTable: (table: string) => Row[],
    private readonly writeTable: (table: string, rows: Row[]) => void
  ) {}

  select(_columns?: string, options?: { count?: string; head?: boolean }) {
    if (this.operation === "select") {
      this.operation = "select";
    } else {
      this.selectAfterMutation = true;
    }
    if (options?.count) this.countMode = options.count;
    if (options?.head) this.headOnly = true;
    return this;
  }

  insert(values: Row | Row[]) {
    this.operation = "insert";
    this.payload = values;
    return this;
  }

  update(values: Row) {
    this.operation = "update";
    this.payload = values;
    return this;
  }

  upsert(values: Row | Row[], _options?: Record<string, any>) {
    this.operation = "upsert";
    this.payload = values;
    return this;
  }

  delete() {
    this.operation = "delete";
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push((row) => row[column] === value);
    return this;
  }

  neq(column: string, value: any) {
    this.filters.push((row) => row[column] !== value);
    return this;
  }

  gt(column: string, value: any) {
    this.filters.push((row) => compareValues(row[column], value) > 0);
    return this;
  }

  gte(column: string, value: any) {
    this.filters.push((row) => compareValues(row[column], value) >= 0);
    return this;
  }

  lt(column: string, value: any) {
    this.filters.push((row) => compareValues(row[column], value) < 0);
    return this;
  }

  lte(column: string, value: any) {
    this.filters.push((row) => compareValues(row[column], value) <= 0);
    return this;
  }

  like(column: string, pattern: string) {
    this.filters.push((row) => matchesPattern(row[column], pattern, false));
    return this;
  }

  ilike(column: string, pattern: string) {
    this.filters.push((row) => matchesPattern(row[column], pattern, true));
    return this;
  }

  in(column: string, values: any[]) {
    this.filters.push((row) => values.includes(row[column]));
    return this;
  }

  is(column: string, value: any) {
    this.filters.push((row) =>
      value === null ? row[column] === null || row[column] === undefined : row[column] === value
    );
    return this;
  }

  not(column: string, operator: string, value: any) {
    this.filters.push((row) => {
      if (operator === "is" && value === null) {
        return row[column] !== null && row[column] !== undefined;
      }
      if (operator === "eq") return row[column] !== value;
      if (operator === "in" && Array.isArray(value)) return !value.includes(row[column]);
      return true;
    });
    return this;
  }

  or(expression: string) {
    this.filters.push(parseOrExpression(expression));
    return this;
  }

  match(query: Record<string, any>) {
    Object.entries(query).forEach(([k, v]) => this.eq(k, v));
    return this;
  }

  contains(column: string, value: any) {
    this.filters.push((row) => {
      const current = row[column];
      if (Array.isArray(current) && Array.isArray(value)) {
        return value.every((v) => current.includes(v));
      }
      return false;
    });
    return this;
  }

  filter(column: string, operator: string, value: any) {
    switch (operator) {
      case "eq":
        return this.eq(column, value);
      case "neq":
        return this.neq(column, value);
      case "gt":
        return this.gt(column, value);
      case "gte":
        return this.gte(column, value);
      case "lt":
        return this.lt(column, value);
      case "lte":
        return this.lte(column, value);
      case "ilike":
        return this.ilike(column, String(value));
      case "like":
        return this.like(column, String(value));
      default:
        return this;
    }
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orders.push({ column, ascending: options?.ascending !== false });
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  range(from: number, to: number) {
    this.rangeBounds = [from, to];
    return this;
  }

  single() {
    this.returnMode = "single";
    return this;
  }

  maybeSingle() {
    this.returnMode = "maybeSingle";
    return this;
  }

  returns() {
    return this;
  }

  abortSignal() {
    return this;
  }

  private applyFilters(rows: Row[]): Row[] {
    if (this.filters.length === 0) return [...rows];
    return rows.filter((row) => this.filters.every((fn) => fn(row)));
  }

  private applySortAndSlice(rows: Row[]): Row[] {
    let result = [...rows];
    if (this.orders.length > 0) {
      result.sort((a, b) => {
        for (const { column, ascending } of this.orders) {
          const cmp = compareValues(a[column], b[column]);
          if (cmp !== 0) return ascending ? cmp : -cmp;
        }
        return 0;
      });
    }
    if (this.rangeBounds) {
      const [from, to] = this.rangeBounds;
      result = result.slice(from, to + 1);
    }
    if (this.limitCount !== null) {
      result = result.slice(0, this.limitCount);
    }
    return result;
  }

  private formatResult(rows: Row[], totalCount: number) {
    const count = this.countMode ? totalCount : null;
    if (this.headOnly) {
      return { data: null, error: null, count };
    }
    if (this.returnMode === "single") {
      if (rows.length === 0) {
        return {
          data: null,
          error: { message: "No rows returned", code: "PGRST116" },
          count,
        };
      }
      return { data: rows[0], error: null, count };
    }
    if (this.returnMode === "maybeSingle") {
      return { data: rows[0] ?? null, error: null, count };
    }
    return { data: rows, error: null, count };
  }

  private execute() {
    const existing = this.readTable(this.table);
    const now = new Date().toISOString();

    if (this.operation === "select") {
      const filtered = this.applyFilters(existing);
      const sliced = this.applySortAndSlice(filtered);
      return this.formatResult(sliced, filtered.length);
    }

    if (this.operation === "insert") {
      const items = (Array.isArray(this.payload) ? this.payload : [this.payload]).map((item) => ({
        id: item.id ?? generateId(),
        created_at: item.created_at ?? now,
        ...item,
      }));
      const next = [...existing, ...items];
      this.writeTable(this.table, next);
      if (this.selectAfterMutation || this.returnMode !== "many") {
        return this.formatResult(items, items.length);
      }
      return { data: items, error: null, count: this.countMode ? items.length : null };
    }

    if (this.operation === "upsert") {
      const items = Array.isArray(this.payload) ? this.payload : [this.payload];
      const next = [...existing];
      const upserted: Row[] = [];

      for (const rawItem of items) {
        const matchIndex = next.findIndex(
          (r) =>
            (rawItem.id && r.id === rawItem.id) ||
            (rawItem.user_id && r.user_id === rawItem.user_id) ||
            (rawItem.email && r.email === rawItem.email) ||
            (rawItem.phone && r.phone === rawItem.phone)
        );
        if (matchIndex >= 0) {
          const merged = { ...next[matchIndex], ...rawItem, updated_at: now };
          next[matchIndex] = merged;
          upserted.push(merged);
        } else {
          const created = {
            id: rawItem.id ?? generateId(),
            created_at: rawItem.created_at ?? now,
            ...rawItem,
          };
          next.push(created);
          upserted.push(created);
        }
      }
      this.writeTable(this.table, next);
      return this.formatResult(upserted, upserted.length);
    }

    if (this.operation === "update") {
      const updated: Row[] = [];
      const next = existing.map((row) => {
        if (this.filters.every((fn) => fn(row))) {
          const merged = { ...row, ...this.payload, updated_at: now };
          updated.push(merged);
          return merged;
        }
        return row;
      });
      this.writeTable(this.table, next);
      return this.formatResult(updated, updated.length);
    }

    if (this.operation === "delete") {
      const deleted: Row[] = [];
      const kept: Row[] = [];
      for (const row of existing) {
        if (this.filters.every((fn) => fn(row))) {
          deleted.push(row);
        } else {
          kept.push(row);
        }
      }
      this.writeTable(this.table, kept);
      return this.formatResult(deleted, deleted.length);
    }

    return { data: [], error: null, count: null };
  }

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    try {
      const result = this.execute();
      return Promise.resolve(result).then(onfulfilled, onrejected);
    } catch (err) {
      return Promise.reject(err).then(onfulfilled, onrejected);
    }
  }
}

export function createMockSupabaseClient(options?: {
  storage?: MockStorageAdapter;
  seedTables?: Record<string, Row[]>;
}) {
  const storage = options?.storage ?? getDefaultStorage();
  const seeds = options?.seedTables ?? DEFAULT_SEED_TABLES;
  const authListeners = new Set<(event: string, session: any) => void>();

  const readTable = (table: string): Row[] => {
    try {
      const raw = storage.getItem(`${STORAGE_PREFIX}${table}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore corrupted storage
    }
    if (seeds[table]) {
      return seeds[table].map((row) => ({ ...row }));
    }
    return [];
  };

  const writeTable = (table: string, rows: Row[]) => {
    try {
      storage.setItem(`${STORAGE_PREFIX}${table}`, JSON.stringify(rows));
    } catch {
      // ignore quota errors
    }
  };

  const readSession = (): any => {
    try {
      const raw = storage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const writeSession = (session: any) => {
    try {
      if (session) {
        storage.setItem(SESSION_KEY, JSON.stringify(session));
      } else {
        storage.removeItem(SESSION_KEY);
      }
    } catch {
      // ignore
    }
  };

  const notifyAuth = (event: string, session: any) => {
    authListeners.forEach((cb) => {
      try {
        cb(event, session);
      } catch {
        // ignore listener errors
      }
    });
  };

  return {
    from: (table: string) => new MockQueryBuilder(table, readTable, writeTable),

    auth: {
      getSession: async () => ({
        data: { session: readSession() },
        error: null,
      }),
      getUser: async () => {
        const session = readSession();
        return {
          data: { user: session?.user ?? null },
          error: null,
        };
      },
      onAuthStateChange: (callback: (event: string, session: any) => void) => {
        authListeners.add(callback);
        return {
          data: {
            subscription: {
              unsubscribe: () => {
                authListeners.delete(callback);
              },
            },
          },
        };
      },
      setSession: async (tokens: { access_token: string; refresh_token?: string }) => {
        const existing = readSession();
        const session = {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token ?? "",
          user: existing?.user ?? {
            id: generateId(),
            email: "student@udayantu.app",
            role: "authenticated",
          },
        };
        writeSession(session);
        notifyAuth("SIGNED_IN", session);
        return { data: { session, user: session.user }, error: null };
      },
      signInWithPassword: async ({ email }: { email: string; password?: string }) => {
        const user = {
          id: generateId(),
          email,
          role: "authenticated",
          user_metadata: { email },
        };
        const session = {
          access_token: `mock-token-${Date.now()}`,
          refresh_token: `mock-refresh-${Date.now()}`,
          user,
        };
        writeSession(session);
        notifyAuth("SIGNED_IN", session);
        return { data: { user, session }, error: null };
      },
      signUp: async ({
        email,
        options: signUpOptions,
      }: {
        email: string;
        password?: string;
        options?: { data?: Record<string, any> };
      }) => {
        const user = {
          id: generateId(),
          email,
          role: "authenticated",
          user_metadata: signUpOptions?.data ?? {},
        };
        const session = {
          access_token: `mock-token-${Date.now()}`,
          refresh_token: `mock-refresh-${Date.now()}`,
          user,
        };
        writeSession(session);
        notifyAuth("SIGNED_IN", session);
        return { data: { user, session }, error: null };
      },
      signOut: async () => {
        writeSession(null);
        notifyAuth("SIGNED_OUT", null);
        return { error: null };
      },
      updateUser: async (attributes: Record<string, any>) => {
        const session = readSession();
        const updatedUser = {
          ...(session?.user ?? { id: generateId() }),
          ...attributes,
        };
        if (session) {
          writeSession({ ...session, user: updatedUser });
        }
        return { data: { user: updatedUser }, error: null };
      },
      resetPasswordForEmail: async () => ({ data: {}, error: null }),
      signInWithOAuth: async () => ({ data: { provider: "google", url: null }, error: null }),
    },

    functions: {
      invoke: async (_fnName: string, _options?: Record<string, any>) => ({
        data: null,
        error: null,
      }),
    },

    rpc: async (_fnName: string, _params?: Record<string, any>) => ({
      data: null,
      error: null,
    }),

    storage: {
      from: (_bucket: string) => ({
        upload: async (path: string) => ({ data: { path }, error: null }),
        getPublicUrl: (path: string) => ({ data: { publicUrl: path } }),
        list: async () => ({ data: [], error: null }),
        remove: async () => ({ data: [], error: null }),
      }),
    },

    channel: (_name: string) => {
      const ch: any = {
        on: () => ch,
        subscribe: () => ch,
        unsubscribe: async () => "ok",
      };
      return ch;
    },

    removeChannel: async () => "ok",
  };
}
