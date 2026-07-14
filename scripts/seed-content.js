// 把 translations.ts 里的默认内容写入 Sanity
// 运行：node scripts/seed-content.js
const { createClient } = require("@sanity/client");

const client = createClient({
  projectId: "penxmsws",
  dataset: "production",
  apiVersion: "2025-07-07",
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

const homePageDoc = {
  _id: "homePage",
  _type: "homePage",
  title: "Home Page",
  hero: {
    eyebrowEn: "Personal Element Reading",
    eyebrowZh: "个人五行能量解读",
    headline1En: "Your Eastern",
    headline1Zh: "你的专属",
    headline2En: "Element Blueprint",
    headline2Zh: "东方元素蓝图",
    descriptionEn:
      "Discover your personal colors, patterns and life themes through the wisdom of the Five Elements.",
    descriptionZh:
      "通过五行的古老智慧，发现属于你的专属色彩、人生模式与生命主题。",
    ctaEn: "Explore Your Blueprint",
    ctaZh: "探索你的能量蓝图",
    sampleBtnEn: "View Sample",
    sampleBtnZh: "查看样品",
    trust1En: "200+ Reports Delivered",
    trust1Zh: "已交付 200+ 份报告",
    trust2En: "Private & Secure",
    trust2Zh: "隐私安全保护",
  },
  mission: {
    eyebrowEn: "Our Mission",
    eyebrowZh: "品牌使命",
    headlineEn: "Bridging Ancient Wisdom and Modern Living",
    headlineZh: "连接古老智慧与现代生活",
    p1En:
      "We believe the Five Elements framework is not a prediction system — it is a language. A 2,000-year-old vocabulary for describing how energy moves through a person, a space, a season, a life.",
    p1Zh:
      "我们相信，五行体系不是一套预测系统——它是一种语言。一套拥有两千年历史的词汇，用来描述能量如何在一个人、一个空间、一个季节、一段生命中流动。",
    p2En:
      "Our work is to translate that vocabulary into a contemporary visual form. No dragons. No red lanterns. No fear-based copy. Just a personal aesthetic compass rooted in an ancient way of seeing.",
    p2Zh:
      "我们的工作，是将这套词汇转化为当代视觉形式。没有龙、没有红灯笼、没有贩卖恐惧的文案。只有一个植根于古老视角的个人美学指南。",
    ctaEn: "Learn Our Story",
    ctaZh: "了解更多",
  },
  howItWorks: {
    titleEn: "How It Unfolds",
    titleZh: "购买流程",
    steps: [
      {
        titleEn: "Share your birth story",
        titleZh: "填写出生信息",
        descEn: "Tell us your birth date, time, and location.",
        descZh: "告诉我们你的出生日期、时间和地点。",
      },
      {
        titleEn: "Listen to your chart",
        titleZh: "解读五行八字",
        descEn:
          "We map your Five Elements profile and identify your element, season, and color family.",
        descZh:
          "我们绘制你的五行画像，确定你的元素、季节和色彩家族。",
      },
      {
        titleEn: "Compose your visual world",
        titleZh: "设计专属视觉",
        descEn:
          "We craft your personal totem, color palette, and wallpaper set.",
        descZh:
          "我们创作你的个人图腾、色彩体系和壁纸组合。",
      },
      {
        titleEn: "Arrive in your inbox",
        titleZh: "数字交付",
        descEn:
          "Your complete Blueprint is delivered as a beautiful PDF within 3–5 days.",
        descZh:
          "你的完整能量蓝图以精美 PDF 形式在 3-5 天内发送到你的邮箱。",
      },
    ],
  },
  sample: {
    titleEn: "A Glimpse Inside",
    titleZh: "样品预览",
    descEn: "We'll send you a complete anonymous sample via email — no charge.",
    descZh: "我们将通过邮件发送一份完整的匿名样品——完全免费。",
    ctaEn: "Request Full Sample",
    ctaZh: "索取完整样品",
  },
  faq: {
    titleEn: "Questions You May Have",
    titleZh: "常见问题",
    questions: [
      {
        qEn: "What will I actually receive?",
        qZh: "我会收到什么？",
        aEn:
          "A PDF publication (30+ pages) plus individual image files of your totem, color palette, and wallpapers. Designed for both screen viewing and home printing.",
        aZh:
          "一份 PDF 报告（30+页），以及你的个人图腾、色彩体系和壁纸的独立图片文件。支持屏幕查看和家庭打印。",
      },
      {
        qEn: "Is this personal to me, or a template?",
        qZh: "这是个性化定制的，还是模板？",
        aEn:
          "Every report is calculated from your unique birth information. Your element profile, colors, and totem are yours alone.",
        aZh:
          "每份报告都根据你的独特出生信息计算生成。你的元素画像、色彩和图腾都是独一无二的。",
      },
      {
        qEn: "What if I don't know my exact birth time?",
        qZh: "如果我不知道准确的出生时间怎么办？",
        aEn:
          "An approximate time works. If you only know the date, we use a standard noon reference — just let us know in the notes.",
        aZh:
          "大致时间即可。如果你只知道日期，我们会使用标准中午时间作为参考——请在备注中说明。",
      },
      {
        qEn: "How long does delivery take?",
        qZh: "多久可以收到？",
        aEn:
          "Standard delivery is 3–5 business days. Gift and Priority editions are delivered within 2 business days.",
        aZh:
          "标准交付为 3-5 个工作日。礼物版和加急版在 2 个工作日内交付。",
      },
      {
        qEn: "Can I buy this as a gift?",
        qZh: "可以作为礼物购买吗？",
        aEn:
          "Yes — choose the Gift Edition at checkout. You can include a personal message, and we'll add a premium cover and bilingual version.",
        aZh:
          "可以——结账时选择礼物版。你可以附上个人留言，我们将添加精美封面和双语版本。",
      },
      {
        qEn: "Is this fortune-telling?",
        qZh: "这是算命吗？",
        aEn:
          "No. This is a personal visual publication rooted in the Eastern Five Elements framework — a cultural lens, not a prediction. Think of it as a mirror, not a map.",
        aZh:
          "不是。这是一份基于东方五行框架的个人视觉出版物——是一种文化视角，而非预测。它是一面镜子，不是一张地图。",
      },
      {
        qEn: "Is my birth information private?",
        qZh: "我的出生信息会被保密吗？",
        aEn:
          "Absolutely. Your information is used solely to create your report and is never shared, sold, or used for any other purpose.",
        aZh:
          "绝对保密。你的信息仅用于创建你的报告，不会被分享、出售或用于任何其他目的。",
      },
    ],
  },
  bestSellers: {
    subtitleEn: "Explore Our Most Loved",
    subtitleZh: "探索最受欢迎的产品",
    titleEn: "The Collection",
    titleZh: "产品系列",
    viewDetailsEn: "View Details",
    viewDetailsZh: "查看详情",
  },
  testimonialsSec: {
    titleEn: "Loved by People Worldwide",
    titleZh: "来自世界各地的声音",
  },
  benefits: {
    items: [
      { icon: "user", titleEn: "Deeply Personalized", titleZh: "深度个性化", descEn: "Every report is crafted to your unique birth chart and preferences.", descZh: "每份报告都根据你的独特出生信息和偏好精心制作。" },
      { icon: "flower", titleEn: "Ancient Wisdom, Modern Design", titleZh: "古老智慧，现代设计", descEn: "2,000-year-old framework translated into contemporary visual language.", descZh: "两千年的古老体系，转化为当代视觉语言。" },
      { icon: "file", titleEn: "Digital & Instant", titleZh: "数字交付，即时获取", descEn: "Delivered as a beautifully designed PDF. View on any device or print at home.", descZh: "以精美设计的 PDF 形式交付，可在任何设备上查看或打印。" },
      { icon: "gift", titleEn: "Meaningful Gifts", titleZh: "有意义的礼物", descEn: "A deeply personal present for weddings, birthdays, or new beginnings.", descZh: "送给婚礼、生日或人生新篇章的深度个性化礼物。" },
      { icon: "lock", titleEn: "Private & Secure", titleZh: "隐私安全", descEn: "Your birth information is never shared, sold, or used beyond your report.", descZh: "你的出生信息不会被分享、出售或用于报告之外的任何用途。" },
    ],
  },
};

const aboutPageDoc = {
  _id: "aboutPage",
  _type: "aboutPage",
  title: "About Page",
  headline1En: "Oriental Aesthetic",
  headline1Zh: "东方美学",
  headline2En: "is a design studio",
  headline2Zh: "立足于东方智慧",
  headline3En: "at the intersection of Eastern wisdom and visual storytelling",
  headline3Zh: "与视觉叙事的交汇点",
  values: [
    { titleEn: "Modern, not mystical", titleZh: "现代，而非神秘", descEn: "We translate ancient wisdom into contemporary visual language — no dragons, no superstition.", descZh: "我们将古老智慧转化为当代视觉语言——没有龙，没有迷信。" },
    { titleEn: "Personal, not generic", titleZh: "专属，而非模板", descEn: "Every report begins with your unique birth chart. No two Blueprints are alike.", descZh: "每份报告都始于你独一无二的出生信息。没有两份蓝图是相同的。" },
    { titleEn: "Beautiful, not loud", titleZh: "安静，而非喧嚣", descEn: "Our aesthetic is calm, editorial, and restrained. We let the elements speak softly.", descZh: "我们的美学是安静、编辑式、克制的。让元素轻声诉说。" },
  ],
  ctaHeadingEn: "Ready to discover your elements?",
  ctaHeadingZh: "准备好探索你的五行蓝图了吗？",
};

const siteSettingsDoc = {
  _id: "siteSettings",
  _type: "siteSettings",
  brandNameEn: "ORIENTAL AESTHETIC",
  brandNameZh: "东方美学",
  footerDescEn:
    "A design studio working at the intersection of Eastern wisdom and visual storytelling.",
  footerDescZh:
    "一家立足于东方智慧与视觉叙事交汇点的设计工作室。",
  disclaimerEn:
    "This is not medical, legal, or financial advice. Our work is a cultural and aesthetic exploration rooted in the Eastern Five Elements tradition.",
  disclaimerZh:
    "本产品不构成医疗、法律或财务建议。我们的工作是基于东方五行传统的文化与审美探索。",
  contactEmail: "hello@orientalaesthetic.com",
  instagramUrl: "",
  pinterestUrl: "",
};

async function seed() {
  if (!process.env.SANITY_WRITE_TOKEN) {
    console.log("\n请先设置 SANITY_WRITE_TOKEN 环境变量：");
    console.log(
      "1. 打开 https://penxmsws.sanity.manage → API → Tokens"
    );
    console.log('2. 创建 Token（Editor 权限）→ 复制');
    console.log(
      "3. 运行: SANITY_WRITE_TOKEN=你的token node scripts/seed-content.js\n"
    );
    process.exit(1);
  }

  console.log("写入 Site Settings...");
  await client.createOrReplace(siteSettingsDoc);
  console.log("✓ Site Settings 写入成功");

  console.log("写入 Home Page...");
  await client.createOrReplace(homePageDoc);
  console.log("✓ Home Page 写入成功");

  console.log("写入 About Page...");
  await client.createOrReplace(aboutPageDoc);
  console.log("✓ About Page 写入成功");

  console.log("\n全部完成！打开 http://localhost:3333 就能编辑所有页面内容了。");
}

seed().catch((err) => {
  console.error("出错:", err.message);
  process.exit(1);
});
