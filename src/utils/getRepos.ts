import fs from 'fs-extra'
import simplegit from 'simple-git/promise'
import pFilter from './pFilter'

const isGitRepo = async (path: string) => {
  const stat = await fs.lstat(path)
  if (!stat.isDirectory()) return false
  if (!(await fs.pathExists(`${path}/.git`))) return false

  const git = simplegit(path)
  return git.status().then(() => true).catch(() => false)
}

export default async (path: string): Promise<string[]> => {
  const filesAndFolders = await fs.readdir(path)
  return pFilter(filesAndFolders.map(name => `${path}/${name}`), async name => isGitRepo(name))
}
