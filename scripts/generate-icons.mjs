import sharp from 'sharp'
import { readFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const svgPath = join(root, 'public', 'somarhelp-icon.svg')
const outDir = join(root, 'public', 'icons')

mkdirSync(outDir, { recursive: true })

const svgBuffer = readFileSync(svgPath)

const sizes = [16, 32, 72, 96, 128, 144, 152, 180, 192, 384, 512]

async function generate() {
  for (const size of sizes) {
    let name
    if (size === 16) name = 'favicon-16x16.png'
    else if (size === 32) name = 'favicon-32x32.png'
    else if (size === 180) name = 'apple-touch-icon.png'
    else name = `icon-${size}x${size}.png`

    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(join(outDir, name))

    console.log(`Generated ${name}`)
  }

  // Generate favicon.ico (32x32 PNG renamed)
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(join(root, 'public', 'favicon.ico'))

  console.log('Generated favicon.ico')
  console.log('All icons generated!')
}

generate().catch(console.error)
