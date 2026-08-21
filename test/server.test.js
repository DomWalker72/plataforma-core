import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { server } from "../server.js";

test("serves the public page with security headers", async () => {
  server.listen(0); await once(server, "listening");
  const response = await fetch(`http://127.0.0.1:${server.address().port}/`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-security-policy"), /default-src 'self'/);
  assert.match(await response.text(), /Consulte a base oficial/);
  server.close();
});

test("does not expose files outside the public directory", async () => {
  server.listen(0); await once(server, "listening");
  const response = await fetch(`http://127.0.0.1:${server.address().port}/missing-file`);
  assert.equal(response.status, 404);
  server.close();
});
