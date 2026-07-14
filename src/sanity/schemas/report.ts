import { defineType, defineField } from "sanity";

export const reportSchema = defineType({
  name: "report",
  title: "Generated Report",
  type: "document",
  fields: [
    defineField({ name: "reportId", title: "Report ID", type: "string" }),
    defineField({ name: "customerName", title: "Customer Name", type: "string" }),
    defineField({ name: "customerEmail", title: "Customer Email", type: "string" }),
    defineField({ name: "birthDate", title: "Birth Date", type: "string" }),
    defineField({ name: "content", title: "Full Report JSON", type: "text" }),
    defineField({ name: "generatedAt", title: "Generated At", type: "datetime" }),
  ],
  preview: { select: { title: "reportId", subtitle: "customerName" } },
});
