import core from "@actions/core";
import { camelCase, upperFirst } from "lodash";
import { getActionInputs } from "./utils/get-action-inputs";

export const run = async () => {
  try {
    const helper = core.getInput("helper", { required: true });
    const {
      [camelCase(helper)]: method,
      [upperFirst(camelCase(helper))]: HelperInterface,
    } = await import(`./helpers/${helper}`);
    const requiredInputs = HelperInterface
      ? Object.keys(new HelperInterface())
      : [];
    const actionInputs = getActionInputs(requiredInputs);
    const output = await method(actionInputs);
    core.setOutput("output", output);
  } catch (error) {
    core.setFailed(error as Error);
  }
};

run();
