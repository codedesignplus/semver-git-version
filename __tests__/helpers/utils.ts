import { v4 as uuidv4 } from 'uuid'
import * as fs from 'fs'
import * as path from 'path'
import { spawnSync } from 'child_process'

export class Utils {
  public tmpDirectory: string

  public constructor() {
    const folder = uuidv4()

    this.tmpDirectory = path.resolve(path.join(__dirname, '../temp/', folder))

    if (fs.existsSync(this.tmpDirectory)) {
      fs.rmSync(this.tmpDirectory, { recursive: true, force: true })
    }

    fs.mkdirSync(this.tmpDirectory)
  }

  public exec(cmd: string): boolean {
    const result = spawnSync(cmd, {
      cwd: this.tmpDirectory,
      shell: true,
      stdio: ['inherit', 'inherit', 'inherit']
    })

    return result.status === 0 // Retorna true si el comando se ejecutó con éxito (status 0)
  }

  public cleanup(): void {
    if (fs.existsSync(this.tmpDirectory)) {
      fs.rmSync(this.tmpDirectory, { recursive: true, force: true })
    }
  }
}
