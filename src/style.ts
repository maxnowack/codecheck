import chalk from 'chalk'
import terminalLink, { isSupported } from 'terminal-link'

const link = (path: string) => {
  const name = path.split('/').pop() || ''
  if (!isSupported) return name
  return terminalLink(name, `file://${path}`)
}

export const headline = (text: string) => {
  return `\n\n\n  ${chalk.bold.underline(text)}\n`
}

export const repository = (path: string) => {
  return chalk.red('   ⤑') + chalk.reset(`   ${link(path)}`)
}
