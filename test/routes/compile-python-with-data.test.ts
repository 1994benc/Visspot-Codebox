import { test } from "tap";
import { build } from "../helper";

test("compile-python-with-data route only accepts a multipart request", async (t) => {
  const app = await build(t);

  const res = await app.inject({
    method: "POST",
    url: "/compile-python-with-data/121/134",
  });

  console.log(res.payload);
  t.same(JSON.parse(res.payload), { error: "the request is not multipart" });
});
