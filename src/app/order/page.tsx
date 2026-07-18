"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import { useLang } from "@/i18n/LanguageContext";

export default function OrderPage() {
  const { lang } = useLang();
  const [form, setForm] = useState({
    name: "", email: "", year: "", month: "", day: "", hour: "",
    birthplace: "", gender: "", product: "five-elements-blueprint", notes: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const isZh = lang === "zh";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage(isZh
          ? `报告已生成并发送至 ${form.email}！请查收邮件。报告编号：${data.reportId}`
          : `Report generated and sent to ${form.email}! Check your inbox. Report ID: ${data.reportId}`);
      } else {
        setStatus("error");
        setMessage(data.error || (isZh ? "生成失败，请稍后重试" : "Generation failed, please try again."));
      }
    } catch {
      setStatus("error");
      setMessage(isZh ? "网络错误，请稍后重试" : "Network error, please try again.");
    }
  };

  const update = (field: string, value: string) => setForm({ ...form, [field]: value });

  const label = (en: string, zh: string) => isZh ? zh : en;
  const placeholder = (en: string, zh: string) => isZh ? zh : en;

  return (
    <>
      <SiteHeader />
      <main className="section bg-[var(--color-bg-main)]">
        <div className="container-main max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-center mb-4">
              {isZh ? "开始你的五行能量蓝图" : "Begin Your Element Blueprint"}
            </h1>
            <p className="text-center text-[var(--color-text-secondary)] mb-12">
              {isZh
                ? "填写以下信息，我们将为你生成专属的个人五行视觉能量报告，并发送至你的邮箱。"
                : "Fill in your details below. We'll generate your personalized Five Elements Visual Blueprint and send it to your email."}
            </p>

            {status === "success" ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[var(--color-bg-light)] border border-[var(--color-green-muted)] p-10 text-center">
                <div className="text-5xl mb-6">&#10003;</div>
                <h2 className="text-[var(--color-green-dark)] mb-4">
                  {isZh ? "提交成功！" : "Submitted!"}
                </h2>
                <p className="text-[var(--color-text-secondary)]">{message}</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-[var(--color-bg-light)] border border-[var(--color-border)] p-8 md:p-12">
                {/* Name + Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[var(--color-text-main)]">
                      {label("Your Name", "你的名字")} *
                    </label>
                    <input type="text" required value={form.name}
                      onChange={e => update("name", e.target.value)}
                      placeholder={placeholder("e.g. Sarah", "例：小明")}
                      className="w-full border border-[var(--color-border)] bg-white px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-green-muted)]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[var(--color-text-main)]">
                      {label("Email Address", "邮箱地址")} *
                    </label>
                    <input type="email" required value={form.email}
                      onChange={e => update("email", e.target.value)}
                      placeholder="you@email.com"
                      className="w-full border border-[var(--color-border)] bg-white px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-green-muted)]" />
                  </div>
                </div>

                {/* Birth Date */}
                <label className="block text-sm font-medium mb-3 text-[var(--color-text-main)]">
                  {label("Birth Date", "出生日期")} *
                </label>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <input type="number" required value={form.year}
                      onChange={e => update("year", e.target.value)}
                      placeholder={placeholder("Year", "年")}
                      min="1900" max="2026"
                      className="w-full border border-[var(--color-border)] bg-white px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-green-muted)]" />
                  </div>
                  <div>
                    <input type="number" required value={form.month}
                      onChange={e => update("month", e.target.value)}
                      placeholder={placeholder("Month", "月")}
                      min="1" max="12"
                      className="w-full border border-[var(--color-border)] bg-white px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-green-muted)]" />
                  </div>
                  <div>
                    <input type="number" required value={form.day}
                      onChange={e => update("day", e.target.value)}
                      placeholder={placeholder("Day", "日")}
                      min="1" max="31"
                      className="w-full border border-[var(--color-border)] bg-white px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-green-muted)]" />
                  </div>
                </div>

                {/* Birth Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[var(--color-text-main)]">
                      {label("Birth Time (hour)", "出生时间（时）")}
                    </label>
                    <select value={form.hour} onChange={e => update("hour", e.target.value)}
                      className="w-full border border-[var(--color-border)] bg-white px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-green-muted)]">
                      <option value="">{isZh ? "不确定 / 未知" : "Unknown"}</option>
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i}>{i}:00</option>
                      ))}
                    </select>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                      {isZh ? "如不确定具体时间，可留空（默认使用午时）" : "Leave blank if unknown (defaults to noon)"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[var(--color-text-main)]">
                      {label("Birthplace (City)", "出生地点（城市）")}
                    </label>
                    <input type="text" value={form.birthplace}
                      onChange={e => update("birthplace", e.target.value)}
                      placeholder={placeholder("e.g. Beijing", "例：北京")}
                      className="w-full border border-[var(--color-border)] bg-white px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-green-muted)]" />
                  </div>
                </div>

                {/* Gender */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2 text-[var(--color-text-main)]">
                    {label("Gender", "性别")} *
                  </label>
                  <div className="flex gap-4">
                    {[{v:"male",en:"Male",zh:"男"},{v:"female",en:"Female",zh:"女"}].map(g=>(
                      <label key={g.v} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"12px 16px",border:form.gender===g.v?"2px solid var(--color-green-dark)":"1px solid var(--color-border)",background:form.gender===g.v?"var(--color-green-dark)":"#fff",color:form.gender===g.v?"#fff":"var(--color-text-main)",cursor:"pointer",fontSize:14,fontWeight:500}}>
                        <input type="radio" name="gender" value={g.v} checked={form.gender===g.v} onChange={e=>update("gender",e.target.value)} style={{display:"none"}} />
                        {isZh?g.zh:g.en}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Product */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2 text-[var(--color-text-main)]">
                    {label("Product Edition", "产品版本")}
                  </label>
                  <select value={form.product} onChange={e => update("product", e.target.value)}
                    className="w-full border border-[var(--color-border)] bg-white px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-green-muted)]">
                    <option value="five-elements-blueprint">{isZh ? "五行视觉能量报告·基础版" : "Blueprint · Essential"}</option>
                    <option value="five-elements-complete">{isZh ? "五行视觉能量报告·完整版" : "Blueprint · Complete"}</option>
                    <option value="gift-edition">{isZh ? "礼物版·双人" : "Gift Edition"}</option>
                  </select>
                </div>

                {/* Notes */}
                <div className="mb-8">
                  <label className="block text-sm font-medium mb-2 text-[var(--color-text-main)]">
                    {label("Notes (optional)", "备注（选填）")}
                  </label>
                  <textarea value={form.notes} onChange={e => update("notes", e.target.value)}
                    rows={3}
                    placeholder={isZh ? "如有特殊需求可在此说明..." : "Any special requests..."}
                    className="w-full border border-[var(--color-border)] bg-white px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-green-muted)]" />
                </div>

                {/* Error */}
                {status === "error" && (
                  <p className="text-red-600 text-sm mb-4">{message}</p>
                )}

                {/* Submit */}
                <button type="submit" disabled={status === "loading"}
                  className="w-full min-h-[48px] bg-[var(--color-green-dark)] text-white text-xs font-medium uppercase tracking-[0.1em] hover:bg-[#1d2e24] disabled:opacity-60 transition-colors duration-300">
                  {status === "loading"
                    ? (isZh ? "正在生成报告..." : "Generating Report...")
                    : (isZh ? "生成我的能量蓝图" : "Generate My Blueprint")}
                </button>

                <p className="text-xs text-[var(--color-text-secondary)] mt-4 text-center">
                  {isZh
                    ? "提交后我们将于3-5个工作日内将报告发送至你的邮箱。你的出生信息仅用于生成报告，不会被分享或出售。"
                    : "Your report will be delivered within 3-5 business days. Your birth information is used solely for your report and never shared."}
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
