import yaml from "js-yaml";

export const getInputsFromFile = (yamlContents: string) =>
  Object.keys(
    (yaml.load(yamlContents) as { inputs: Record<string, string> }).inputs,
  );
