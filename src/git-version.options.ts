export class GitVersionOptions {
  public releaseBranch = 'main'
  public releaseCandidateBranch = 'rc'
  public betaBranch = 'dev'
  public prefix = ''
  public dirAffected = ''
  public majorIdentifier = 'breaking'
  public minorIdentifier = 'feat'

  public majorIdIsRegex = false
  public minorIdIsRegex = false

  public releaseCandidateBranchSufix = 'rc'
  public developmentBranchSufix = 'beta'
  public defaultSufix = 'alpha'

  public folder = process.cwd()
  public previousVersion: boolean
  public newVersion: boolean

  public constructor(options: Record<string, string | boolean>) {
    this.releaseBranch = options.releaseBranch as string
    this.releaseCandidateBranch = options.releaseCandidateBranch as string
    this.betaBranch = options.betaBranch as string
    this.majorIdentifier = options.majorIdentifier as string
    this.minorIdentifier = options.minorIdentifier as string
    this.prefix = options.prefix as string
    this.dirAffected = options.dirAffected as string
    this.folder = options.folder as string

    this.previousVersion = JSON.parse(options.previousVersion as string)
    this.newVersion = JSON.parse(options.newVersion as string)

    let match = /\/(.*)\//.exec(this.majorIdentifier)
    if (match) {
      this.majorIdentifier = match[1]
      this.majorIdIsRegex = true
    }

    match = /\/(.*)\//.exec(this.minorIdentifier)
    if (match) {
      this.minorIdentifier = match[1]
      this.minorIdIsRegex = true
    }
  }

  public logPathsFilter(): string {
    return this.dirAffected.length === 0 ? '' : `-- ${this.dirAffected}`
  }
}
