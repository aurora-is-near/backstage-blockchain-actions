import * as core from "@actions/core";
import { camelCase, upperFirst } from "lodash";
import { getActionInputs } from "./utils/get-action-inputs";

export const run = async () => {
  try {
    const helper = core.getInput("helper", { required: true });
    core.debug(`Helper: ${helper}`);

    const {
      [camelCase(helper)]: method,
      [upperFirst(camelCase(helper))]: HelperInterface,
    } = await import(`./helpers/${helper}`);
    core.debug(`Interface: ${HelperInterface}`);

    const requiredInputs = HelperInterface
      ? Object.keys(new HelperInterface())
      : [];
    core.debug(`Required Inputs: ${requiredInputs}`);

    const actionInputs = getActionInputs(requiredInputs);

    const output = await method(actionInputs);
    core.debug(`Output: ${output}`);
    core.setOutput("output", output);
  } catch (error) {
    core.setFailed(error as Error);
  }
};

run();
