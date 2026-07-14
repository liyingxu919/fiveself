export type Lang = "en" | "zh";

export const t = {
  // ── Header ──
  nav: {
    shop: { en: "Shop", zh: "精品" },
    howItWorks: { en: "How It Works", zh: "购买流程" },
    sampleReport: { en: "Sample Report", zh: "样品预览" },
    about: { en: "About", zh: "关于我们" },
    faqs: { en: "FAQs", zh: "常见问题" },
  },

  // ── Hero ──
  hero: {
    eyebrow: { en: "Personal Element Reading", zh: "个人五行能量解读" },
    headline1: { en: "Your Eastern", zh: "你的专属" },
    headline2: { en: "Element Blueprint", zh: "东方元素蓝图" },
    description: {
      en: "Discover your personal colors, patterns and life themes through the wisdom of the Five Elements.",
      zh: "通过五行的古老智慧，发现属于你的专属色彩、人生模式与生命主题。",
    },
    cta: { en: "Explore Your Blueprint", zh: "探索你的能量蓝图" },
    viewSample: { en: "View Sample", zh: "查看样品" },
    trust1: { en: "200+ Reports Delivered", zh: "已交付 200+ 份报告" },
    trust2: { en: "Private & Secure", zh: "隐私安全保护" },
  },

  // ── Benefits Strip ──
  benefits: {
    heading: { en: "Why Choose Us", zh: "为什么选择我们" },
    items: [
      {
        title: { en: "Deeply Personalized", zh: "深度个性化" },
        desc: {
          en: "Every report is crafted to your unique birth chart and preferences.",
          zh: "每份报告都根据你的独特出生信息和偏好精心制作。",
        },
      },
      {
        title: { en: "Ancient Wisdom, Modern Design", zh: "古老智慧，现代设计" },
        desc: {
          en: "2,000-year-old framework translated into contemporary visual language.",
          zh: "两千年的古老体系，转化为当代视觉语言。",
        },
      },
      {
        title: { en: "Digital & Instant", zh: "数字交付，即时获取" },
        desc: {
          en: "Delivered as a beautifully designed PDF. View on any device or print at home.",
          zh: "以精美设计的 PDF 形式交付，可在任何设备上查看或打印。",
        },
      },
      {
        title: { en: "Meaningful Gifts", zh: "有意义的礼物" },
        desc: {
          en: "A deeply personal present for weddings, birthdays, or new beginnings.",
          zh: "送给婚礼、生日或人生新篇章的深度个性化礼物。",
        },
      },
      {
        title: { en: "Private & Secure", zh: "隐私安全" },
        desc: {
          en: "Your birth information is never shared, sold, or used beyond your report.",
          zh: "你的出生信息不会被分享、出售或用于报告之外的任何用途。",
        },
      },
    ],
  },

  // ── Best Sellers ──
  bestSellers: {
    subtitle: { en: "Explore Our Most Loved", zh: "探索最受欢迎的产品" },
    title: { en: "The Collection", zh: "产品系列" },
    viewDetails: { en: "View Details", zh: "查看详情" },
  },

  // ── Mission ──
  mission: {
    eyebrow: { en: "Our Mission", zh: "品牌使命" },
    headline: {
      en: "Bridging Ancient Wisdom and Modern Living",
      zh: "连接古老智慧与现代生活",
    },
    p1: {
      en: "We believe the Five Elements framework is not a prediction system — it is a language. A 2,000-year-old vocabulary for describing how energy moves through a person, a space, a season, a life.",
      zh: "我们相信，五行体系不是一套预测系统——它是一种语言。一套拥有两千年历史的词汇，用来描述能量如何在一个人、一个空间、一个季节、一段生命中流动。",
    },
    p2: {
      en: "Our work is to translate that vocabulary into a contemporary visual form. No dragons. No red lanterns. No fear-based copy. Just a personal aesthetic compass rooted in an ancient way of seeing.",
      zh: "我们的工作，是将这套词汇转化为当代视觉形式。没有龙、没有红灯笼、没有贩卖恐惧的文案。只有一个植根于古老视角的个人美学指南。",
    },
    cta: { en: "Learn Our Story", zh: "了解更多" },
  },

  // ── Testimonials ──
  testimonials: {
    title: { en: "Loved by People Worldwide", zh: "来自世界各地的声音" },
  },

  // ── How It Works ──
  howItWorks: {
    title: { en: "How It Unfolds", zh: "购买流程" },
    steps: [
      {
        title: { en: "Share your birth story", zh: "填写出生信息" },
        desc: { en: "Tell us your birth date, time, and location.", zh: "告诉我们你的出生日期、时间和地点。" },
      },
      {
        title: { en: "Listen to your chart", zh: "解读五行八字" },
        desc: { en: "We map your Five Elements profile and identify your element, season, and color family.", zh: "我们绘制你的五行画像，确定你的元素、季节和色彩家族。" },
      },
      {
        title: { en: "Compose your visual world", zh: "设计专属视觉" },
        desc: { en: "We craft your personal totem, color palette, and wallpaper set.", zh: "我们创作你的个人图腾、色彩体系和壁纸组合。" },
      },
      {
        title: { en: "Arrive in your inbox", zh: "数字交付" },
        desc: { en: "Your complete Blueprint is delivered as a beautiful PDF within 3–5 days.", zh: "你的完整能量蓝图以精美 PDF 形式在 3-5 天内发送到你的邮箱。" },
      },
    ],
  },

  // ── Sample ──
  sample: {
    title: { en: "A Glimpse Inside", zh: "样品预览" },
    desc: { en: "We'll send you a complete anonymous sample via email — no charge.", zh: "我们将通过邮件发送一份完整的匿名样品——完全免费。" },
    cta: { en: "Request Full Sample", zh: "索取完整样品" },
  },

  // ── FAQ ──
  faq: {
    title: { en: "Questions You May Have", zh: "常见问题" },
    questions: [
      {
        q: { en: "What will I actually receive?", zh: "我会收到什么？" },
        a: { en: "A PDF publication (30+ pages) plus individual image files of your totem, color palette, and wallpapers. Designed for both screen viewing and home printing.", zh: "一份 PDF 报告（30+页），以及你的个人图腾、色彩体系和壁纸的独立图片文件。支持屏幕查看和家庭打印。" },
      },
      {
        q: { en: "Is this personal to me, or a template?", zh: "这是个性化定制的，还是模板？" },
        a: { en: "Every report is calculated from your unique birth information. Your element profile, colors, and totem are yours alone.", zh: "每份报告都根据你的独特出生信息计算生成。你的元素画像、色彩和图腾都是独一无二的。" },
      },
      {
        q: { en: "What if I don't know my exact birth time?", zh: "如果我不知道准确的出生时间怎么办？" },
        a: { en: "An approximate time works. If you only know the date, we use a standard noon reference — just let us know in the notes.", zh: "大致时间即可。如果你只知道日期，我们会使用标准中午时间作为参考——请在备注中说明。" },
      },
      {
        q: { en: "How long does delivery take?", zh: "多久可以收到？" },
        a: { en: "Standard delivery is 3–5 business days. Gift and Priority editions are delivered within 2 business days.", zh: "标准交付为 3-5 个工作日。礼物版和加急版在 2 个工作日内交付。" },
      },
      {
        q: { en: "Can I buy this as a gift?", zh: "可以作为礼物购买吗？" },
        a: { en: "Yes — choose the Gift Edition at checkout. You can include a personal message, and we'll add a premium cover and bilingual version.", zh: "可以——结账时选择礼物版。你可以附上个人留言，我们将添加精美封面和双语版本。" },
      },
      {
        q: { en: "Is this fortune-telling?", zh: "这是算命吗？" },
        a: { en: "No. This is a personal visual publication rooted in the Eastern Five Elements framework — a cultural lens, not a prediction. Think of it as a mirror, not a map.", zh: "不是。这是一份基于东方五行框架的个人视觉出版物——是一种文化视角，而非预测。它是一面镜子，不是一张地图。" },
      },
      {
        q: { en: "Is my birth information private?", zh: "我的出生信息会被保密吗？" },
        a: { en: "Absolutely. Your information is used solely to create your report and is never shared, sold, or used for any other purpose.", zh: "绝对保密。你的信息仅用于创建你的报告，不会被分享、出售或用于任何其他目的。" },
      },
    ],
  },

  // ── Footer ──
  footer: {
    brandDesc: {
      en: "A design studio working at the intersection of Eastern wisdom and visual storytelling.",
      zh: "一家立足于东方智慧与视觉叙事交汇点的设计工作室。",
    },
    collection: { en: "Collection", zh: "产品系列" },
    contact: { en: "Contact", zh: "联系我们" },
    blueprint: { en: "Blueprint", zh: "能量蓝图" },
    annualGuide: { en: "Annual Guide", zh: "年度指南" },
    giftEdition: { en: "Gift Edition", zh: "礼物版" },
    disclaimer: {
      en: "This is not medical, legal, or financial advice. Our work is a cultural and aesthetic exploration rooted in the Eastern Five Elements tradition.",
      zh: "本产品不构成医疗、法律或财务建议。我们的工作是基于东方五行传统的文化与审美探索。",
    },
    copyright: {
      en: "Oriental Aesthetic Studio",
      zh: "东方美学工作室",
    },
  },

  // ── Shared ──
  shared: {
    brandName: { en: "ORIENTAL AESTHETIC", zh: "东方美学" },
  },
} as const;
