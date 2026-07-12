// src/core を supabase/functions/_shared/core にコピーする。
// Deno(Edge Functions)は相対importに拡張子が必須のため、
// `from "./x"` を `from "./x.ts"` に書き換えながらコピーする。
// 実行: npm run sync:edge （Edge Functionのデプロイ前に必ず実行する）
import { cpSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const SRC = fileURLToPath(new URL("../src/core", import.meta.url));
const DEST = fileURLToPath(new URL("../supabase/functions/_shared/core", import.meta.url));

rmSync(DEST, { recursive: true, force: true });
mkdirSync(DEST, { recursive: true });
cpSync(SRC, DEST, { recursive: true, filter: (src) => !src.endsWith(".test.ts") });

function rewriteImports(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      rewriteImports(p);
      continue;
    }
    if (!p.endsWith(".ts")) continue;
    const before = readFileSync(p, "utf8");
    const after = before.replace(/(from\s+["'])(\.{1,2}\/[^"']+?)(["'])/g, (m, pre, path, post) =>
      path.endsWith(".ts") || path.endsWith(".json") ? m : `${pre}${path}.ts${post}`
    );
    if (after !== before) writeFileSync(p, after);
  }
}
rewriteImports(DEST);
console.log(`synced src/core -> supabase/functions/_shared/core`);
