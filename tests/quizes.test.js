const { resetDb, registerAndLogin, request, app } = require("./helpers");
beforeEach(resetDb);

describe("quiz tests", () => {
it("returns 401 without a token", async () => {
  const res = await request(app).get("/api/quizes");
  expect(res.status).toBe(401);
});

it("returns 404 for unknown quiz", async () => {
  const token = await registerAndLogin();
  const res = await request(app).get("/api/quizes/99999")
    .set("Authorization", `Bearer ${token}`);
  expect(res.status).toBe(404);
  expect(res.body.message).toBe("Quiz not found");
});

it("returns 400 for invalid quiz body", async () => {
  const token = await registerAndLogin();
  const res = await request(app).post("/api/quizes")
    .set("Authorization", `Bearer ${token}`)
    .send({ title: "" });
  expect(res.status).toBe(400);
});
});