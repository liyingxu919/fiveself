/**
 * 八字命书验证器: 在AI生成命书后自动检查关键数据的正确性
 * 如果发现错误，生成纠正提示让AI重新生成
 */

export interface ValidationResult {
  passed: boolean;
  errors: ValidationError[];
  correctionNote: string; // 给AI的纠正提示，用于重新生成
}

export interface ValidationError {
  field: string;
  expected: string;
  found: string;
  severity: "critical" | "warning";
}

interface BaziFacts {
  shiShen: Record<string, string>;
  geJu: string;
  yongShen: string;
  dayMaster: { gan: string; wuxing: string };
  shenSha: string[];
}

/**
 * 从八字计算结果中提取"正确答案"
 */
export function extractBaziFacts(reportContent: any): BaziFacts {
  const ss = reportContent.shiShen || {};
  return {
    shiShen: {
      "年": ss.year || "",
      "月": ss.month || "",
      "日": ss.day || "",
      "时": ss.hour || "",
    },
    geJu: reportContent.geJu?.name || "",
    yongShen: reportContent.disuitianshu?.yongshen || "",
    dayMaster: {
      gan: reportContent.dayMaster?.gan || "",
      wuxing: reportContent.dayMaster?.wuxing || "",
    },
    shenSha: reportContent.shenSha || [],
  };
}

/**
 * 从AI生成的命书文本中搜索十神声称
 */
function extractShiShenClaims(text: string, pillar: "年" | "月" | "日" | "时"): string[] {
  const claims: string[] = [];
  const keywords = ["比肩", "劫财", "食神", "伤官", "正财", "偏财", "正官", "七杀", "正印", "偏印"];
  const pillarMap = { "年": /年(?:柱|干)[^。，\n]{0,20}(比肩|劫财|食神|伤官|正财|偏财|正官|七杀|正印|偏印)/g, "月": /月(?:柱|干)[^。，\n]{0,20}(比肩|劫财|食神|伤官|正财|偏财|正官|七杀|正印|偏印)/g, "日": /日(?:柱|干|主)[^。，\n]{0,20}(比肩|劫财|食神|伤官|正财|偏财|正官|七杀|正印|偏印)/g, "时": /时(?:柱|干)[^。，\n]{0,20}(比肩|劫财|食神|伤官|正财|偏财|正官|七杀|正印|偏印)/g };

  const re = pillarMap[pillar];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m[1]) claims.push(m[1]);
  }

  // If no specific pillar match, try to find any 十神 reference near the pillar name
  if (claims.length === 0) {
    for (const kw of keywords) {
      if (text.includes(`${pillar}柱`) && text.includes(kw)) {
        // Check if kw appears within reasonable distance
        const pillarIdx = text.indexOf(`${pillar}柱`);
        const kwIdx = text.indexOf(kw);
        if (Math.abs(kwIdx - pillarIdx) < 50) {
          claims.push(kw);
        }
      }
    }
  }

  return claims;
}

/**
 * 从AI文本中提取格局声称
 */
function extractGeJuClaim(text: string): string {
  const patterns = [
    /格局[为是：:]?\s*([^\s，。,\n]{2,4}(?:格|局))/,
    /入\s*([^\s，。,\n]{2,4}(?:格|局))/,
    /([^\s，。,\n]{2,4}(?:格|局))\s*入命/,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m) return m[1];
  }
  return "";
}

/**
 * 验证AI命书文本与计算值的匹配度
 */
export function validateMingShu(aiText: string, facts: BaziFacts): ValidationResult {
  const errors: ValidationError[] = [];

  // 1. 验证十神
  const pillars: Array<"年" | "月" | "日" | "时"> = ["年", "月", "日", "时"];
  for (const p of pillars) {
    const expected = facts.shiShen[p];
    if (!expected) continue;
    const claims = extractShiShenClaims(aiText, p);
    // 检查claims中是否有expected，或没有冲突的十神
    if (claims.length > 0 && !claims.includes(expected)) {
      // Check if there's a conflicting claim
      const hasConflict = claims.some(c => c !== expected);
      if (hasConflict) {
        errors.push({
          field: `${p}柱十神`,
          expected,
          found: claims.join(","),
          severity: "critical",
        });
      }
    }
  }

  // 2. 验证格局
  if (facts.geJu) {
    const claimed = extractGeJuClaim(aiText);
    if (claimed && claimed !== facts.geJu && !claimed.includes(facts.geJu.replace("格", ""))) {
      errors.push({
        field: "格局",
        expected: facts.geJu,
        found: claimed,
        severity: "critical",
      });
    }
  }

  // Build correction note
  let correctionNote = "";
  if (errors.length > 0) {
    const criticalErrors = errors.filter(e => e.severity === "critical");
    correctionNote = `【重要纠正】以下数据错误，请按照正确值重新撰写命书：\n`;
    for (const e of errors) {
      correctionNote += `- ${e.field}: 你写的是"${e.found}"，正确的是"${e.expected}"\n`;
    }

    // Add explicit 十神 reference
    correctionNote += `\n正确十神参考：\n`;
    for (const p of pillars) {
      if (facts.shiShen[p]) {
        correctionNote += `- ${p}柱: ${facts.shiShen[p]}\n`;
      }
    }
    correctionNote += `\n格局: ${facts.geJu}\n`;
    correctionNote += `用神: ${facts.yongShen}\n`;

    correctionNote += `\n请严格按照以上正确数据重新生成命书，不要再使用错误的十神和格局。`;
  }

  return {
    passed: errors.length === 0,
    errors,
    correctionNote,
  };
}
