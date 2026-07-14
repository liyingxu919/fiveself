import { defineType, defineField } from "sanity";

const biField = (name: string, title: string, rows = 2) => [
  defineField({ name: `${name}En`, title: `${title} (EN)`, type: "text", rows }),
  defineField({ name: `${name}Zh`, title: `${title} (中文)`, type: "text", rows }),
];

export const homePageSchema = defineType({
  name: "homePage",
  title: "Home Page",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Internal Title", type: "string", initialValue: "Home Page" }),

    defineField({
      name: "hero",
      title: "▸ Hero Section",
      type: "object",
      options: { collapsible: true, collapsed: false },
      fields: [
        ...biField("eyebrow", "Eyebrow"),
        ...biField("headline1", "Headline Line 1"),
        ...biField("headline2", "Headline Line 2"),
        ...biField("description", "Description"),
        ...biField("cta", "CTA Button"),
        ...biField("sampleBtn", "Sample Button"),
        ...biField("trust1", "Trust Text 1"),
        ...biField("trust2", "Trust Text 2"),
      ],
    }),

    defineField({
      name: "mission",
      title: "▸ Mission Section",
      type: "object",
      options: { collapsible: true, collapsed: false },
      fields: [
        ...biField("eyebrow", "Eyebrow"),
        ...biField("headline", "Headline"),
        ...biField("p1", "Paragraph 1", 4),
        ...biField("p2", "Paragraph 2", 4),
        ...biField("cta", "Button"),
      ],
    }),

    defineField({
      name: "howItWorks",
      title: "▸ How It Works Section",
      type: "object",
      options: { collapsible: true, collapsed: false },
      fields: [
        ...biField("title", "Section Title"),
        defineField({
          name: "steps",
          title: "Steps (must be exactly 4)",
          type: "array",
          of: [{
            type: "object",
            fields: [...biField("title", "Step Title"), ...biField("desc", "Step Description")],
          }],
          validation: (r) => r.length(4),
        }),
      ],
    }),

    defineField({
      name: "sample",
      title: "▸ Sample Section",
      type: "object",
      options: { collapsible: true, collapsed: false },
      fields: [
        ...biField("title", "Section Title"),
        ...biField("desc", "Description"),
        ...biField("cta", "Button"),
      ],
    }),

    defineField({
      name: "faq",
      title: "▸ FAQ Section",
      type: "object",
      options: { collapsible: true, collapsed: false },
      fields: [
        ...biField("title", "Section Title"),
        defineField({
          name: "questions",
          title: "Questions",
          type: "array",
          of: [{
            type: "object",
            fields: [...biField("q", "Question"), ...biField("a", "Answer", 4)],
          }],
        }),
      ],
    }),

    defineField({
      name: "bestSellers",
      title: "▸ Best Sellers Section",
      type: "object",
      options: { collapsible: true, collapsed: false },
      fields: [
        ...biField("subtitle", "Eyebrow"),
        ...biField("title", "Section Title"),
        ...biField("viewDetails", "View Details Link Text"),
      ],
    }),

    defineField({
      name: "benefits",
      title: "▸ Benefits Strip (5 items)",
      type: "object",
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({
          name: "items",
          title: "Benefit Items (exactly 5)",
          type: "array",
          of: [{
            type: "object",
            fields: [
              defineField({ name: "icon", title: "Icon", type: "string", options: { list: [
                { title: "Person", value: "user" },
                { title: "Flower", value: "flower" },
                { title: "Document", value: "file" },
                { title: "Gift", value: "gift" },
                { title: "Lock", value: "lock" },
                { title: "Heart", value: "heart" },
                { title: "Star", value: "star" },
                { title: "Eye", value: "eye" },
              ]}}),
              ...biField("title", "Title"),
              ...biField("desc", "Description"),
            ],
          }],
          validation: (r) => r.length(5),
        }),
      ],
    }),

    defineField({
      name: "testimonialsSec",
      title: "▸ Testimonials Section",
      type: "object",
      options: { collapsible: true, collapsed: false },
      fields: [
        ...biField("title", "Section Title"),
      ],
    }),
  ],
  preview: { select: { title: "title" } },
});
