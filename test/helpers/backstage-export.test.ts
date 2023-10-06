import { backstageExport } from "../../src/helpers/backstage-export";

jest.mock("@actions/core");

describe("backstage-export", () => {
  it("generates multisig info from a template", async () => {
    const result = await backstageExport({
      backstage_url: process.env.BACKSTAGE_URL,
      template_path: "templates/backstage",
      output_path: "tmp/backstage",
      testing: true,
    });
    expect(result).toBeTruthy();
  });
});
