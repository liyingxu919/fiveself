import { defineType, defineField } from "sanity";

const biField = (name: string, title: string, rows = 2) => [
  defineField({ name: `${name}En`, title: `${title} (EN)`, type: "text", rows }),
  defineField({ name: `${name}Zh`, title: `${title} (中文)`, type: "text", rows }),
];

export const aboutPageSchema = defineType({
  name: "aboutPage",
  title: "About Page",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Internal Title", type: "string", initialValue: "About Page" }),
    ...biField("headline1", "Hero Headline Line 1"),
    ...biField("headline2", "Hero Headline Line 2"),
    ...biField("headline3", "Hero Headline Line 3"),
    defineField({
      name: "values",
      title: "Values (exactly 3)",
      type: "array",
      of: [{
        type: "object",
        fields: [
          ...biField("title", "Value Title"),
          ...biField("desc", "Value Description"),
        ],
      }],
      validation: (r) => r.length(3),
    }),
    ...biField("ctaHeading", "Bottom CTA Heading"),
  ],
  preview: { select: { title: "title" } },
});
