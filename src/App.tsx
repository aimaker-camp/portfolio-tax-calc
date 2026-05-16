import { useState } from "react";
import "./App.css";

const TAX_PARAMS = {
  exemption: 97000,
  exemptionElder: 145500,
  standardSingle: 131000,
  standardJoint: 262000,
  salaryDeduction: 218000,
  brackets: [
    { upTo: 590000, rate: 0.05, deduct: 0 },
    { upTo: 1330000, rate: 0.12, deduct: 41300 },
    { upTo: 2660000, rate: 0.2, deduct: 147700 },
    { upTo: 4980000, rate: 0.3, deduct: 413700 },
    { upTo: Infinity, rate: 0.4, deduct: 911700 },
  ],
};

export default function App() {
  const [income, setIncome] = useState("800000");
  const [filing, setFiling] = useState<"single" | "joint">("single");
  const [dependents, setDependents] = useState("0");
  const [elderly, setElderly] = useState("0");

  const incomeN = Number(income) || 0;
  const dependentsN = Math.max(0, Math.floor(Number(dependents) || 0));
  const elderlyN = Math.max(0, Math.floor(Number(elderly) || 0));

  const selfCount = filing === "joint" ? 2 : 1;
  const regularPersons = selfCount + dependentsN;
  const exemptionTotal =
    regularPersons * TAX_PARAMS.exemption + elderlyN * TAX_PARAMS.exemptionElder;
  const standardDeduction =
    filing === "joint" ? TAX_PARAMS.standardJoint : TAX_PARAMS.standardSingle;
  const salaryCount = filing === "joint" ? 2 : 1;
  const salaryDeduction = Math.min(incomeN, salaryCount * TAX_PARAMS.salaryDeduction);
  const taxableIncome = Math.max(0, incomeN - exemptionTotal - standardDeduction - salaryDeduction);
  const bracket = TAX_PARAMS.brackets.find((b) => taxableIncome <= b.upTo)!;
  const tax = Math.max(0, taxableIncome * bracket.rate - bracket.deduct);
  const effectiveRate = incomeN > 0 ? (tax / incomeN) * 100 : 0;

  return (
    <div className="bank">
      <header className="bank-head">
        <a href="https://ai-class-summer.vercel.app/portfolio" className="back">
          ← Portfolio
        </a>
        <div className="logo">
          <span className="logo-mark">¥</span>
          <span className="logo-text">TAX EST.</span>
        </div>
        <span className="badge">DEMO ・ 範例</span>
      </header>

      <main className="bank-main">
        <div className="title-block">
          <p className="kicker">綜合所得稅試算</p>
          <h1>
            2025 年度<span className="thin"> ・ 114 年度</span>
          </h1>
          <p className="lede">
            填上你的年薪 + 申報資料,系統依最新公告級距試算應納稅額。
          </p>
        </div>

        <div className="grid">
          <section className="form-sec">
            <h2 className="sec-title">▸ 申報資料</h2>

            <div className="row">
              <label>全年總所得(NT$)</label>
              <input
                type="number"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                min={0}
                step={10000}
              />
              <p className="hint">一般上班族年薪含年終</p>
            </div>

            <div className="row">
              <label>申報方式</label>
              <div className="toggle">
                <button
                  className={filing === "single" ? "on" : ""}
                  onClick={() => setFiling("single")}
                >
                  個人申報
                </button>
                <button
                  className={filing === "joint" ? "on" : ""}
                  onClick={() => setFiling("joint")}
                >
                  夫妻合併
                </button>
              </div>
            </div>

            <div className="row-pair">
              <div className="row">
                <label>受扶養人數</label>
                <input
                  type="number"
                  value={dependents}
                  onChange={(e) => setDependents(e.target.value)}
                  min={0}
                  max={20}
                />
                <p className="hint">小孩 / 父母</p>
              </div>
              <div className="row">
                <label>70 歲以上人數</label>
                <input
                  type="number"
                  value={elderly}
                  onChange={(e) => setElderly(e.target.value)}
                  min={0}
                  max={5}
                />
                <p className="hint">本人 / 配偶 / 尊親屬</p>
              </div>
            </div>
          </section>

          <section className="result-sec">
            <div className="bignum">
              <p className="kicker">預估應納稅額</p>
              <p className="big">
                NT$ <span className="num">{Math.round(tax).toLocaleString()}</span>
              </p>
              <div className="meta">
                <span>有效稅率 {effectiveRate.toFixed(2)}%</span>
                <span>級距 {(bracket.rate * 100).toFixed(0)}%</span>
              </div>
            </div>

            <div className="ledger">
              <h2 className="sec-title">▸ 計算明細</h2>
              <Row label="全年所得" value={incomeN} />
              <Row label={`免稅額 (${regularPersons + elderlyN} 人)`} value={-exemptionTotal} neg />
              <Row label={`標準扣除額 (${filing === "joint" ? "合併" : "單身"})`} value={-standardDeduction} neg />
              <Row label="薪資特別扣除額" value={-Math.round(salaryDeduction)} neg />
              <div className="divider" />
              <Row label="綜合所得淨額" value={taxableIncome} bold />
              <Row label={`× 稅率 ${(bracket.rate * 100).toFixed(0)}%`} value={Math.round(taxableIncome * bracket.rate)} />
              <Row label="− 累進差額" value={-bracket.deduct} neg />
              <div className="divider double" />
              <Row label="應納稅額" value={Math.round(tax)} bold highlight />
            </div>

            <p className="footnote">
              ※ 本工具僅用於試算 ・ 實際以財政部公告為準
            </p>
          </section>
        </div>
      </main>

      <footer className="bank-foot">
        <span>This work was made by AI / 你的孩子上完 4 週課,也能做出自己的版本</span>
        <a href="https://ai-class-summer.vercel.app/#register" className="cta">
          AI 造物營
        </a>
      </footer>
    </div>
  );
}

function Row({ label, value, bold, neg, highlight }: { label: string; value: number; bold?: boolean; neg?: boolean; highlight?: boolean }) {
  return (
    <div className={`lrow ${bold ? "bold" : ""} ${highlight ? "highlight" : ""}`}>
      <span className="lrow-l">{label}</span>
      <span className={`lrow-v ${neg ? "neg" : ""}`}>
        {value >= 0 ? "" : "− "}NT$ {Math.abs(value).toLocaleString()}
      </span>
    </div>
  );
}
