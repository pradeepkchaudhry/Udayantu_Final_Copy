import test from "node:test";
import assert from "node:assert/strict";
import { createMockSupabaseClient, type MockStorageAdapter } from "./mockClient";

function makeMemoryStorage(): MockStorageAdapter {
  const store = new Map<string, string>();
  return {
    getItem: (k) => store.get(k) ?? null,
    setItem: (k, v) => {
      store.set(k, v);
    },
    removeItem: (k) => {
      store.delete(k);
    },
  };
}

test("mock client seeds default blog posts and supports eq/order/limit/range", async () => {
  const client = createMockSupabaseClient({ storage: makeMemoryStorage() });

  const { data, error, count } = await client
    .from("blog_posts")
    .select("*", { count: "exact" })
    .eq("published", true)
    .order("published_at", { ascending: false })
    .range(0, 1);

  assert.equal(error, null);
  assert.equal(count, 3);
  assert.equal(data.length, 2);
  assert.equal(data[0].id, "seed-blog-3");
});

test("mock client supports insert, select single, update, upsert, and delete", async () => {
  const client = createMockSupabaseClient({ storage: makeMemoryStorage() });

  const inserted = await client
    .from("employers")
    .insert({
      contact_name: "Asha Rao",
      company_name: "RuralTech",
      email: "asha@ruraltech.in",
      status: "Pending",
    })
    .select()
    .single();

  assert.equal(inserted.error, null);
  assert.ok(inserted.data.id);
  assert.equal(inserted.data.company_name, "RuralTech");

  const updated = await client
    .from("employers")
    .update({ status: "Approved" })
    .eq("id", inserted.data.id)
    .select()
    .single();

  assert.equal(updated.error, null);
  assert.equal(updated.data.status, "Approved");

  const upserted = await client
    .from("employers")
    .upsert({ id: inserted.data.id, company_name: "RuralTech India" })
    .select()
    .single();

  assert.equal(upserted.error, null);
  assert.equal(upserted.data.company_name, "RuralTech India");

  const headCount = await client
    .from("employers")
    .select("id", { count: "exact", head: true });
  assert.equal(headCount.data, null);
  assert.equal(headCount.count, 1);

  await client.from("employers").delete().eq("id", inserted.data.id);
  const afterDelete = await client.from("employers").select("*").eq("id", inserted.data.id).maybeSingle();
  assert.equal(afterDelete.error, null);
  assert.equal(afterDelete.data, null);
});

test("mock client supports auth session lifecycle and state change listeners", async () => {
  const client = createMockSupabaseClient({ storage: makeMemoryStorage() });
  const events: string[] = [];

  const {
    data: { subscription },
  } = client.auth.onAuthStateChange((event) => {
    events.push(event);
  });

  const initial = await client.auth.getSession();
  assert.equal(initial.data.session, null);

  await client.auth.signInWithPassword({ email: "student@example.com", password: "secret" });
  const signedIn = await client.auth.getUser();
  assert.equal(signedIn.data.user?.email, "student@example.com");

  await client.auth.signOut();
  const signedOut = await client.auth.getSession();
  assert.equal(signedOut.data.session, null);

  subscription.unsubscribe();
  assert.deepEqual(events, ["SIGNED_IN", "SIGNED_OUT"]);
});

test("mock client supports functions, rpc, storage, and channels without throwing", async () => {
  const client = createMockSupabaseClient({ storage: makeMemoryStorage() });

  const fnRes = await client.functions.invoke("recommend-role", { body: {} });
  assert.equal(fnRes.error, null);

  const rpcRes = await client.rpc("test_rpc");
  assert.equal(rpcRes.error, null);

  const pub = client.storage.from("avatars").getPublicUrl("a.png");
  assert.equal(pub.data.publicUrl, "a.png");

  const ch = client.channel("updates").on("postgres_changes", {}, () => {}).subscribe();
  assert.equal(await client.removeChannel(ch), "ok");
});
