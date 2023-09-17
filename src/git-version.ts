import { execSync } from 'child_process'
import { GitVersionOptions } from './git-version.options'
import semver from 'semver'
import * as core from '@actions/core'

export class GitVersion {
  private readonly baseVersion: string = '0.0.0'

  private options: GitVersionOptions

  public constructor(options: GitVersionOptions) {
    this.options = options
  }

  public getPreviousVersion(): {
    'previous-tag': string | null
    'previous-version-prefix': string
    'previous-version': string
  } {
    const { previousTag, previousVersion } = this.getPreviousTagAndVersion()

    return {
      'previous-tag': previousTag,
      'previous-version-prefix': previousTag
        ? previousTag
        : this.addPrefix(previousVersion),
      'previous-version': previousTag ? previousTag : `${previousVersion}`
    }
  }

  public getPreviousTagAndVersion(): {
    previousTag: string | null
    previousVersion: string
  } {
    const branchTags = this.tagsByBranch()

    let previousVersion = this.baseVersion
    let previousTag = null

    for (const tag of branchTags) {
      const tagWithoutPrefix = this.stripPrefix(tag)

      if (tagWithoutPrefix === null) {
        continue
      }

      const currentVersion = semver.parse(tagWithoutPrefix)

      if (!currentVersion) {
        continue
      }

      if (currentVersion.prerelease.length > 0) {
        continue
      } else if (semver.lt(previousVersion, currentVersion)) {
        previousVersion = currentVersion.version
        previousTag = tag
      }

      core.debug(
        `${tag} | previousTag = ${previousTag}, previousVersion = ${previousVersion}`
      )
    }

    return { previousTag, previousVersion }
  }

  public currentBranchOrTag(): string {
    try {
      const data = this.execSingle('git rev-parse --abbrev-ref HEAD')

      core.debug(`git rev-parse --abbrev-ref HEAD | ${data}`)

      return data
    } catch (error: unknown) {
      core.error(JSON.stringify(error))

      const data = this.execSingle('git describe --tags')

      core.debug(`git describe --tags | ${data}`)

      return data
    }
  }

  public tagsByBranch(): string[] {
    const result = this.execMultiple(`git tag`)

    core.debug(`git tag | ${result.join(', ')}`)

    return result
  }

  private stripPrefix(version: string): string | null {
    let data = null
    if (!version.startsWith(this.options.prefix)) {
      return data
    }

    data = version.substring(this.options.prefix.length)

    core.debug(`stripPrefix | ${data}`)

    return data
  }

  public getNewVersion(): {
    version: string
    'version-complete': string
  } {
    const { previousTag, previousVersion } = this.getPreviousTagAndVersion()

    let newVersion: string | null = semver.inc(previousVersion, 'patch')

    core.debug(`init newVersion | ${newVersion}`)

    if (!newVersion) throw new Error(`Previous Version can't increment`)

    const gitCommitsSince = this.getCommitsSince(previousTag)

    let major = false

    for (const item of gitCommitsSince) {
      const commit = item.toLocaleLowerCase()

      let match: boolean | (RegExpMatchArray | null)

      if (this.options.majorIdIsRegex) {
        match = new RegExp(this.options.majorIdentifier).exec(commit)
      } else {
        match = commit.includes(this.options.majorIdentifier)
      }

      if (match) {
        newVersion = semver.inc(previousVersion, 'major')
        major = true
        continue
      }
    }

    if (!major) {
      for (const item of gitCommitsSince) {
        const commit = item.toLocaleLowerCase()

        let match: boolean | (RegExpMatchArray | null)

        if (this.options.minorIdIsRegex) {
          match = new RegExp(this.options.minorIdentifier).exec(commit)
        } else {
          match = commit.includes(this.options.minorIdentifier)
        }

        if (match) {
          newVersion = semver.inc(previousVersion, 'minor')
          continue
        }
      }
    }

    const currentBranch = this.currentBranchOrTag()

    core.debug(`currentBranch | ${currentBranch}`)

    if (currentBranch === this.options.releaseBranch) {
      core.debug('Release Branch')
    } else if (currentBranch === this.options.releaseCandidateBranch) {
      const prerelease: (string | number)[] = [
        this.options.releaseCandidateBranchSufix,
        this.commitsDistance(previousTag)
      ]

      const version = semver.parse(newVersion)

      if (version) {
        const versionWithoutPrerelease = `${version.major}.${version.minor}.${version.patch}`

        newVersion = semver.inc(
          versionWithoutPrerelease,
          'prerelease',
          prerelease.join('.'),
          false
        )

        newVersion = this.decrementPath(newVersion)
      }
    } else if (currentBranch === this.options.betaBranch) {
      const prerelease: (string | number)[] = [
        this.options.developmentBranchSufix,
        this.commitsDistance(previousTag)
      ]

      const version = semver.parse(newVersion)

      if (version) {
        const versionWithoutPrerelease = `${version.major}.${version.minor}.${version.patch}`

        newVersion = semver.inc(
          versionWithoutPrerelease,
          'prerelease',
          prerelease.join('.'),
          false
        )

        newVersion = this.decrementPath(newVersion)
      }
    } else {
      const prerelease: (string | number)[] = [
        this.options.defaultSufix,
        this.commitsDistance(previousTag)
      ]

      const version = semver.parse(newVersion)

      if (version) {
        const versionWithoutPrerelease = `${version.major}.${version.minor}.${version.patch}`

        newVersion = semver.inc(
          versionWithoutPrerelease,
          'prerelease',
          prerelease.join('.'),
          false
        )

        newVersion = this.decrementPath(newVersion)
      }
    }

    if (major) {
      const version = semver.parse(newVersion)

      if (version) {
        version.patch = 0

        newVersion = version.format()
      }
    }

    return {
      version: `${newVersion}`,
      'version-complete': this.addPrefix(newVersion)
    }
  }

  private decrementPath(newVersion: string | null): string | null {
    const version = semver.parse(newVersion)

    if (version) {
      version.patch -= 1

      newVersion = version.format()
    }

    return newVersion
  }

  private getCommitsSince(tag: string | null): string[] {
    try {
      if (tag && this.execMultiple(`git tag -l ${tag}`).length > 0) {
        const lastCommit = this.execMultiple(`git show-ref -s ${tag}`)[0]

        core.debug(`git show-ref -s ${tag} | ${lastCommit}`)

        const data = this.execMultiple(
          `git log --pretty=%B ${lastCommit}..HEAD ${this.options.logPathsFilter()}`
        )

        core.debug(
          `git log --pretty=%B ${lastCommit}..HEAD ${this.options.logPathsFilter()} | ${data}`
        )

        return data
      } else {
        const data = this.execMultiple(`git log --pretty=%B`)

        core.debug(`git log --pretty=%B | ${data}`)

        return data
      }
    } catch (error) {
      core.error((error as Error).message)

      return []
    }
  }

  private commitsDistance(tag: string | null): number {
    return this.getCommitsSince(tag).length
  }

  public currentCommitHash(): string {
    const cmd = 'git rev-parse --verify HEAD --short'

    const result = this.execSingle(cmd).toString().trim()

    return result.padStart(7, '0')
  }

  private addPrefix(version: string | null): string {
    return `${this.options.prefix}${version}`
  }

  private execSingle(cmd: string): string {
    return this.execMultiple(cmd)[0]
  }

  private execMultiple(cmd: string): string[] {
    try {
      const output = execSync(cmd, {
        cwd: this.options.folder,
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'ignore']
      })

      return output.split('\n').filter(line => line.trim() !== '')
    } catch (error) {
      throw new Error(`[ERROR] Command ${cmd} failed.`)
    }
  }
}
