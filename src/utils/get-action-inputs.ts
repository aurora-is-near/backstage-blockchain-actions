import { getInput } from "@actions/core";
import { pickBy } from "lodash";
import { readFileSync } from "fs";
import { getInputsFromFile } from "./get-inputs-from-file";

export function getActionInputs<T>(requiredInputs: string[] = []) {
  const yamlContents = readFileSync(`${__dirname}/action.yml`).toString();
  const inputsFromFile = getInputsFromFile(yamlContents).reduce(
    (acc, current) => ({
      ...acc,
      [current]: getInput(current, {
        required: requiredInputs.includes(current),
      }),
    }),
    {},
  );

  return pickBy<T>(inputsFromFile);
}
