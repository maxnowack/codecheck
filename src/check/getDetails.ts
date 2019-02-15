import fs from 'fs-extra'
import { subMonths } from 'date-fns'
import simplegit from 'simple-git/promise'
import pFilter from '../utils/pFilter'

interface Details {
  name: string
  description?: string
  items: string[]
}

const factory = (
  name: string,
  fn: (git: simplegit.SimpleGit, repo: string) => Promise<boolean>,
) => async (repos: string[]): Promise<Details> => ({
  name,
  items: await pFilter(repos, async repoPath => {
    const git = simplegit(repoPath)
    return fn(git, repoPath)
  }),
})

export const dirtyRepos = factory('dirty repositories', async git => {
  const status = await git.status()
  return !status.isClean()
})

export const noGithubRemote = factory('no github remote set', async git => {
  const remotes = await git.getRemotes(true)
  return !remotes.reduce((exists, remote) => {
    if (exists) return true
    return remote.refs.push.toLowerCase().indexOf('github.com') > -1
  }, false)
})

export const gitlabRemote = factory('gitlab remote set', async git => {
  const remotes = await git.getRemotes(true)
  const gitlabRemoteSet = remotes.reduce((exists, remote) => {
    if (exists) return true
    return remote.refs.push.toLowerCase().indexOf('gitlab.com') > -1
  }, false)

  const githubRemoteSet = remotes.reduce((exists, remote) => {
    if (exists) return true
    return remote.refs.push.toLowerCase().indexOf('github.com') > -1
  }, false)

  return gitlabRemoteSet && !githubRemoteSet
})

export const notPushed = factory('current branch not pushed', async git => {
  const status = await git.status()
  return status.ahead > 0
})

export const abandoned = factory('abandoned repositories', async (git, repo) => {
  const tresholdDate = subMonths(new Date(), 6).getTime()
  const files = await pFilter(await fs.readdir(repo), async f => {
    if (['.DS_Store', 'node_modules', '.git'].includes(f)) return false
    const stat = await fs.lstat(`${repo}/${f}`)
    return stat.mtimeMs >= tresholdDate
  })
  return files.length <= 0
})

export default async (repos: string[]): Promise<Details[]> => {
  return Promise.all([
    dirtyRepos(repos),
    noGithubRemote(repos),
    notPushed(repos),
    gitlabRemote(repos),
    abandoned(repos),
  ]).then(details => details.filter(d => d.items.length > 0))
}
