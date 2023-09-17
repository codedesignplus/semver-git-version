import * as core from '@actions/core'
import { GitVersion } from '../src/git-version'
import { run } from '../src/index'

jest.mock('@actions/core')
jest.mock('figlet')
jest.mock('../src/git-version')

describe('run function', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should set outputs for previous version', async () => {
    // Mocks
    const inputMock = core.getInput as jest.Mock

    inputMock
      .mockReturnValueOnce(process.cwd())
      .mockReturnValueOnce('main')
      .mockReturnValueOnce('rc')
      .mockReturnValueOnce('dev')
      .mockReturnValueOnce('breaking')
      .mockReturnValueOnce('feat')
      .mockReturnValueOnce('v')
      .mockReturnValueOnce('')
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false)

    const gitVersionMock = {
      getPreviousVersion: jest.fn().mockReturnValue({
        'previous-tag': 'v1.0',
        'previous-version': '1.0',
        'previous-version-prefix': 'prefix'
      }),
      getNewVersion: jest.fn()
    }

    const mock = GitVersion as jest.Mock

    mock.mockImplementation(() => gitVersionMock)

    await run()

    expect(core.setOutput).toHaveBeenCalledWith('previous-tag', 'v1.0')
    expect(core.setOutput).toHaveBeenCalledWith('previous-version', '1.0')
    expect(core.setOutput).toHaveBeenCalledWith(
      'previous-version-prefix',
      'prefix'
    )
  })

  it('should set outputs for new version', async () => {
    // Mocks
    const inputMock = core.getInput as jest.Mock

    inputMock
      .mockReturnValueOnce(process.cwd())
      .mockReturnValueOnce('main')
      .mockReturnValueOnce('rc')
      .mockReturnValueOnce('dev')
      .mockReturnValueOnce('breaking')
      .mockReturnValueOnce('feat')
      .mockReturnValueOnce('v')
      .mockReturnValueOnce('')
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true)

    const gitVersionMock = {
      getPreviousVersion: jest.fn(),
      getNewVersion: jest.fn().mockReturnValue({
        version: 'v2.0',
        'version-complete': 'prefix-v2.0'
      })
    }

    const mock = GitVersion as jest.Mock
    mock.mockImplementation(() => gitVersionMock)

    await run()

    expect(core.setOutput).toHaveBeenCalledWith('new-version', 'v2.0')
    expect(core.setOutput).toHaveBeenCalledWith(
      'new-version-prefix',
      'prefix-v2.0'
    )
  })

  it('should handle errors', async () => {
    const inputMock = core.getInput as jest.Mock
    inputMock
      .mockReturnValueOnce(process.cwd())
      .mockReturnValueOnce('main')
      .mockReturnValueOnce('rc')
      .mockReturnValueOnce('dev')
      .mockReturnValueOnce('breaking')
      .mockReturnValueOnce('feat')
      .mockReturnValueOnce('v')
      .mockReturnValueOnce('')
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)

    const mock = GitVersion as jest.Mock
    mock.mockImplementation(() => {
      throw new Error('Custom Error')
    })

    await run()

    expect(core.setFailed).toHaveBeenCalledWith('Custom Error')
  })
})
