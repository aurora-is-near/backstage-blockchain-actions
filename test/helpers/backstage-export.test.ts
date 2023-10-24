import { backstageExport } from "../../src/helpers/backstage-export";

jest.mock("@actions/core");

describe("backstage-export", () => {
  it("generates reports from a templates path", async () => {
    const result = await backstageExport({
      backstage_url: process.env.BACKSTAGE_URL,
      template_path: "templates/backstage",
      output_path: "tmp/backstage",
      scope: "bridge-team",
      testing: true,
    });
    expect(result).toBeTruthy();
  });
});
