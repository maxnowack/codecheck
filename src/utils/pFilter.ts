import pMap from 'p-map'

interface Options {
  concurrency?: number
}

export default async function pFilter<T>(
  iterable: T[],
  filterer: (item: T, index: number) => Promise<boolean>,
  opts?: Options,
): Promise<T[]> {
  return pMap(iterable, (el, i) => Promise.all([filterer(el, i), el]), opts)
    .then(values => values.filter(x => Boolean(x[0])).map(x => x[1]))
}
