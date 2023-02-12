# setup-packer

[![Builds, tests & co](https://github.com/hashicorp-contrib/setup-packer/actions/workflows/main.yml/badge.svg)](https://github.com/hashicorp-contrib/setup-packer/actions)
[![CodeQL](https://github.com/hashicorp-contrib/setup-packer/actions/workflows/codeql.yml/badge.svg)](https://github.com/hashicorp-contrib/setup-packer/actions)

Set up and cache the Packer CLI.

## Roadmap

This action aims to provide an OS-neutral interface. And will not add features
that only work on one operating system or manipulate the Packer CLI itself.

## Usage

Currently, the semantic versioning style does not support to specify the version
of the packer itself. ​If you want to use a version other than the latest one,
be sure to specify the exact version.

### Example workflow

```yml
name: Packer

on:
  - pull_request
  - push

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v2

      - name: Use latest Packer
        uses: hashicorp-contrib/setup-packer@v2

      # or

      - name: Use latest Packer
        uses: hashicorp-contrib/setup-packer@v2
        with:
          packer-version: 1.6.5

      - name: Build image from template
        run: packer build TEMPLATE
```

### ​How to specify the version of the action itself

There is a point that is particularly easy to misunderstand. It's where you
specify the version of the action _itself_.

```yml
- name: Use latest Packer
  uses: hashicorp-contrib/setup-packer@v2
  #                                   ^^^
```

We recommend that you include the version of the action. We adhere to
[semantic versioning](https://semver.org), it's safe to use the major version
(`v2`) in your workflow. If you use the master branch, this could break your
workflow when we publish a breaking update and increase the major version.

```yml
steps:
  # Reference the major version of a release (most recommended)
  - uses: hashicorp-contrib/setup-packer@v2
  # Reference a specific commit (most strict)
  - uses: hashicorp-contrib/setup-packer@ee5bed6
  # Reference a semver version of a release (not recommended)
  - uses: hashicorp-contrib/setup-packer@v2.0.0
  # Reference a branch (most dangerous)
  - uses: hashicorp-contrib/setup-packer@master
```

## Inputs

- `github-token`: The API token for the action to get the latest release of
  Packer from GitHub API (default `${{ github.token }}`)
- `packer-version`: The version to use (default `latest`)
