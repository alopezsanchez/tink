'use strict'

let ensurePkg
let prepare

const figgyPudding = require('figgy-pudding')

const MainOpts = figgyPudding({
  log: { default: () => require('libnpm').log },
  loglevel: { default: 'notice' }
}, {
  other () { return true }
})

if (require.main === module && process.argv[2] === 'ensure-pkg') {
  main(...process.argv.slice(3))
}

module.exports = main
async function main (cache, integrity, pkg, opts) {
  opts = MainOpts(JSON.parse(opts)).concat({
    cache,
    integrity,
    'restore-missing': true,
    force: true
  })
  if (!opts.log) {
    opts = opts.concat({ log: require('npmlog') })
    opts.log.heading = 'tink'
    opts.log.level = opts.loglevel
  }
  pkg = JSON.parse(pkg)
  opts.log.notice('fs', 'fetching', `${pkg.name}@${pkg.version}`)
  try {
    if (!prepare) { prepare = require('./commands/prepare.js') }
    const res = await prepare([pkg.name], opts)
    if (res && !res.pkgCount) { throw new Error('no packages installed') }
  } catch (err) {
    if (!ensurePkg) { ensurePkg = require('./ensure-package.js') }
    await ensurePkg(cache, pkg.name, pkg, opts)
  }
}
