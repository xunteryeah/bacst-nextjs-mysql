import nodemailer from "nodemailer";

export async function sendEmail({ name, tophone, message, purpose }) {
  // 初始化 transporter
  const transporter = nodemailer.createTransport({
    service: "qq", // 替换为你的邮箱服务，例如 "gmail", "163", "outlook"
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"网站联系表单" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_TO, // 接收者邮箱地址
    subject: "新的联系表单消息",
    html: `
  <div style="max-width: 600px; margin: 20px auto; padding: 24px; border: 1px solid #ddd; border-radius: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9f9f9;">
    <h2 style="color: #DD773F; border-bottom: 2px solid #DD773F; padding-bottom: 8px;">📨 来自网站的新联系请求</h2>
    
    <p style="margin: 16px 0;"><strong>👤 姓名：</strong> ${name}</p>
    <p style="margin: 16px 0;"><strong>📱 手机号：</strong> ${tophone}</p>
    <p style="margin: 16px 0;"><strong>🎯 目的：</strong> ${purpose}</p>
    <p style="margin: 16px 0;"><strong>💬 留言内容：</strong><br />
      <span style="display: inline-block; margin-top: 8px; background-color: #fff; padding: 12px; border-radius: 6px; border: 1px solid #ccc; line-height: 1.6;">${message}</span>
    </p>

    <p style="margin-top: 32px; font-size: 14px; color: #999;">此邮件由系统自动发送，请勿回复。</p>
  </div>
`,
  };

  // 执行发送
  await transporter.sendMail(mailOptions);
}