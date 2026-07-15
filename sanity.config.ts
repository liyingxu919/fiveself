import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { presentationTool } from "sanity/presentation";
import { schemas } from "./src/sanity/schemas";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "penxmsws";
const dataset = process.env.SANITY_STUDIO_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export default defineConfig({
  name: "oriental-aesthetic",
  title: "FiveSelf · 后台管理",
  projectId,
  dataset,
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("网站内容管理")
          .items([
            // ── 页面内容 ──
            S.listItem()
              .title("🏠 首页 Home Page")
              .child(
                S.document()
                  .schemaType("homePage")
                  .documentId("homePage")
                  .title("首页内容编辑")
              ),
            S.listItem()
              .title("📖 关于页 About Page")
              .child(
                S.document()
                  .schemaType("aboutPage")
                  .documentId("aboutPage")
                  .title("关于页内容编辑")
              ),

            S.divider(),

            // ── 电商内容 ──
            S.listItem()
              .title("🛍 产品 Products")
              .schemaType("product")
              .child(
                S.documentTypeList("product").title("所有产品")
              ),
            S.listItem()
              .title("⭐ 用户评价 Testimonials")
              .schemaType("testimonial")
              .child(
                S.documentTypeList("testimonial").title("所有评价")
              ),

            S.divider(),

            // ── 全局设置 ──
            S.listItem()
              .title("⚙️ 网站设置 Site Settings")
              .child(
                S.document()
                  .schemaType("siteSettings")
                  .documentId("siteSettings")
                  .title("全局设置（品牌名/邮箱/Footer）")
              ),

            S.divider(),

            // ── 报告 ──
            S.listItem()
              .title("📊 已生成的报告 Reports")
              .schemaType("report")
              .child(
                S.documentTypeList("report").title("客户报告列表")
              ),
          ]),
    }),
    presentationTool({
      previewUrl: {
        origin: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:5173",
        previewMode: { enable: "/api/draft" },
      },
    }),
  ],
  schema: { types: schemas },
});
