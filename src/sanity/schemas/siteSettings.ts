import { defineType, defineField } from "sanity";

export const siteSettingsSchema = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({ name: "brandNameEn", title: "Brand Name (EN)", type: "string", initialValue: "ORIENTAL AESTHETIC" }),
    defineField({ name: "brandNameZh", title: "Brand Name (中文)", type: "string", initialValue: "东方美学" }),
    defineField({ name: "footerDescEn", title: "Footer Description (EN)", type: "text", rows: 2, initialValue: "A design studio working at the intersection of Eastern wisdom and visual storytelling." }),
    defineField({ name: "footerDescZh", title: "Footer Description (中文)", type: "text", rows: 2, initialValue: "一家立足于东方智慧与视觉叙事交汇点的设计工作室。" }),
    defineField({ name: "disclaimerEn", title: "Disclaimer (EN)", type: "text", rows: 3, initialValue: "This is not medical, legal, or financial advice. Our work is a cultural and aesthetic exploration rooted in the Eastern Five Elements tradition." }),
    defineField({ name: "disclaimerZh", title: "Disclaimer (中文)", type: "text", rows: 3, initialValue: "本产品不构成医疗、法律或财务建议。我们的工作是基于东方五行传统的文化与审美探索。" }),
    defineField({ name: "contactEmail", title: "Contact Email", type: "string", initialValue: "hello@orientalaesthetic.com" }),
    defineField({ name: "instagramUrl", title: "Instagram URL", type: "url" }),
    defineField({ name: "pinterestUrl", title: "Pinterest URL", type: "url" }),
  ],
});
