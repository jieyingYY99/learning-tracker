import { seedKV } from "../src/lib/kv";

async function main() {
  await seedKV();
}

main().catch(console.error);
