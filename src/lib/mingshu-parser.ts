/**
 * 命书解析工具: 解析双语命书文本，按章节拆分中英文
 * 供报告页、admin预览、邮件模板共用
 */

export interface ParsedSection {
  titleCn: string;
  titleEn: string;
  bodyCn: string;
  bodyEn: string;
}

/**
 * 解析双语命书文本，按章节拆分
 * 章节标题格式: 「一、章节中文名 | I. Section English」
 */
export function parseBilingualMingShu(text: string): ParsedSection[] {
  if (!text) return [];

  // Split by section headers like 「一、xxx | I. xxx」 or 「二、xxx | II. xxx」
  const headerPattern = /[「【]([一二三四五六七八]、[^|」】]+)\s*\|\s*([^」】]+)[」】]/g;
  const sections: ParsedSection[] = [];
  const matches: Array<{ index: number; titleCn: string; titleEn: string }> = [];
  let m: RegExpExecArray | null;

  while ((m = headerPattern.exec(text)) !== null) {
    matches.push({ index: m.index, titleCn: m[1].trim(), titleEn: m[2].trim() });
  }

  if (matches.length === 0) {
    // No section headers found — return entire text as one section
    return [{ titleCn: "命书全文", titleEn: "Full Destiny Scroll", bodyCn: text, bodyEn: text }];
  }

  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index;
    const end = i < matches.length - 1 ? matches[i + 1].index : text.length;
    const content = text.substring(start, end);
    // Remove the header line itself
    const headerEnd = content.indexOf("」");
    const body = headerEnd > 0 ? content.substring(headerEnd + 1).trim() : content;

    // Split Chinese and English parts
    // Chinese text comes first, then English (separated by double newline or marked by first English sentence)
    const parts = splitBilingualBody(body);

    sections.push({
      titleCn: matches[i].titleCn,
      titleEn: matches[i].titleEn,
      bodyCn: parts.cn,
      bodyEn: parts.en,
    });
  }

  return sections;
}

/**
 * Split a bilingual body into Chinese and English parts
 */
function splitBilingualBody(body: string): { cn: string; en: string } {
  // Try to detect language switch: find where English starts
  // English typically starts with a capital letter after a blank line
  const lines = body.split("\n");
  const cnLines: string[] = [];
  const enLines: string[] = [];
  let inEnglish = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    // Heuristic: if a line starts with an uppercase letter and contains mostly ASCII, it's English
    const asciiRatio = [...trimmed].filter(c => c.charCodeAt(0) < 128).length / trimmed.length;
    if (!inEnglish && asciiRatio > 0.7 && /^[A-Z]/.test(trimmed)) {
      inEnglish = true;
    }
    if (inEnglish) {
      enLines.push(trimmed);
    } else {
      cnLines.push(trimmed);
    }
  }

  // If couldn't detect split, return all as Chinese
  if (cnLines.length === 0 && enLines.length > 0) {
    return { cn: enLines.join("\n"), en: enLines.join("\n") };
  }
  if (enLines.length === 0 && cnLines.length > 0) {
    return { cn: cnLines.join("\n"), en: cnLines.join("\n") };
  }

  return { cn: cnLines.join("\n"), en: enLines.join("\n") };
}

/**
 * Filter sections by display language
 */
export function filterByLanguage(
  sections: ParsedSection[],
  lang: "zh" | "en" | "bilingual"
): ParsedSection[] {
  if (lang === "bilingual") return sections;
  return sections.map(s => ({
    ...s,
    bodyCn: lang === "zh" ? s.bodyCn : "",
    bodyEn: lang === "en" ? s.bodyEn : "",
  }));
}

/**
 * Render sections to plain text for a specific language
 */
export function renderSections(sections: ParsedSection[], lang: "zh" | "en"): string {
  return sections
    .map(s => {
      const title = lang === "zh" ? s.titleCn : s.titleEn;
      const body = lang === "zh" ? s.bodyCn : s.bodyEn;
      if (!body) return "";
      return `${title}\n${body}`;
    })
    .filter(Boolean)
    .join("\n\n");
}

/**
 * Extract provider info from error or result
 */
export function detectVersion(text: string): "concise" | "full" | "legacy" {
  if (!text) return "legacy";
  if (text.includes("[CONCISE]") || text.length < 2000) return "concise";
  return "full";
}
