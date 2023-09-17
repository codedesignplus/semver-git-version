import * as core from '@actions/core'
import figlet from 'figlet'
import { GitVersionOptions } from './git-version.options'
import { GitVersion } from './git-version'

console.log(figlet.textSync('CodeDesignPlus'))

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const options: Record<string, string | boolean> = {
      folder: core.getInput('folder'),
      releaseBranch: core.getInput('release-branch'),
      releaseCandidateBranch: core.getInput('release-candidate-branch'),
      betaBranch: core.getInput('beta-branch'),
      majorIdentifier: core.getInput('major-identifier'),
      minorIdentifier: core.getInput('minor-identifier'),
      prefix: core.getInput('prefix'),
      dirAffected: core.getInput('dir-affected'),
      previousVersion: core.getInput('previous-version'),
      newVersion: core.getInput('new-version')
    }

    core.debug(JSON.stringify(options))

    const gitOptions = new GitVersionOptions(options)
    const gitVersion = new GitVersion(gitOptions)

    if (gitOptions.previousVersion) {
      const version = gitVersion.getPreviousVersion()

      console.log(`previous-version: ${JSON.stringify(version)}`)

      core.setOutput('previous-tag', version['previous-tag'])
      core.setOutput('previous-version', version['previous-version'])
      core.setOutput(
        'previous-version-prefix',
        version['previous-version-prefix']
      )
    }

    if (gitOptions.newVersion) {
      const version = gitVersion.getNewVersion()

      console.log(`new-version: ${JSON.stringify(version)}`)

      core.setOutput('new-version', version.version)
      core.setOutput('new-version-prefix', version['version-complete'])
    }
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
run()
