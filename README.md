<!-- PROJECT LOGO -->

<br />
<p align="center">
  <a href="https://github.com/codedesignplus/CodeDesignPlus.Actions.GitVersion/README">
    <img src="https://i.imgur.com/PwbGy0o.png" alt="Logo">
  </a>

  <h3 align="center">CodeDesignPlus.Actions.GitVersion</h3>

  <p align="center">
    Semver versioning based on the git history and commit messages of your repository.
    <br />
    <a href="https://codedesignplus.com">
      <strong>Explore the docs »</strong>
    </a>
    <br />
    <br />
    <a href="https://github.com/codedesignplus/CodeDesignPlus.Actions.GitVersion/issues">
      <img src="https://img.shields.io/github/issues/codedesignplus/CodeDesignPlus.Actions.GitVersion?color=0088ff&style=for-the-badge&logo=github" alt="codedesignplus/CodeDesignPlus.Actions.GitVersion's issues"/>
    </a>
    <a href="https://github.com/codedesignplus/CodeDesignPlus.Actions.GitVersion/pulls">
      <img src="https://img.shields.io/github/issues-pr/codedesignplus/CodeDesignPlus.Actions.GitVersion?color=0088ff&style=for-the-badge&logo=github"  alt="codedesignplus/CodeDesignPlus.Actions.GitVersion's pull requests"/>
    </a>
    <br />    
    <br />
    <img alt="sonarcloud" src="https://sonarcloud.io/images/project_badges/sonarcloud-white.svg" width="100">
    <br />
    <img alt="Quality Gate Status" src="https://sonarcloud.io/api/project_badges/measure?project=CodeDesignPlus.Actions.GitVersion.Key&metric=alert_status" />    
    <img alt="Security Rating" src="https://sonarcloud.io/api/project_badges/measure?project=CodeDesignPlus.Actions.GitVersion.Key&metric=security_rating"/>
    <img alt="Reliability Rating" src="https://sonarcloud.io/api/project_badges/measure?project=CodeDesignPlus.Actions.GitVersion.Key&metric=reliability_rating" />
    <img alt="Vulnerabilities" src="https://sonarcloud.io/api/project_badges/measure?project=CodeDesignPlus.Actions.GitVersion.Key&metric=vulnerabilities" />
    <img alt="Bugs" src="https://sonarcloud.io/api/project_badges/measure?project=CodeDesignPlus.Actions.GitVersion.Key&metric=bugs" />
    <img alt="Code Smells" src="https://sonarcloud.io/api/project_badges/measure?project=CodeDesignPlus.Actions.GitVersion.Key&metric=code_smells" />
    <img alt="Coverage" src="https://sonarcloud.io/api/project_badges/measure?project=CodeDesignPlus.Actions.GitVersion.Key&metric=coverage" />
  </p>
</p>


<!-- TABLE OF CONTENTS -->
## Table of Contents

* [About the Project](#about-the-project)
* [Prerequisites](#prerequisites)
* [Getting Started](#getting-started)
  * [Installation](#installation)
  * [Commands Npm](#commands-npm)
* [Usage](#usage)
  * [Detailed Steps](#detailed-steps)
  * [Example](#practical-example)
* [Roadmap](#roadmap)
* [Contributing](#contributing)
* [License](#license)
* [Contact](#contact)
* [Acknowledgements](#acknowledgements)



<!-- About The Project -->
## About The Project

This project centers on version management within a Git repository, particularly determining previous and new versions based on commit history and tags. It utilizes the semver library for semver-related operations and @actions/core for certain GitHub Actions-related operations.

Key features include:
- Determining the previous version based on Git tags.
- Calculating the new version based on commits since the last tag and certain predefined rules.
- Accounting for different branches like `release`, `release candidate`, and `beta` to determine version type (e.g., `prerelease`).
- Fetching the current commit hash.
- Executing Git commands and fetching results.

This project is an essential tool for those seeking automated version management in their repositories, ensuring that each change, whether it's a major feature, a minor enhancement, or a simple patch, is properly reflected in the project's version.


<!-- Prerequisites -->
## Prerequisites

1. **Node.js Environment**: As the code is in TypeScript/JavaScript, you'll need to have [Node.js](https://nodejs.org/es) installed on your machine to run and develop the project.

2. **Libraries and Modules**: The following libraries and modules are necessary:
   - `semver`: A library for working with semantic version numbers.
   - `@actions/core`: Used to interact with GitHub Actions. This suggests that the code might be intended to be used as part of a GitHub Action.
   - `child_process`: This native Node.js module is used to execute shell commands, in this case, Git commands.

3.  **Git Repository**: Since this project is designed to work with Git tags and commits, you'll need a Git repository where you intend to apply the version management.

4. **Git Installed**: As the code utilizes Git commands via child_process, it's essential to have Git installed in the environment where the code is run.

5. **Appropriate Permissions**: To fetch tags, commit history, and other information, as well as possibly set new tags, the environment running this code should have the proper permissions to interact with the Git repository.


<!-- Getting Started -->
## Getting Started

Para obtener una copia local en funcionamiento siga los siguientes pasos:

1. Clone este repositorio en su computador.
2. Para abrir el proyecto
    <ul>
        <li>Descargue e instale la versión de <a target="_blank" href="https://code.visualstudio.com/">Visual Studio Code</a></li>
        <li>Abrir el proyecto con VS Code</li>
    </ul>


### Installation

1. Clone the repo
    ```powershell
    git clone https://github.com/codedesignplus/CodeDesignPlus.Actions.GitVersion.git
    ```
2. Retore Packages
    ```powershell
    npm install
    ```
3. Run test
    ```powershell
    npm run test
    ```

### Commands NPM

The following table provides an overview of the available npm scripts for this project, detailing their purpose and respective commands. These scripts assist in tasks ranging from formatting and linting to testing and packaging.

| Name            | Description                                                                                                                | Command                 |
|-----------------|----------------------------------------------------------------------------------------------------------------------------|-------------------------|
| `bundle`        | First, it formats the files and then runs the packaging.                                                                   | `npm run bundle`        |
| `ci-test`       | Runs tests using Jest.                                                                                                     | `npm run ci-test`       |
| `format:write`  | Formats the TypeScript (`*.ts`) files and overwrites any non-standard formatting.                                          | `npm run format:write`  |
| `format:check`  | Checks the format of the TypeScript (`*.ts`) files but doesn't make changes.                                                | `npm run format:check`  |
| `lint`          | Runs `eslint` on the entire project with a specific configuration.                                                         | `npm run lint`          |
| `package`       | Packages the `src/index.ts` file and sets the license file.                                                                | `npm run package`       |
| `package:watch` | Packages `src/index.ts` and repackages if there are changes (monitoring mode).                                              | `npm run package:watch` |
| `test`          | Runs tests with Jest and creates a coverage badge. If tests fail, it will still generate the badge.                         | `npm run test`          |
| `all`           | Runs several commands in sequence: formats files, checks linting, runs tests, and packages the project.                     | `npm run all`           |

<!-- Usage -->
## Usage

The `Calculate Version` step uses the `codedesignplus/git-version` action to automatically compute versions based on certain criteria and configurations we set. This action looks at the commit history and, based on specific identifiers and other configurations, determines the appropriate version for the next release.

### Detailed Steps:

1. **Repository Checkout**: Before using any action that analyzes the contents of the repository, ensure that you've checked out the code:

    ```yaml
    - name: Checkout repository
      uses: actions/checkout@v3
    ```

2. **Add the `Calculate Version` step**:

    ```yaml
    - name: Calculate Version
      id: version
      uses: codedesignplus/git-version@v0.0.1
      with:
        folder: ${{github.workspace}}
        release-branch: 'main'
        release-candidate-branch: 'rc'
        beta-branch: 'dev'
        major-identifier: 'breaking'
        minor-identifier: 'feat'
        prefix: 'v'
        dir-affected: ./
        previous-version: true
        new-version: true
    ```

    Here's a description of each parameter:

    - `folder`: Specifies the directory in which the command will run. Typically, this is the GitHub workspace (`${{github.workspace}}`).
    - `release-branch`: The name of the main branch where releases are made. Typically, this is `main`.
    - `release-candidate-branch`: The name of the release candidate branch, often `rc`.
    - `beta-branch`: The name of the beta branch, typically `dev`.
    - `major-identifier`: Identifier for commits that signify a major release. For instance, a breaking commit might be termed `breaking`.
    - `minor-identifier`: Identifier for commits that signify a minor release. A new feature might be tagged as `feat`.
    - `prefix`: Prefix to be added before the version. This is commonly `v`, resulting in versions like `v1.0.0`.
    - `dir-affected`: Directory affected inside a monorepo to calculate changes.
    - `previous-version`: Whether to return the previous version instead of calculating a new one.
    - `new-version`: Whether to return the newly calculated version.

3. **Accessing the outputs**: After the step has run, the outputs can be accessed using the syntax `${{ steps.<step-id>.outputs.<output-key> }}`. For instance, to get the newly computed version, you would use `${{ steps.version.outputs.new-version }}`.

4. **Using the outputs**: The outputs can then be used in subsequent steps to, for instance, print them, tag the repository, or any other process that requires knowledge of the computed version.

### Example:

Once you have set up and executed the `Calculate Version` step, you can print its results or use them in subsequent actions:

```yaml
uses: codedesignplus/semver-git-version@v0.1.4
with:
  folder: ${{github.workspace}}
  release-branch: 'main'
  release-candidate-branch: 'rc'
  beta-branch: 'dev'
  major-identifier: 'breaking'
  minor-identifier: 'feat' 
  prefix: 'v'
  dir-affected: ./
  previous-version: true
  new-version: true
```


<!-- ROADMAP -->
## Roadmap

Refer to [issues](https://github.com/codedesignplus/CodeDesignPlus.Actions.GitVersion/issues) for a list of proposed features and known issues.

<!-- CONTRIBUTING -->
## Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b features/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<!-- LICENSE -->
## License

Distributed under the MIT License. See [LICENSE](LICENSE.md) for more information.


<!-- CONTACT -->
## Contact

CodeDesignPlus - [@CodeDesignPlus](https://www.facebook.com/Codedesignplus-115087913695067) - codedesignplus@outlook.com

Project Link: [CodeDesignPlus.Core](https://github.com/codedesignplus/CodeDesignPlus.Core)



## Acknowledgements

- https://github.com/codacy/git-version