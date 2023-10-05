import { backstageMetrics } from "../../src/helpers/backstage-metrics";

jest.mock("@actions/core", () => ({ info: () => {}, error: () => {} }));

describe("backstage-metrics", () => {
  it("generates metrics info from entities", async () => {
    const data = await backstageMetrics({
      backstage_url: process.env.BACKSTAGE_URL,
      testing: true,
    });
    expect(data).toBeTruthy();
  });
});
