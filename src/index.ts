#!/usr/bin/env node
import program from 'commander'
import check from './check'

program
  .command('check <path>')
  .action(path => check(path))

program
  .command('cleanup <path>')
  .action(path => {
    console.log('cleanup', { path })
  })

program.parse(process.argv)
