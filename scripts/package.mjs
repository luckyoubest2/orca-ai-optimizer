// 打包 Orca Note 插件 release 产物。
// 结构必须与官方插件包一致：package.json / dist / icon.png / README.md 直接位于
// 压缩包根目录（扁平结构），否则安装器会报 "Invalid plugin package: package.json not found"。
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs"
import { execFileSync } from "node:child_process"
import { fileURLToPath } from "node:url"
import path from "node:path"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const { name, version } = JSON.parse(
  await import("node:fs/promises").then(({ readFile }) => readFile(path.join(root, "package.json"), "utf8")),
)

const dist = path.join(root, "dist")
if (!existsSync(dist)) {
  console.error("未找到 dist/，请先运行 pnpm build")
  process.exit(1)
}

const stage = path.join(root, "release", name)
rmSync(stage, { recursive: true, force: true })
mkdirSync(stage, { recursive: true })

for (const entry of ["package.json", "dist", "icon.png", "README.md"]) {
  cpSync(path.join(root, entry), path.join(stage, entry), { recursive: true })
}

const out = path.join(root, `${name}-v${version}.zip`)
rmSync(out, { force: true })
execFileSync(
  "powershell.exe",
  [
    "-NoProfile",
    "-Command",
    `Compress-Archive -Path (Join-Path ${JSON.stringify(stage)} '*') -DestinationPath ${JSON.stringify(out)} -CompressionLevel Optimal`,
  ],
  { stdio: "inherit", cwd: root },
)

console.log(`已生成 ${path.relative(root, out)}`)
console.log(`插件包目录: ${path.relative(root, stage)}`)
