import { getInputsFromFile } from "../../src/utils/get-inputs-from-file";

describe("getInputsFromFile", () => {
  const yamlContents = `
name: Create PR Comment
description: 'Creates a new issue comment for a pull request'
inputs:
  input1:
    description: 'The github helper to invoke'
    required: true
  input2:
    description: 'The comment body'
    required: false
runs:
  using: 'node12'
  main: 'dist/index.js'
`;

  it("should return expected inputs", () => {
    expect(getInputsFromFile(yamlContents)).toEqual(["input1", "input2"]);
  });
});
