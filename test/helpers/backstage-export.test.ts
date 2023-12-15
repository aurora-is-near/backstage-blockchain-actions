import { backstageExport } from "../../src/helpers/backstage-export";

jest.mock("@actions/core");

describe("backstage-export", () => {
  it("generates reports from a templates path", async () => {
    const result = await backstageExport({
      backstage_url: process.env.BACKSTAGE_URL,
      template_path: "templates/backstage",
      output_path: "tmp/backstage",
      testing: true,
    });
    expect(result).toBeTruthy();
  }, 10000);
  it("generates reports filtered by ownership", async () => {
    const result = await backstageExport({
      backstage_url: process.env.BACKSTAGE_URL,
      template_path: "templates/backstage",
      output_path: "tmp/backstage/scoped",
      scope: "bridge-team",
      testing: true,
    });
    expect(result).toBeTruthy();
  }, 10000);
  it("generates reports filtered by lifecycle", async () => {
    const result = await backstageExport({
      backstage_url: process.env.BACKSTAGE_URL,
      template_path: "templates/backstage",
      output_path: "tmp/backstage/lifecycle",
      lifecycle: "production",
      testing: true,
    });
    expect(result).toBeTruthy();
  }, 10000);
});
