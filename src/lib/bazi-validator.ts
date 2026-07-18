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
 * 检查: 十神、格局、用神、日主强弱、神煞
 */
export function validateMingShu(aiText: string, facts: BaziFacts): ValidationResult {
  const errors: ValidationError[] = [];

  // 1. 验证十神 (同前)
  const pillars: Array<"年" | "月" | "日" | "时"> = ["年", "月", "日", "时"];
  for (const p of pillars) {
    const expected = facts.shiShen[p];
    if (!expected) continue;
    const claims = extractShiShenClaims(aiText, p);
    if (claims.length > 0 && !claims.includes(expected)) {
      const hasConflict = claims.some(c => c !== expected);
      if (hasConflict) {
        errors.push({ field: `${p}柱十神`, expected, found: claims.join(","), severity: "critical" });
      }
    }
  }

  // 2. 验证格局
  if (facts.geJu) {
    const claimed = extractGeJuClaim(aiText);
    if (claimed && claimed !== facts.geJu && !claimed.includes(facts.geJu.replace("格", ""))) {
      errors.push({ field: "格局", expected: facts.geJu, found: claimed, severity: "critical" });
    }
  }

  // 3. 验证用神 (新增)
  if (facts.yongShen && facts.yongShen !== "待定") {
    const yongShenPatterns = [
      new RegExp(`用神[为是：:]*\\s*${facts.yongShen}`),
      new RegExp(`喜${facts.yongShen}`),
      new RegExp(`${facts.yongShen}[\\s，。]*为用`),
    ];
    const foundYongShen = yongShenPatterns.some(re => re.test(aiText));
    if (!foundYongShen) {
      // Check if AI used a different 用神
      const wrongYongShen = aiText.match(/用神[为是：:]*\s*([^\s，。,\n]{1,2})/);
      if (wrongYongShen && wrongYongShen[1] !== facts.yongShen) {
        errors.push({ field: "用神", expected: facts.yongShen, found: wrongYongShen[1], severity: "critical" });
      }
    }
  }

  // 4. 验证日主五行 (新增)
  if (facts.dayMaster.wuxing) {
    const wuxingNames = ["木", "火", "土", "金", "水"];
    const dmWx = facts.dayMaster.wuxing;
    // Check if AI mentions wrong wuxing for day master
    for (const wx of wuxingNames) {
      if (wx !== dmWx) {
        const wrongPattern = new RegExp(`日主[^。，]{0,10}${wx}[^。，]{0,5}(?:性|命|人)`);
        if (wrongPattern.test(aiText)) {
          errors.push({ field: "日主五行", expected: `日主属${dmWx}`, found: `文中提到日主${wx}`, severity: "critical" });
          break;
        }
      }
    }
  }

  // 5. 验证神煞 (新增)
  if (facts.shenSha && facts.shenSha.length > 0) {
    for (const ss of facts.shenSha) {
      if (!aiText.includes(ss)) {
        errors.push({ field: "神煞", expected: `应包含${ss}`, found: `文中未提及${ss}`, severity: "warning" });
      }
    }
  }

  // Build correction note
  let correctionNote = "";
  if (errors.length > 0) {
    correctionNote = `【八字数据校验发现 ${errors.length} 个问题】\n`;
    for (const e of errors) {
      correctionNote += `- [${e.severity}] ${e.field}: 应为"${e.expected}"，文中为"${e.found}"\n`;
    }
    correctionNote += `\n正确参考数据：\n`;
    for (const p of pillars) {
      if (facts.shiShen[p]) correctionNote += `  ${p}柱十神: ${facts.shiShen[p]}\n`;
    }
    correctionNote += `  格局: ${facts.geJu}\n  用神: ${facts.yongShen}\n  日主: ${facts.dayMaster.gan}(${facts.dayMaster.wuxing})\n`;
  }

  return { passed: errors.length === 0, errors, correctionNote };
}
