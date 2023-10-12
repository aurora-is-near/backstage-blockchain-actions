# Backstage Blockchain Actions

This action is for [Blockchainradar](https://github.com/aurora-is-near/backstage-plugin-blockchainradar)-powered Backstage instances to have a commit log of changes made to entities by exporting reports to a github repo and metrics to Datadog.

[![Project license](https://img.shields.io/badge/License-Public%20Domain-blue.svg)](https://creativecommons.org/publicdomain/zero/1.0/)
[![CI](https://github.com/aurora-is-near/backstage-blockchain-actions/actions/workflows/ci.yaml/badge.svg)](https://github.com/aurora-is-near/backstage-blockchain-actions/actions/workflows/ci.yaml)
![Coverage badge](https://raw.githubusercontent.com/aurora-is-near/backstage-blockchain-actions/main/badges/coverage.svg)

## Usage

### Inputs

- helper - The helper workflow to invoke.
- backstage_url - The backstage url to pull entities from.
- backstage_entities_repo - The repo to use as fallback if url is unavailable.
- template_path - The handlebars templates folder path used for exporting.
- output_path - The output folder path used for compiled templates.

### Outputs

- success - A boolean value to indicate whether a workflow was successful or not

### Example workflows:

#### Backstage Export

Create a file at `.github/workflows/backstage-export.yml` with the following content.

```yml
name: Backstage Export

on:
  workflow_dispatch:

jobs:
  export:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - uses: aurora-is-near/backstage-blockchain-actions@v1
        id: export
        with:
          helper: backstage-export
          backstage_url: https://example.com
          template_path: templates/backstage
          output_path: .
```
