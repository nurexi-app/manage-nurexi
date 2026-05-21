import { useState } from "react";
import { Form, required, useLogin, useNotify } from "ra-core";
import type { SubmitHandler, FieldValues } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/admin/text-input";
import { Notification } from "@/components/admin/notification";

export const LoginPage = (props: { redirectTo?: string }) => {
  const { redirectTo } = props;
  const [loading, setLoading] = useState(false);
  const login = useLogin();
  const notify = useNotify();

  const handleSubmit: SubmitHandler<FieldValues> = (values) => {
    setLoading(true);
    login(values, redirectTo)
      .then(() => setLoading(false))
      .catch((error) => {
        setLoading(false);
        notify(
          typeof error === "string"
            ? error
            : typeof error === "undefined" || !error.message
              ? "ra.auth.sign_in_error"
              : error.message,
          {
            type: "error",
            messageArgs: {
              _:
                typeof error === "string"
                  ? error
                  : error && error.message
                    ? error.message
                    : undefined,
            },
          },
        );
      });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

        .login-root {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          font-family: 'DM Sans', sans-serif;
          background: #0a0a0a;
        }

        @media (max-width: 1024px) {
          .login-root { grid-template-columns: 1fr; }
          .login-left { display: none; }
        }

        /* ── left panel ── */
        .login-left {
          position: relative;
          overflow: hidden;
          background: #0f1a0e;
        }

        .login-left-bg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 20% 80%, rgba(74, 130, 40, 0.35) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 80% 20%, rgba(34, 80, 20, 0.4) 0%, transparent 55%),
            radial-gradient(ellipse 100% 80% at 50% 50%, rgba(10, 40, 8, 0.8) 0%, transparent 100%);
        }

        /* animated grain overlay */
        .login-left-grain {
          position: absolute;
          inset: -50%;
          width: 200%;
          height: 200%;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E");
          opacity: 0.4;
          animation: grain 8s steps(10) infinite;
          pointer-events: none;
        }

        @keyframes grain {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-2%, -3%); }
          20% { transform: translate(3%, 1%); }
          30% { transform: translate(-1%, 4%); }
          40% { transform: translate(4%, -2%); }
          50% { transform: translate(-3%, 2%); }
          60% { transform: translate(2%, 3%); }
          70% { transform: translate(-4%, -1%); }
          80% { transform: translate(1%, -4%); }
          90% { transform: translate(3%, 2%); }
        }

        /* floating orbs */
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          animation: float 12s ease-in-out infinite;
          pointer-events: none;
        }
        .orb-1 {
          width: 300px; height: 300px;
          background: rgba(80, 160, 40, 0.15);
          top: 10%; left: -10%;
          animation-delay: 0s;
        }
        .orb-2 {
          width: 200px; height: 200px;
          background: rgba(40, 120, 20, 0.2);
          bottom: 20%; right: -5%;
          animation-delay: -4s;
        }
        .orb-3 {
          width: 150px; height: 150px;
          background: rgba(120, 200, 60, 0.1);
          top: 50%; left: 40%;
          animation-delay: -8s;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          33% { transform: translateY(-20px) scale(1.05); }
          66% { transform: translateY(10px) scale(0.97); }
        }

        .login-left-content {
          position: relative;
          z-index: 10;
          height: 100%;
          display: flex;
          flex-direction: column;
          padding: 3rem;
        }

        .login-logo {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .login-logo img {
          height: 32px;
          filter: brightness(0) invert(1);
        }

        .login-left-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 2rem;
        }

        .login-headline {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(2.2rem, 4vw, 3.2rem);
          color: #fff;
          line-height: 1.1;
          letter-spacing: -0.02em;
        }

        .login-headline em {
          font-style: italic;
          color: #7dcf4a;
        }

        .login-subtext {
          font-size: 15px;
          color: rgba(255,255,255,0.45);
          line-height: 1.6;
          max-width: 340px;
          font-weight: 300;
        }

        /* stats row */
        .login-stats {
          display: flex;
          gap: 2rem;
          margin-top: 0.5rem;
        }

        .login-stat {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .login-stat-value {
          font-family: 'DM Serif Display', serif;
          font-size: 1.8rem;
          color: #fff;
          line-height: 1;
        }

        .login-stat-label {
          font-size: 11px;
          color: rgba(255,255,255,0.35);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 500;
        }

        /* divider line */
        .login-divider {
          width: 40px;
          height: 1px;
          background: rgba(255,255,255,0.15);
        }

        .login-quote {
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255,255,255,0.08);
        }

        .login-quote p {
          font-size: 13px;
          color: rgba(255,255,255,0.4);
          font-style: italic;
          line-height: 1.6;
          margin: 0 0 6px;
        }

        .login-quote footer {
          font-size: 11px;
          color: rgba(255,255,255,0.25);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        /* ── right panel ── */
        .login-right {
          background: #0a0a0a;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          position: relative;
        }

        /* subtle grid background */
        .login-right::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }

        .login-form-wrap {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 380px;
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
        }

        .login-form-header {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .login-form-eyebrow {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #7dcf4a;
        }

        .login-form-title {
          font-family: 'DM Serif Display', serif;
          font-size: 2.2rem;
          color: #fff;
          line-height: 1.1;
          letter-spacing: -0.02em;
          margin: 0;
        }

        .login-form-sub {
          font-size: 13px;
          color: rgba(255,255,255,0.35);
          margin: 0;
          margin-top: 4px;
          font-weight: 300;
        }

        /* override ra TextInput styles for dark bg */
        .login-fields {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .login-fields .MuiFormControl-root,
        .login-fields [class*="RaTextInput"] {
          width: 100% !important;
        }

        .login-fields input {
          background: rgba(255,255,255,0.05) !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          color: #fff !important;
          border-radius: 10px !important;
          padding: 12px 14px !important;
          font-size: 14px !important;
          transition: border-color 0.2s, background 0.2s !important;
        }

        .login-fields input:focus {
          border-color: rgba(125, 207, 74, 0.5) !important;
          background: rgba(255,255,255,0.07) !important;
          outline: none !important;
        }

        .login-fields label {
          color: rgba(255,255,255,0.45) !important;
          font-size: 12px !important;
          font-weight: 500 !important;
          letter-spacing: 0.03em !important;
        }

        /* submit button */
        .login-btn {
          width: 100%;
          height: 46px;
          background: #7dcf4a !important;
          color: #0a2005 !important;
          font-weight: 700 !important;
          font-size: 14px !important;
          letter-spacing: 0.03em !important;
          border-radius: 10px !important;
          border: none !important;
          cursor: pointer !important;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s !important;
          position: relative;
          overflow: hidden;
        }

        .login-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%);
          pointer-events: none;
        }

        .login-btn:hover:not(:disabled) {
          background: #8fe05a !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 8px 24px rgba(125, 207, 74, 0.3) !important;
        }

        .login-btn:active:not(:disabled) {
          transform: translateY(0) !important;
        }

        .login-btn:disabled {
          opacity: 0.5 !important;
          cursor: not-allowed !important;
        }

        /* loading shimmer on button */
        .login-btn:disabled::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .login-footer {
          text-align: center;
          font-size: 11px;
          color: rgba(255,255,255,0.2);
          letter-spacing: 0.04em;
        }

        /* fade-in on load */
        .login-form-wrap {
          animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .login-left-body {
          animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
          animation-delay: 0.1s;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="login-root">
        {/* ── left panel ── */}
        <div className="login-left">
          <div className="login-left-bg" />
          <div className="login-left-grain" />
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />

          <div className="login-left-content">
            <div className="login-logo">
              <img src="./assets/nurexilogo.svg" alt="Nurexi" />
            </div>

            <div className="login-left-body">
              <div>
                <h2 className="login-headline">
                  Build better
                  <br />
                  <em>nursing exams,</em>
                  <br />
                  faster.
                </h2>
                <p className="login-subtext">
                  The admin platform for creating, managing, and publishing
                  nursing exam content at scale.
                </p>
              </div>

              <div className="login-stats">
                <div className="login-stat">
                  <span className="login-stat-value">∞</span>
                  <span className="login-stat-label">Questions</span>
                </div>
                <div
                  className="login-divider"
                  style={{ alignSelf: "center" }}
                />
                <div className="login-stat">
                  <span className="login-stat-value">∞</span>
                  <span className="login-stat-label">Sessions</span>
                </div>
                <div
                  className="login-divider"
                  style={{ alignSelf: "center" }}
                />
                <div className="login-stat">
                  <span className="login-stat-value">1</span>
                  <span className="login-stat-label">Platform</span>
                </div>
              </div>

              <div className="login-quote">
                <p>
                  "This tool lets you create and manage your questions and
                  answers with full control."
                </p>
                <footer>Ochife Ogechukwu — Nurexi</footer>
              </div>
            </div>
          </div>
        </div>

        {/* ── right panel ── */}
        <div className="login-right">
          <div className="login-form-wrap">
            <div className="login-form-header">
              <span className="login-form-eyebrow">Admin Portal</span>
              <h1 className="login-form-title">Welcome back</h1>
              <p className="login-form-sub">
                Sign in to your account to continue
              </p>
            </div>

            <Form onSubmit={handleSubmit}>
              <div className="login-fields">
                <TextInput
                  label="Email address"
                  source="email"
                  type="email"
                  validate={required()}
                />
                <TextInput
                  label="Password"
                  source="password"
                  type="password"
                  autoComplete="current-password"
                  validate={required()}
                />
              </div>

              <div style={{ marginTop: "1.5rem" }}>
                <Button type="submit" className="login-btn" disabled={loading}>
                  {loading ? "Signing in…" : "Sign in →"}
                </Button>
              </div>
            </Form>

            <p className="login-footer">Nurexi Admin · Restricted access</p>
          </div>
        </div>
      </div>

      <Notification />
    </>
  );
};
