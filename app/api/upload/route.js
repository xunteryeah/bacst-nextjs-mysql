// import { NextResponse } from "next/server";
// import fs from "fs/promises";
// import path from "path";

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

// export async function POST(request) {
//   try {
//     const uploadDir = path.join(process.cwd(), "public", "uploads");
//     await fs.mkdir(uploadDir, { recursive: true });

//     const formData = await request.formData();
//     const file = formData.get("file");
    
//     if (!file) {
//       return NextResponse.json({ error: "未检测到文件" }, { status: 400 });
//     }

//     const buffer = await file.arrayBuffer();
//     const fileName = `${Date.now()}_${file.name}`;
//     const filePath = path.join(uploadDir, fileName);
    
//     await fs.writeFile(filePath, Buffer.from(buffer));
    
//     return NextResponse.json({ 
//       filePath: `/uploads/${fileName}` 
//     }, { status: 200 });
    
//   } catch (error) {
//     return NextResponse.json({ 
//       error: "文件上传失败",
//       details: error.message 
//     }, { status: 500 });
//   }
// }

import { NextResponse } from 'next/server';
import COS from 'cos-nodejs-sdk-v5';

// 初始化COS实例
const cos = new COS({
  SecretId: process.env.TENCENT_COS_SECRET_ID,
  SecretKey: process.env.TENCENT_COS_SECRET_KEY,
});

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    
    if (!file) {
      return NextResponse.json({ error: "未检测到文件" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const fileName = `${Date.now()}_${file.name}`;
    
    // 上传到腾讯云COS
    const uploadResult = await new Promise((resolve, reject) => {
      cos.putObject({
        Bucket: process.env.TENCENT_COS_BUCKET, // 存储桶名称，格式：BucketName-APPID
        Region: process.env.TENCENT_COS_REGION, // 存储桶所在地域
        Key: fileName, // 对象键（文件名）
        Body: Buffer.from(buffer), // 文件内容
        ContentLength: buffer.byteLength, // 文件大小
      }, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
    
    // 构建完整的访问URL
    const fileUrl = `https://${process.env.TENCENT_COS_BUCKET}.cos.${process.env.TENCENT_COS_REGION}.myqcloud.com/${fileName}`;
    
    return NextResponse.json({ 
      filePath: fileUrl
    }, { status: 200 });
    
  } catch (error) {
    console.error('COS上传失败:', error);
    return NextResponse.json({ 
      error: "文件上传失败",
      details: error.message 
    }, { status: 500 });
  }
}