import { Ora } from 'ora'

export default function spinify<T>(spinner: Ora, text: string, waiter: Promise<T>): Promise<T> {
  spinner.start(text)
  return waiter.then(result => {
    spinner.succeed(text)
    return result
  })
}
