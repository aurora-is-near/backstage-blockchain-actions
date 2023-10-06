// eslint-disable-next-line import/no-namespace
import * as helperModule from "../src/helpers/backstage-export";
import { run } from "../src/main";

const helperSpy = jest.spyOn(helperModule, "backstageExport");
const helper = "backstage-export";
const inputs = {
  backstage_url: "https://example.com",
  template_path: "templates/backstage",
  output_path: "tmp/backstage",
  testing: true,
};
const output = "some output";
jest.mock("@actions/core", () => ({
  getInput(key: keyof typeof inputs | "helper") {
    return key === "helper" ? helper : inputs[key];
  },
  setOutput() {
    return output;
  },
  setFailed() {},
}));
jest.mock("../src/utils/get-action-inputs", () => ({
  getActionInputs() {
    return inputs;
  },
}));
helperSpy.mockResolvedValue(true);

describe("main", () => {
  it("should call module with correct inputs", async () => {
    await run();
    expect(helperSpy).toHaveBeenCalledWith(inputs);
  });
});
