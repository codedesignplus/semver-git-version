import 'jest'
import { Utils } from './helpers/utils'
import { GitVersion } from './../src/git-version'
import { GitVersionOptions } from './../src/git-version.options'

describe('git-version', () => {
  it('should get the correct version in main, rc and dev branc', () => {
    const utils = new Utils()

    const optionsValues: Record<string, string | boolean> = {
      releaseBranch: 'main',
      releaseCandidateBranch: 'rc',
      betaBranch: 'dev',
      prefix: '',
      majorIdentifier: 'breaking:',
      minorIdentifier: 'feature:',
      folder: utils.tmpDirectory,
      dirAffected: '',
      previousVersion: true,
      newVersion: true
    }

    const options = new GitVersionOptions(optionsValues)

    const git = new GitVersion(options)

    // Release Branch
    utils.exec(`git init`)
    utils.exec(`git checkout -b ${options.releaseBranch}`)
    utils.exec(`git commit --no-gpg-sign --allow-empty -m "commit-1"`)
    utils.exec(`git tag "1.0.0"`)

    let currentBranch = git.currentBranchOrTag()
    const versionMain = git.getNewVersion()
    const tagOnMaster = git.tagsByBranch()

    expect(versionMain['version-complete']).toBe('1.0.1')
    expect(tagOnMaster).toContain('1.0.0')

    // Release Candidate Branch - RC
    utils.exec(`git checkout -b ${options.releaseCandidateBranch}`)
    utils.exec(`git commit --no-gpg-sign --allow-empty -m "commit-2"`)

    currentBranch = git.currentBranchOrTag()
    expect(currentBranch).toBe(options.releaseCandidateBranch)

    const versionRC = git.getNewVersion()
    expect(versionRC['version-complete']).toBe('1.0.1-rc.1')

    // Development Branch - Beta
    utils.exec(`git checkout -b ${options.betaBranch}`)
    utils.exec(`git commit --no-gpg-sign --allow-empty -m "commit-3"`)

    currentBranch = git.currentBranchOrTag()
    expect(currentBranch).toBe(options.betaBranch)

    const versionBeta = git.getNewVersion()
    expect(versionBeta['version-complete']).toBe('1.0.1-beta.2')

    utils.exec(`git commit --no-gpg-sign --allow-empty -m "commit-4"`)

    const versionBeta2 = git.getNewVersion()
    expect(versionBeta2['version-complete']).toBe('1.0.1-beta.3')

    utils.cleanup()
  })

  it('should get the correct version feature branch', () => {
    const utils = new Utils()

    const optionsValues: Record<string, string | boolean> = {
      releaseBranch: 'main',
      releaseCandidateBranch: 'rc',
      betaBranch: 'dev',
      prefix: '',
      majorIdentifier: 'breaking:',
      minorIdentifier: 'feature:',
      folder: utils.tmpDirectory,
      dirAffected: '',
      previousVersion: true,
      newVersion: true
    }

    const options = new GitVersionOptions(optionsValues)

    const git = new GitVersion(options)

    utils.exec(`git init`)
    utils.exec(`git checkout -b ${options.releaseBranch}`)
    utils.exec(`git commit --no-gpg-sign --allow-empty -m "commit-1"`)
    utils.exec(`git tag "1.0.0"`)

    utils.exec(`git checkout -b feature/my-fancy.branch`)
    utils.exec(`git commit --no-gpg-sign --allow-empty -m "commit-2"`)

    const version = git.getNewVersion()

    expect(version['version-complete']).toBe('1.0.1-alpha.1')

    utils.cleanup()
  })

  it('should properly bump the version', () => {
    const utils = new Utils()

    const optionsValues: Record<string, string | boolean> = {
      releaseBranch: 'main',
      releaseCandidateBranch: 'rc',
      betaBranch: 'dev',
      prefix: '',
      majorIdentifier: 'breaking:',
      minorIdentifier: 'feature:',
      folder: utils.tmpDirectory,
      dirAffected: '',
      previousVersion: true,
      newVersion: true
    }

    const options = new GitVersionOptions(optionsValues)

    const git = new GitVersion(options)

    utils.exec(`git init`)
    utils.exec(`git checkout -b ${options.releaseBranch}`)
    utils.exec(`git commit --no-gpg-sign --allow-empty -m "commit-1"`)
    utils.exec(`git tag "1.0.0"`)

    utils.exec(`git checkout -b ${options.betaBranch}`)

    utils.exec(`git commit --no-gpg-sign --allow-empty -m "breaking: XYZ"`)
    let version = git.getNewVersion()
    expect(version['version-complete']).toBe('2.0.0-beta.1')

    utils.exec(`git commit --no-gpg-sign --allow-empty -m "breaking: XYZ"`)
    version = git.getNewVersion()
    expect(version['version-complete']).toBe('2.0.0-beta.2')

    utils.exec(`git commit --no-gpg-sign --allow-empty -m "breaking: XYZ"`)
    version = git.getNewVersion()
    expect(version['version-complete']).toBe('2.0.0-beta.3')

    utils.cleanup()
  })

  it('bump on master after merging in various ways', () => {
    const utils = new Utils()

    const optionsValues: Record<string, string | boolean> = {
      releaseBranch: 'main',
      releaseCandidateBranch: 'rc',
      betaBranch: 'dev',
      prefix: '',
      majorIdentifier: 'breaking:',
      minorIdentifier: 'feature:',
      folder: utils.tmpDirectory,
      dirAffected: '',
      previousVersion: true,
      newVersion: true
    }

    const options = new GitVersionOptions(optionsValues)

    const git = new GitVersion(options)

    utils.exec(`git init`)
    utils.exec(`git checkout -b ${options.releaseBranch}`)
    utils.exec(`git commit --no-gpg-sign --allow-empty -m "commit-1"`)
    utils.exec(`git tag "1.0.0"`)

    utils.exec(`git checkout -b feature/my-fancy.branch`)
    utils.exec(`git commit --no-gpg-sign --allow-empty -m "commit-2"`)

    utils.exec(`git commit --no-gpg-sign --allow-empty -m "breaking: XYZ"`)

    utils.exec(`git checkout ${options.releaseBranch}`)

    let version = git.getNewVersion()
    expect(version['version-complete']).toBe('1.0.1')

    utils.exec(`git merge feature/my-fancy.branch`)

    version = git.getNewVersion()
    expect(version['version-complete']).toBe('2.0.0')
    utils.exec(`git tag "2.0.0"`)

    utils.exec(`git checkout -b feature/my-fancy.branch2`)
    utils.exec(`git commit --no-gpg-sign --allow-empty -m "breaking: ABC"`)
    utils.exec(`git checkout ${options.releaseBranch}`)

    version = git.getNewVersion()
    expect(version['version-complete']).toBe('2.0.1')

    utils.exec(`git merge --ff-only feature/my-fancy.branch2`)

    version = git.getNewVersion()
    expect(version['version-complete']).toBe('3.0.0')

    utils.exec(`git tag "3.0.0"`)

    utils.exec(`git checkout -b feature/my-fancy.branch3`)
    utils.exec(`git commit --no-gpg-sign --allow-empty -m "feature: ABC"`)
    utils.exec(`git checkout ${options.releaseBranch}`)

    version = git.getNewVersion()
    expect(version['version-complete']).toBe('3.0.1')

    utils.exec(`git merge --ff-only feature/my-fancy.branch3`)

    version = git.getNewVersion()
    expect(version['version-complete']).toBe('3.1.0')

    utils.exec(`git tag "3.1.0"`)

    utils.cleanup()
  })

  // Pendiente por validar la función commitSince
  it('correct version on feature after second commit', () => {
    const utils = new Utils()

    const optionsValues: Record<string, string | boolean> = {
      releaseBranch: 'main',
      releaseCandidateBranch: 'rc',
      betaBranch: 'dev',
      prefix: '',
      majorIdentifier: 'breaking:',
      minorIdentifier: 'feature:',
      folder: utils.tmpDirectory,
      dirAffected: '',
      previousVersion: true,
      newVersion: true
    }

    const options = new GitVersionOptions(optionsValues)

    const git = new GitVersion(options)

    utils.exec(`git init`)
    utils.exec(`git checkout -b ${options.releaseBranch}`)
    utils.exec(`git commit --no-gpg-sign --allow-empty -m "commit-1"`)
    utils.exec(`git tag "1.0.0"`)

    utils.exec(`git checkout -b ${options.betaBranch}`)

    utils.exec(`git checkout -b FT-1111`)
    utils.exec(`git commit --no-gpg-sign --allow-empty -m "commit-3"`)
    utils.exec(`git commit --no-gpg-sign --allow-empty -m "commit-4"`)

    const version = git.getNewVersion()
    expect(version['version-complete']).toBe('1.0.1-alpha.2')

    utils.cleanup()
  })

  it('should retrieve correct first version on master', () => {
    const utils = new Utils()

    const optionsValues: Record<string, string | boolean> = {
      releaseBranch: 'main',
      releaseCandidateBranch: 'rc',
      betaBranch: 'dev',
      prefix: '',
      majorIdentifier: 'breaking:',
      minorIdentifier: 'feature:',
      folder: utils.tmpDirectory,
      dirAffected: '',
      previousVersion: true,
      newVersion: true
    }

    const options = new GitVersionOptions(optionsValues)

    const git = new GitVersion(options)

    utils.exec(`git init`)
    utils.exec(`git checkout -b ${options.releaseBranch}`)
    utils.exec(`git commit --no-gpg-sign --allow-empty -m "commit-1"`)

    const version = git.getNewVersion()
    expect(version['version-complete']).toBe('0.0.1')

    utils.cleanup()
  })

  it('version properly after 5th commit', () => {
    const utils = new Utils()

    const optionsValues: Record<string, string | boolean> = {
      releaseBranch: 'main',
      releaseCandidateBranch: 'rc',
      betaBranch: 'dev',
      prefix: '',
      majorIdentifier: 'breaking:',
      minorIdentifier: 'feature:',
      folder: utils.tmpDirectory,
      dirAffected: '',
      previousVersion: true,
      newVersion: true
    }

    const options = new GitVersionOptions(optionsValues)

    const git = new GitVersion(options)

    utils.exec(`git init`)
    utils.exec(`git checkout -b ${options.releaseBranch}`)
    utils.exec(`git commit --no-gpg-sign --allow-empty -m "commit-1"`)
    utils.exec(`git commit --no-gpg-sign --allow-empty -m "commit-2"`)
    utils.exec(`git tag "1.1.0"`)
    utils.exec(`git commit --no-gpg-sign --allow-empty -m "commit-3"`)
    utils.exec(`git tag "1.2.0"`)
    utils.exec(`git commit --no-gpg-sign --allow-empty -m "commit-4"`)
    utils.exec(`git commit --no-gpg-sign --allow-empty -m "commit-5"`)

    const version = git.getNewVersion()
    expect(version['version-complete']).toBe('1.2.1')

    utils.cleanup()
  })

  it('version properly with concurrent features', () => {
    const utils = new Utils()

    const optionsValues: Record<string, string | boolean> = {
      releaseBranch: 'main',
      releaseCandidateBranch: 'rc',
      betaBranch: 'dev',
      prefix: '',
      majorIdentifier: 'breaking:',
      minorIdentifier: 'feature:',
      folder: utils.tmpDirectory,
      dirAffected: '',
      previousVersion: true,
      newVersion: true
    }

    const options = new GitVersionOptions(optionsValues)

    const git = new GitVersion(options)

    utils.exec(`git init`)
    utils.exec(`git checkout -b ${options.releaseBranch}`)
    utils.exec(`git commit --no-gpg-sign --allow-empty -m "commit-1"`)
    utils.exec(`git tag "1.0.0"`)
    utils.exec(`git checkout -b feature1`)
    utils.exec(`git commit --no-gpg-sign --allow-empty -m "feature: commit-2"`)

    let version = git.getNewVersion()
    expect(version['version-complete']).toBe('1.1.0-alpha.1')

    utils.exec(`git checkout ${options.releaseBranch}`)
    utils.exec(`git checkout -b feature2`)
    utils.exec(`git commit --no-gpg-sign --allow-empty -m "breaking: commit-3"`)

    version = git.getNewVersion()
    expect(version['version-complete']).toBe('2.0.0-alpha.1')

    utils.exec(`git checkout ${options.releaseBranch}`)
    utils.exec(`git merge feature2`)

    version = git.getNewVersion()
    expect(version['version-complete']).toBe('2.0.0')
    utils.exec(`git tag "2.0.0"`)

    utils.exec(`git checkout -b feature3`)
    utils.exec(`git commit --no-gpg-sign --allow-empty -m "commit-4"`)

    version = git.getNewVersion()
    expect(version['version-complete']).toBe('2.0.1-alpha.1')

    utils.exec(`git checkout ${options.releaseBranch}`)
    utils.exec(`git merge --no-gpg-sign feature1`)

    version = git.getNewVersion()
    expect(version['version-complete']).toBe('2.1.0')

    utils.exec(`git tag "2.1.0"`)

    utils.exec(`git merge --no-gpg-sign feature3`)
    version = git.getNewVersion()

    expect(version['version-complete']).toBe('2.1.1')
    utils.exec(`git tag "2.1.1"`)

    utils.cleanup()
  })

  it('version releases with rebase from master', () => {
    const utils = new Utils()

    const optionsValues: Record<string, string | boolean> = {
      releaseBranch: 'main',
      releaseCandidateBranch: 'rc',
      betaBranch: 'dev',
      prefix: '',
      majorIdentifier: 'breaking:',
      minorIdentifier: 'feature:',
      folder: utils.tmpDirectory,
      dirAffected: '',
      previousVersion: true,
      newVersion: true
    }

    const options = new GitVersionOptions(optionsValues)

    const git = new GitVersion(options)

    utils.exec(`git init`)
    utils.exec(`git checkout -b ${options.releaseBranch}`)
    utils.exec(`git commit --no-gpg-sign --allow-empty -m "commit-1"`)
    utils.exec(`git tag "1.0.0"`)
    utils.exec(`git checkout -b ${options.betaBranch}`)
    utils.exec(`git commit --no-gpg-sign --allow-empty -m "commit-2"`)

    let version = git.getNewVersion()
    expect(version['version-complete']).toBe('1.0.1-beta.1')

    utils.exec(`git checkout -b myfeature`)
    utils.exec(`git commit --no-gpg-sign --allow-empty -m "commit-3"`)
    utils.exec(`git checkout dev`)
    utils.exec(`git merge myfeature`)

    utils.exec(`git checkout ${options.releaseBranch}`)
    utils.exec(`git rebase --no-gpg-sign dev`)
    version = git.getNewVersion()
    expect(version['version-complete']).toBe('1.0.1')

    utils.cleanup()
  })

  it('bump version only once in presence of merge commit message', () => {
    const utils = new Utils()

    const optionsValues: Record<string, string | boolean> = {
      releaseBranch: 'main',
      releaseCandidateBranch: 'rc',
      betaBranch: 'dev',
      prefix: '',
      majorIdentifier: 'breaking:',
      minorIdentifier: 'feature:',
      folder: utils.tmpDirectory,
      dirAffected: '',
      previousVersion: true,
      newVersion: true
    }

    const options = new GitVersionOptions(optionsValues)

    const git = new GitVersion(options)

    utils.exec(`git init`)
    utils.exec(`git checkout -b ${options.releaseBranch}`)
    utils.exec(`git commit --no-gpg-sign --allow-empty -m "commit-1"`)
    utils.exec(`git tag "1.0.0"`)
    utils.exec(`git checkout -b ${options.betaBranch}`)
    utils.exec(`git commit --no-gpg-sign --allow-empty -m "breaking: 2"`)

    utils.exec(`git checkout ${options.releaseBranch}`)
    utils.exec(`git commit --no-gpg-sign --allow-empty -m "commit-3"`)

    utils.exec(`git checkout ${options.betaBranch}`)
    utils.exec(`git commit --no-gpg-sign --allow-empty -m "commit-4"`)
    utils.exec(`git rebase --no-gpg-sign ${options.releaseBranch}`)

    utils.exec(`git checkout ${options.releaseBranch}`)
    utils.exec(`git merge --no-gpg-sign --no-ff ${options.betaBranch}`)

    //# e.g. commit added when merging by bitbucket, no easy way to produce it automatically...
    utils.exec(
      `git commit --no-gpg-sign --allow-empty -m "Merged xyz (123) breaking:"`
    )

    const version = git.getNewVersion()
    expect(version['version-complete']).toBe('2.0.0')

    utils.cleanup()
  })

  it('when in master should not consider pre-release versions for major bumps', () => {
    const utils = new Utils()

    const optionsValues: Record<string, string | boolean> = {
      releaseBranch: 'main',
      releaseCandidateBranch: 'rc',
      betaBranch: 'dev',
      prefix: '',
      majorIdentifier: 'breaking:',
      minorIdentifier: 'feature:',
      folder: utils.tmpDirectory,
      dirAffected: '',
      previousVersion: true,
      newVersion: true
    }

    const options = new GitVersionOptions(optionsValues)

    const git = new GitVersion(options)

    utils.exec(`git init`)
    utils.exec(`git checkout -b ${options.releaseBranch}`)
    utils.exec(`git commit --no-gpg-sign --allow-empty -m "commit-1"`)
    utils.exec(`git tag "1.0.0"`)
    utils.exec(`git checkout -b ${options.betaBranch}`)
    utils.exec(`git commit --no-gpg-sign --allow-empty -m "breaking: 2"`)

    let version = git.getNewVersion()

    utils.exec(`git tag "${version}"`)
    expect(version['version-complete']).toBe('2.0.0-beta.1')

    utils.exec(`git checkout ${options.releaseBranch}`)
    utils.exec(`git merge --no-gpg-sign --no-ff dev`)

    version = git.getNewVersion()
    expect(version['version-complete']).toBe('2.0.0')

    utils.cleanup()
  })

  it('when in master should not consider pre-release versions for minor bumps', () => {
    const utils = new Utils()

    const optionsValues: Record<string, string | boolean> = {
      releaseBranch: 'main',
      releaseCandidateBranch: 'rc',
      betaBranch: 'dev',
      prefix: '',
      majorIdentifier: 'breaking:',
      minorIdentifier: 'feature:',
      folder: utils.tmpDirectory,
      dirAffected: '',
      previousVersion: true,
      newVersion: true
    }

    const options = new GitVersionOptions(optionsValues)

    const git = new GitVersion(options)

    utils.exec(`git init`)
    utils.exec(`git checkout -b ${options.releaseBranch}`)
    utils.exec(`git commit --no-gpg-sign --allow-empty -m "commit-1"`)
    utils.exec(`git tag "1.0.0"`)
    utils.exec(`git checkout -b ${options.betaBranch}`)
    utils.exec(`git commit --no-gpg-sign --allow-empty -m "commit-2"`)

    let version = git.getNewVersion()
    utils.exec(`git tag "${version}"`)
    expect(version['version-complete']).toBe('1.0.1-beta.1')

    utils.exec(`git checkout ${options.releaseBranch}`)
    utils.exec(`git merge --no-gpg-sign --no-ff dev`)

    version = git.getNewVersion()
    expect(version['version-complete']).toBe('1.0.1')

    utils.cleanup()
  })

  it('bump properly major and reset minor', () => {
    const utils = new Utils()

    const optionsValues: Record<string, string | boolean> = {
      releaseBranch: 'main',
      releaseCandidateBranch: 'rc',
      betaBranch: 'dev',
      prefix: '',
      majorIdentifier: 'breaking:',
      minorIdentifier: 'feature:',
      folder: utils.tmpDirectory,
      dirAffected: '',
      previousVersion: true,
      newVersion: true
    }

    const options = new GitVersionOptions(optionsValues)

    const git = new GitVersion(options)

    utils.exec(`git init`)
    utils.exec(`git checkout -b ${options.releaseBranch}`)
    utils.exec(`git commit --no-gpg-sign --allow-empty -m "commit-1"`)
    utils.exec(`git tag "0.1.0"`)
    utils.exec(`git commit --no-gpg-sign --allow-empty -m ":breaking: 2"`)

    const version = git.getNewVersion()
    expect(version['version-complete']).toBe('1.0.0')

    utils.cleanup()
  })

  it('should bump the breaking even with a pre-release tag', () => {
    const utils = new Utils()

    const optionsValues: Record<string, string | boolean> = {
      releaseBranch: 'main',
      releaseCandidateBranch: 'rc',
      betaBranch: 'dev',
      prefix: '',
      majorIdentifier: 'breaking:',
      minorIdentifier: 'feature:',
      folder: utils.tmpDirectory,
      dirAffected: '',
      previousVersion: true,
      newVersion: true
    }

    const options = new GitVersionOptions(optionsValues)

    const git = new GitVersion(options)

    utils.exec(`git init`)
    utils.exec(`git checkout -b ${options.releaseBranch}`)
    utils.exec(`git commit --no-gpg-sign --allow-empty -m "commit-1"`)
    utils.exec(`git tag "0.1.0"`)
    utils.exec(`git commit --no-gpg-sign --allow-empty -m "feature: 2"`)
    utils.exec(`git tag "0.2.0-asd"`)
    utils.exec(`git commit --no-gpg-sign --allow-empty -m ":breaking: 2"`)

    const version = git.getNewVersion()
    expect(version['version-complete']).toBe('1.0.0')

    utils.cleanup()
  })

  it('should bump the breaking even without any other tag', () => {
    const utils = new Utils()

    const optionsValues: Record<string, string | boolean> = {
      releaseBranch: 'main',
      releaseCandidateBranch: 'rc',
      betaBranch: 'dev',
      prefix: '',
      majorIdentifier: 'breaking:',
      minorIdentifier: 'feature:',
      folder: utils.tmpDirectory,
      dirAffected: '',
      previousVersion: true,
      newVersion: true
    }

    const options = new GitVersionOptions(optionsValues)

    const git = new GitVersion(options)

    utils.exec(`git init`)
    utils.exec(`git checkout -b ${options.releaseBranch}`)
    utils.exec(`git commit --no-gpg-sign --allow-empty -m "breaking: 1"`)

    const version = git.getNewVersion()
    expect(version['version-complete']).toBe('1.0.0')

    utils.cleanup()
  })

  it('should fallback to tag detection if in detached HEAD(on a tag)', () => {
    const utils = new Utils()

    const optionsValues: Record<string, string | boolean> = {
      releaseBranch: 'main',
      releaseCandidateBranch: 'rc',
      betaBranch: 'dev',
      prefix: '',
      majorIdentifier: 'breaking:',
      minorIdentifier: 'feature:',
      folder: utils.tmpDirectory,
      dirAffected: '',
      previousVersion: true,
      newVersion: true
    }

    const options = new GitVersionOptions(optionsValues)

    const git = new GitVersion(options)

    utils.exec(`git init`)
    utils.exec(`git checkout -b ${options.releaseBranch}`)
    utils.exec(`git commit --no-gpg-sign --allow-empty -m "breaking: 1"`)
    utils.exec(`git tag v1`)
    utils.exec(`git checkout v1`)

    const version = git.getNewVersion()
    expect(version['version-complete']).toBe('1.0.0-alpha.1')

    utils.cleanup()
  })

  it('should properly manage prefixes', () => {
    const utils = new Utils()

    const optionsValues: Record<string, string | boolean> = {
      releaseBranch: 'main',
      releaseCandidateBranch: 'rc',
      betaBranch: 'dev',
      prefix: 'v',
      majorIdentifier: 'breaking:',
      minorIdentifier: 'feature:',
      folder: utils.tmpDirectory,
      dirAffected: '',
      previousVersion: true,
      newVersion: true
    }

    const options = new GitVersionOptions(optionsValues)

    const git = new GitVersion(options)

    utils.exec(`git init`)
    utils.exec(`git checkout -b ${options.releaseBranch}`)
    utils.exec(`git commit --no-gpg-sign --allow-empty -m "feature: 1"`)
    utils.exec(`git tag "v1.1.0"`)
    utils.exec(`git commit --no-gpg-sign --allow-empty -m "commit-2"`)

    const version = git.getNewVersion()
    expect(version['version-complete']).toBe('v1.1.1')

    utils.cleanup()
  })

  it('non-prefixed tags should be ignored if prefix is enabled', () => {
    const utils = new Utils()

    const optionsValues: Record<string, string | boolean> = {
      releaseBranch: 'main',
      releaseCandidateBranch: 'rc',
      betaBranch: 'dev',
      prefix: 'v',
      dirAffected: '',
      majorIdentifier: 'breaking:',
      minorIdentifier: 'feature:',
      folder: utils.tmpDirectory,
      previousVersion: true,
      newVersion: true
    }

    const options = new GitVersionOptions(optionsValues)

    const git = new GitVersion(options)

    utils.exec(`git init`)
    utils.exec(`git checkout -b ${options.releaseBranch}`)
    utils.exec(`git commit --no-gpg-sign --allow-empty -m "commit-1"`)
    utils.exec(`git tag "1.0.0"`)

    const version = git.getNewVersion()
    expect(version['version-complete']).toBe('v0.0.1')

    utils.cleanup()
  })

  it('should properly manage a tag with only prefix', () => {
    const utils = new Utils()

    const optionsValues: Record<string, string | boolean> = {
      releaseBranch: 'main',
      releaseCandidateBranch: 'rc',
      betaBranch: 'dev',
      prefix: 'v',
      dirAffected: '',
      majorIdentifier: 'breaking:',
      minorIdentifier: 'feature:',
      folder: utils.tmpDirectory,
      previousVersion: true,
      newVersion: true
    }

    const options = new GitVersionOptions(optionsValues)

    const git = new GitVersion(options)

    utils.exec(`git init`)
    utils.exec(`git checkout -b ${options.releaseBranch}`)
    utils.exec(`git commit --no-gpg-sign --allow-empty -m "1"`)
    utils.exec(`git tag "v"`)

    const version = git.getNewVersion()
    expect(version['version-complete']).toBe('v0.0.1')

    utils.cleanup()
  })

  it('should count the commits distance', () => {
    const utils = new Utils()

    const optionsValues: Record<string, string | boolean> = {
      releaseBranch: 'main',
      releaseCandidateBranch: 'rc',
      betaBranch: 'dev',
      prefix: '',
      dirAffected: '',
      majorIdentifier: 'breaking:',
      minorIdentifier: 'feature:',
      folder: utils.tmpDirectory,
      previousVersion: true,
      newVersion: true
    }

    const options = new GitVersionOptions(optionsValues)

    const git = new GitVersion(options)

    utils.exec(`git init`)
    utils.exec(`git checkout -b ${options.releaseBranch}`)
    utils.exec(`git checkout -b v1`)
    utils.exec(`git commit --no-gpg-sign --allow-empty -m "breaking: 1"`)
    utils.exec(`git commit --no-gpg-sign --allow-empty -m "breaking: 2"`)
    utils.exec(`git commit --no-gpg-sign --allow-empty -m "breaking: 3"`)

    const version = git.getNewVersion()
    expect(version['version-complete']).toBe('1.0.0-alpha.3')

    utils.cleanup()
  })

  //Check 1.0.1-v1.1.#{hash}
  it('ignore non log-path filtered breaking messages', () => {
    const utils = new Utils()

    const optionsValues: Record<string, string | boolean> = {
      releaseBranch: 'main',
      releaseCandidateBranch: 'rc',
      betaBranch: 'dev',
      prefix: '',
      dirAffected: 'dir2/',
      majorIdentifier: 'breaking:',
      minorIdentifier: 'feature:',
      folder: utils.tmpDirectory,
      previousVersion: true,
      newVersion: true
    }

    const options = new GitVersionOptions(optionsValues)

    const git = new GitVersion(options)

    utils.exec(`git init`)
    utils.exec(`git checkout -b ${options.releaseBranch}`)
    utils.exec(`git checkout -b v1`)
    utils.exec(`git commit --no-gpg-sign --allow-empty -m "commit-1"`)
    // Create dir1 and tag 1.0.0
    utils.exec(`mkdir dir1 && "" > dir1/dummy_file.txt`)
    utils.exec(`git add dir1/`)
    utils.exec(`git commit --no-gpg-sign -m "breaking: commit-2"`)
    utils.exec(`git tag "1.0.0"`)
    // Create dir2 and commit
    utils.exec(`mkdir dir2 && "" > dir2/dummy_file.txt`)
    utils.exec(`git add dir2/`)
    utils.exec(`git commit --no-gpg-sign -m "commit-3"`)

    // git-version on dir2 should ignore tag on commit with dir1
    const version = git.getNewVersion()
    expect(version['version-complete']).toBe('1.0.1-alpha.1')

    utils.cleanup()
  })

  it('ignore log-path filtered breaking messages with multiple paths', () => {
    const utils = new Utils()

    const optionsValues: Record<string, string | boolean> = {
      releaseBranch: 'main',
      releaseCandidateBranch: 'rc',
      betaBranch: 'dev',
      prefix: '',
      dirAffected: 'dir1/ dir3/',
      majorIdentifier: 'breaking:',
      minorIdentifier: 'feature:',
      folder: utils.tmpDirectory,
      previousVersion: true,
      newVersion: true
    }

    const options = new GitVersionOptions(optionsValues)

    const git = new GitVersion(options)

    utils.exec(`git init`)
    utils.exec(`git checkout -b ${options.releaseBranch}`)
    // Create dir1 and tag 1.0.0
    let baseDir = 'dir1'
    utils.exec(`mkdir ${baseDir} && "" > ${baseDir}/dummy_file.txt`)
    utils.exec(`git add ${baseDir}/`)
    utils.exec(`git commit --no-gpg-sign -m "breaking: commit-1"`)
    utils.exec(`git tag "1.0.0"`)

    utils.exec(`git checkout -b ${options.betaBranch}`)
    // Create dir2 and commit breaking (to be ignored)
    baseDir = 'dir2'
    utils.exec(`mkdir ${baseDir} && "" > ${baseDir}/dummy_file.txt`)
    utils.exec(`git add ${baseDir}/`)
    utils.exec(`git commit --no-gpg-sign -m "breaking: commit-2"`)

    // Create dir3 and commit non-breaking
    baseDir = 'dir3'
    utils.exec(`mkdir ${baseDir} && "" > ${baseDir}/dummy_file.txt`)
    utils.exec(`git add ${baseDir}/`)
    utils.exec(`git commit --no-gpg-sign -m "commit-3"`)

    utils.exec(`git checkout ${options.releaseBranch}`)
    utils.exec(`git merge --no-gpg-sign --no-ff ${options.betaBranch}`)

    //# git-version should ignore the breaking tag on commit with dir2
    const version = git.getNewVersion()
    expect(version['version-complete']).toBe('1.0.1')

    utils.cleanup()
  })

  it('accept log-path filtered breaking messages with multiple paths', () => {
    const utils = new Utils()

    const optionsValues: Record<string, string | boolean> = {
      releaseBranch: 'main',
      releaseCandidateBranch: 'rc',
      betaBranch: 'dev',
      prefix: '',
      dirAffected: 'dir2/ dir3/',
      majorIdentifier: 'breaking:',
      minorIdentifier: 'feature:',
      folder: utils.tmpDirectory,
      previousVersion: true,
      newVersion: true
    }

    const options = new GitVersionOptions(optionsValues)

    const git = new GitVersion(options)

    utils.exec(`git init`)
    utils.exec(`git checkout -b ${options.releaseBranch}`)
    // Create dir1 and tag 1.0.0
    let baseDir = 'dir1'
    utils.exec(`mkdir ${baseDir} && "" > ${baseDir}/dummy_file.txt`)
    utils.exec(`git add ${baseDir}/`)
    utils.exec(`git commit --no-gpg-sign -m "breaking: 1"`)
    utils.exec(`git tag "1.0.0"`)

    utils.exec(`git checkout -b ${options.betaBranch}`)
    // Create dir2 and commit breaking
    baseDir = 'dir2'
    utils.exec(`mkdir ${baseDir} && "" > ${baseDir}/dummy_file.txt`)
    utils.exec(`git add ${baseDir}/`)
    utils.exec(`git commit --no-gpg-sign -m "breaking: 2"`)
    // Create dir3 and commit non-breaking
    baseDir = 'dir3'
    utils.exec(`mkdir ${baseDir} && "" > ${baseDir}/dummy_file.txt`)
    utils.exec(`git add ${baseDir}/`)
    utils.exec(`git commit --no-gpg-sign -m "3"`)

    utils.exec(`git checkout ${options.releaseBranch}`)
    utils.exec(`git merge --no-gpg-sign --no-ff ${options.betaBranch}`)

    // git-version should accept the breaking tag on commit with dir2
    const version = git.getNewVersion()
    expect(version['version-complete']).toBe('2.0.0')

    utils.cleanup()
  })

  it('accept breaking messages if part of the log-path filter', () => {
    const utils = new Utils()

    const optionsValues: Record<string, string | boolean> = {
      releaseBranch: 'main',
      releaseCandidateBranch: 'rc',
      betaBranch: 'dev',
      prefix: '',
      dirAffected: 'dir1/',
      majorIdentifier: 'breaking:',
      minorIdentifier: 'feature:',
      folder: utils.tmpDirectory,
      previousVersion: true,
      newVersion: true
    }

    const options = new GitVersionOptions(optionsValues)

    const git = new GitVersion(options)

    utils.exec(`git init`)
    utils.exec(`git checkout -b ${options.releaseBranch}`)
    utils.exec(`git checkout -b v1`)
    utils.exec(`git commit --no-gpg-sign --allow-empty -m "commit-1"`)
    utils.exec(`git tag "1.0.0"`)

    utils.exec(`mkdir dir1 && "" > dir1/dummy_file.txt`)
    utils.exec(`git add dir1/`)
    utils.exec(`git commit --no-gpg-sign -m "breaking: 2"`)

    const version = git.getNewVersion()
    expect(version['version-complete']).toBe('2.0.0-alpha.1')

    utils.cleanup()
  })

  it('monorepo log-path filter (multiple dirs, multiple prefixes)', () => {
    const utils = new Utils()

    const optionsValues: Record<string, string | boolean> = {
      releaseBranch: 'main',
      releaseCandidateBranch: 'rc',
      betaBranch: 'dev',
      prefix: 'dir2-',
      dirAffected: 'dir2/ dir3/',
      majorIdentifier: 'breaking:',
      minorIdentifier: 'feature:',
      folder: utils.tmpDirectory,
      previousVersion: true,
      newVersion: true
    }

    const options = new GitVersionOptions(optionsValues)

    const git = new GitVersion(options)

    utils.exec(`git init`)
    utils.exec(`git checkout -b ${options.releaseBranch}`)

    // Create dir1 and tag dir1-1.0.0
    let baseDir = 'dir1'
    utils.exec(`mkdir ${baseDir} && "" > ${baseDir}/dummy_file.txt`)
    utils.exec(`git add ${baseDir}/`)
    utils.exec(`git commit --no-gpg-sign -m "breaking: commit-1"`)
    utils.exec(`git tag "dir1-1.0.0"`)

    // Create dir2 and tag dir2-1.0.0
    baseDir = 'dir2'
    utils.exec(`mkdir ${baseDir} && "" > ${baseDir}/dummy_file.txt`)
    utils.exec(`git add ${baseDir}/`)
    utils.exec(`git commit --no-gpg-sign -m "breaking: commit-2"`)
    utils.exec(`git tag "dir2-1.0.0"`)

    utils.exec(`git checkout -b ${options.betaBranch}`)

    // Create dir2 and commit breaking
    baseDir = 'dir2'
    utils.exec(`"" > ${baseDir}/dummy_file2.txt`)
    utils.exec(`git add ${baseDir}/`)
    utils.exec(`git commit --no-gpg-sign -m "breaking: commit-3"`)

    // git-version should accept the breaking tag on commit with dir2
    const version = git.getNewVersion()
    expect(version['version-complete']).toBe('dir2-2.0.0-beta.1')

    utils.cleanup()
  })

  it('should truncate long branch names in tags', () => {
    const utils = new Utils()

    const optionsValues: Record<string, string | boolean> = {
      releaseBranch: 'main',
      releaseCandidateBranch: 'rc',
      betaBranch: 'dev',
      prefix: '',
      majorIdentifier: 'breaking:',
      minorIdentifier: 'feature:',
      folder: utils.tmpDirectory,
      dirAffected: '',
      previousVersion: true,
      newVersion: true
    }

    const options = new GitVersionOptions(optionsValues)

    const git = new GitVersion(options)

    utils.exec(`git init`)
    utils.exec(
      `git checkout -b very-very-very-very-long-branch-name-that-excedes-k8s-limits`
    )
    utils.exec(`git commit -m "commit-1" --allow-empty`)
    utils.exec(`git tag "100.100.100"`)

    const version = git.getNewVersion()
    expect(version['version-complete']).toBe('100.100.101-alpha.0')

    utils.cleanup()
  })

  it('get previous version - first commit', () => {
    const utils = new Utils()

    const optionsValues: Record<string, string | boolean> = {
      releaseBranch: 'main',
      releaseCandidateBranch: 'rc',
      betaBranch: 'dev',
      prefix: '',
      majorIdentifier: 'breaking:',
      minorIdentifier: 'feature:',
      folder: utils.tmpDirectory,
      dirAffected: '',
      previousVersion: true,
      newVersion: true
    }

    const options = new GitVersionOptions(optionsValues)

    const git = new GitVersion(options)

    utils.exec(`git init`)
    utils.exec(`git checkout -b ${options.releaseBranch}`)
    utils.exec(`git commit --no-gpg-sign --allow-empty -m "commit-1"`)

    const version = git.getPreviousVersion()
    expect(version['previous-version-prefix']).toBe('0.0.0')

    utils.cleanup()
  })

  it('get previous version - first commit w/ prefix', () => {
    const utils = new Utils()

    const optionsValues: Record<string, string | boolean> = {
      releaseBranch: 'main',
      releaseCandidateBranch: 'rc',
      betaBranch: 'dev',
      prefix: 'v',
      majorIdentifier: 'breaking:',
      minorIdentifier: 'feature:',
      folder: utils.tmpDirectory,
      dirAffected: '',
      previousVersion: true,
      newVersion: true
    }

    const options = new GitVersionOptions(optionsValues)

    const git = new GitVersion(options)

    utils.exec(`git init`)
    utils.exec(`git checkout -b ${options.releaseBranch}`)
    utils.exec(`git commit --no-gpg-sign --allow-empty -m "commit-1"`)

    const version = git.getPreviousVersion()
    expect(version['previous-version-prefix']).toBe('v0.0.0')

    utils.cleanup()
  })

  it('get previous version - pre-tagged', () => {
    const utils = new Utils()

    const optionsValues: Record<string, string | boolean> = {
      releaseBranch: 'main',
      releaseCandidateBranch: 'rc',
      betaBranch: 'dev',
      prefix: 'v',
      majorIdentifier: 'breaking:',
      minorIdentifier: 'feature:',
      folder: utils.tmpDirectory,
      dirAffected: '',
      previousVersion: true,
      newVersion: true
    }

    const options = new GitVersionOptions(optionsValues)

    const git = new GitVersion(options)

    utils.exec(`git init`)
    utils.exec(`git checkout -b ${options.releaseBranch}`)
    utils.exec(`git commit --no-gpg-sign --allow-empty -m "commit-1"`)
    utils.exec(`git tag "v1.0.0"`)

    const version = git.getPreviousVersion()
    expect(version['previous-version-prefix']).toBe('v1.0.0')

    utils.cleanup()
  })
})
