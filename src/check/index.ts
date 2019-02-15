import ora from 'ora'
import spinify from '../utils/spinify'
import { headline, repository } from '../style'
import getRepos from '../utils/getRepos'
import getDetails from './getDetails'

const check = async (path: string, spinner: ora.Ora) => {
  const repos = await spinify(spinner, 'searching git repository', getRepos(path))
  const details = await spinify(spinner, 'scanning repository details', getDetails(repos))

  details.forEach(({ name, items }) => {
    console.log(headline(name))
    items.forEach(item => console.log(repository(item)))
  })
}

export default (path: string) => {
  const spinner = ora('').start()
  check(path, spinner)
    .then(() => spinner.stop())
    .catch(err => {
      spinner.fail()
      console.log(err.stack)
      process.exit(1)
    })
}
