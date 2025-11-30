import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import mime from "mime";

// ========== 你的 Supabase 配置 ==========
const SUPABASE_URL = "https://eogpqxpzwwpdxdmgbglo.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvZ3BxeHB6d3dwZHhkbWdiZ2xvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjA0NzE4OCwiZXhwIjoyMDc3NjIzMTg4fQ.nJ1i3QYv3rKc3plz-IP7JDuxrI9PbvY2U5n_lQ0cMOc";
const BUCKET = "images";
const LOCAL_DIR = "/Users/huruoqi/Desktop/local_experiment_images";
const REMOTE_PREFIX = "Experiment/GroupA"; // 如果要上传 GroupB，改成 Experiment/GroupB
// =======================================

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

// 遍历目录获取所有图片
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, arrayOfFiles);
    } else if (/\.(jpg|jpeg|png|webp)$/i.test(file)) {
      arrayOfFiles.push(filePath);
    }
  }
  return arrayOfFiles;
}

async function uploadFile(localPath) {
  const relativePath = path.relative(LOCAL_DIR, localPath).replace(/\\/g, "/");
  const storagePath = `${REMOTE_PREFIX}/${relativePath}`;
  const buffer = fs.readFileSync(localPath);
  const contentType = mime.getType(localPath) || "application/octet-stream";

  console.log(`⬆️ Uploading: ${storagePath}`);
  const { error } = await supabase.storage.from(BUCKET).upload(storagePath, buffer, {
    contentType,
    upsert: true,
  });
  if (error) {
    console.error("❌ Upload failed:", error.message);
    return null;
  }

  // 写入数据库
  const groupKey = storagePath.includes("GroupB") ? "B" : "A";
  const { error: dbError } = await supabase
    .from("images")
    .upsert(
      {
        storage_path: storagePath,
        is_practice: false,
        group_key: groupKey,
      },
      { onConflict: "storage_path" }
    );
  if (dbError) console.error("⚠️ DB insert failed:", dbError.message);
  else console.log(`✅ Done: ${storagePath}`);
}

(async () => {
  const files = getAllFiles(LOCAL_DIR);
  if (files.length === 0) {
    console.error("⚠️ 没有找到任何图片，请检查 local_experiment_images 文件夹。");
    process.exit(0);
  }
  console.log(`📂 Found ${files.length} files.`);
  for (const f of files) {
    await uploadFile(f);
  }
  console.log("🎉 All uploads completed!");
})();
