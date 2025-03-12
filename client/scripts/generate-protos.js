import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const PROTO_DIR = path.resolve("../protos"); // Folder containing .proto files
const OUTPUT_DIR = path.resolve("generated"); // Output folder for generated files

// ✅ Ensure the output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log("📂 Created 'generated' folder.");
}

// Find all .proto files in the directory
const protoFiles = fs.readdirSync(PROTO_DIR).filter(file => file.endsWith(".proto"));

if (protoFiles.length === 0) {
  console.log("❌ No .proto files found.");
  process.exit(1);
}

console.log(`🔍 Found ${protoFiles.length} .proto files. Generating...`);

protoFiles.forEach(protoFile => {
  const protoPath = path.join(PROTO_DIR, protoFile);
  const outputJS = path.join(OUTPUT_DIR, protoFile.replace(".proto", ".js"));
  const outputTS = path.join(OUTPUT_DIR, protoFile.replace(".proto", ".d.ts"));

  try {
    // Generate JavaScript using pbjs
    execSync(`npx pbjs -t static-module -w commonjs -o "${outputJS}" "${protoPath}"`);
    console.log(`✅ Generated: ${outputJS}`);

    // Generate TypeScript definitions using pbts
    execSync(`npx pbts -o "${outputTS}" "${outputJS}"`);
    console.log(`✅ Generated: ${outputTS}`);
  } catch (err) {
    console.error(`❌ Error processing ${protoFile}:`, err);
  }
});

console.log("🎉 Protobuf generation complete!");
