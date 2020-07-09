import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as tc from '@actions/tool-cache'

async function run(): Promise<void> {
  try {
    // Required
    const application = core.getInput('application', { required: true })
    const token = core.getInput('token', { required: true })
    const version = core.getInput('version', { required: true })

    // Optional
    const signingKey = core.getInput('signing-key')
    const flags = core.getInput('flags')
    const draft = core.getInput('draft')

    // Mutated
    let platforms = core.getInput('platforms')
    let channel = core.getInput('channel')
    let pkg = core.getInput('package')

    let defaultPlatform = ''

    // Install the Equinox CLI tool
    const toolDir = tc.find('equinox', '1.14.0', 'x64')
    if (toolDir !== '') {
      core.addPath(toolDir)
    } else {
      switch(process.platform) {
        case 'win32': {
          defaultPlatform = 'windows_amd64'
          const downloadPath = await tc.downloadTool('https://bin.equinox.io/a/3tDrUv1NjAT/release-tool-1.14.0-windows-amd64.zip')
          const extPath = await tc.extractZip(downloadPath)
          const cachedPath = await tc.cacheDir(extPath, 'equinox', '1.14.0')
          core.addPath(cachedPath)
          break;
        }

        case 'darwin': {
          defaultPlatform = 'darwin_amd64'
          const downloadPath = await tc.downloadTool('https://bin.equinox.io/a/dsR9Yc3Uxrc/release-tool-1.14.0-darwin-amd64.zip')
          const extPath = await tc.extractZip(downloadPath)
          const cachedPath = await tc.cacheDir(extPath, 'equinox', '1.14.0')
          core.addPath(cachedPath)
          break;
        }

        case 'linux': {
          defaultPlatform = 'linux_amd64'
          const downloadPath = await tc.downloadTool('https://bin.equinox.io/a/hFqBgoEANbs/release-tool-1.14.0-linux-amd64.tar.gz')
          const extPath = await tc.extractTar(downloadPath)
          const cachedPath = await tc.cacheDir(extPath, 'equinox', '1.14.0')
          core.addPath(cachedPath)
          break;
        }

        default: {
          core.setFailed(`Unsupported platform: ${process.platform}`)
        }
      }
    }

    if (platforms === '') {
      platforms = defaultPlatform
    }

    if (channel === '') {
      channel = 'stable'
    }

    let args = [
      'release',
      `--app=${application}`,
      `--token=${token}`,
      `--channel=${channel}`,
      `--platforms=${platforms}`,
      `--version=${version}`,
    ]

    if (draft === 'true') {
      args.push('--draft')
    }

    if (signingKey !== '') {
      // TODO: Write key to a tmp location and remove it afterwards
      // TODO: Or set ENV
    }

    args.push('--')

    if (flags !== '') {
      args.push(flags)
    }

    if (pkg === '') {
      args.push(pkg)
    } else {
      args.push('.')
    }

    await exec.exec('equinox', args)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
