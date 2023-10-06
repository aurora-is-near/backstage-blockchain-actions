import * as core from "@actions/core";
import * as helperModule from "../src/helpers/backstage-export";
import { getActionInputs } from "../src/utils/get-action-inputs";
import { getInput } from "@actions/core";
import { run } from "../src/main";

jest.mock("@actions/core");
jest.mock("../src/utils/get-action-inputs");
const helperSpy = jest.spyOn(helperModule, "backstageExport");
const helper = "backstage-export";
const otherInputs = {
  backstage_url: "https://example.com",
  template_path: "templates/backstage",
  output_path: "tmp/backstage",
  testing: true,
};
const output = "some output";
(getInput as jest.Mock).mockReturnValue(helper);
(getActionInputs as jest.Mock).mockReturnValue(otherInputs);
(helperSpy as jest.Mock).mockResolvedValue(output);

describe("main", () => {
  it("should call module with correct inputs and set output", async () => {
    await run();
    expect(getActionInputs).toHaveBeenCalledWith([]);
    expect(helperSpy).toHaveBeenCalledWith(otherInputs);
    expect(core.setOutput).toHaveBeenCalledWith("output", output);
  });
});
