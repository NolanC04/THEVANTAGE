"use client";
import { useState } from "react";
import { postJSON } from "@/lib/client-fetch";

export type FieldSpec =
  | { name: string; label: string; type?: "text" | "email"; autoComplete?: string; required?: boolean }
  | { name: string; label: string; type: "textarea"; rows?: number; required?: boolean }
  | { name: string; label: string; type: "select"; options: string[]; required?: boolean };

/** Underline-only form with loud failure: one silent retry, then a visible message and Retry. */
export function ActionForm({
  endpoint,
  fields,
  submit,
  success,
  columns = 1,
  extra,
}: {
  endpoint: string;
  fields: FieldSpec[];
  submit: string;
  success: string;
  columns?: 1 | 2;
  extra?: Record<string, string>;
}) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.name, f.type === "select" ? f.options[0] : ""])),
  );
  const [state, setState] = useState<"idle" | "sending" | "done" | "invalid" | "failed">("idle");
  const [message, setMessage] = useState("");

  async function send() {
    const missing = fields.find((f) => f.required !== false && !values[f.name]?.trim());
    if (missing) {
      setState("invalid");
      setMessage(`${missing.label} is needed.`);
      return;
    }
    setState("sending");
    try {
      await postJSON(endpoint, { ...values, ...extra });
      setState("done");
    } catch (e) {
      const status = (e as { status?: number }).status;
      setState(status && status < 500 ? "invalid" : "failed");
      setMessage((e as Error).message);
    }
  }

  if (state === "done")
    return (
      <p role="status" className="title text-[28px] leading-snug m-0">
        {success}
      </p>
    );

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        send();
      }}
      className="grid gap-9"
    >
      <div className={`grid gap-9 ${columns === 2 ? "md:grid-cols-2" : ""}`}>
        {fields.map((f) => (
          <div key={f.name} className={`field ${f.type === "textarea" || f.type === "select" ? "md:col-span-full" : ""}`}>
            <label htmlFor={f.name}>{f.label}</label>
            {f.type === "textarea" ? (
              <textarea id={f.name} rows={f.rows ?? 3} value={values[f.name]} onChange={(e) => setValues({ ...values, [f.name]: e.target.value })} />
            ) : f.type === "select" ? (
              <select id={f.name} value={values[f.name]} onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}>
                {f.options.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            ) : (
              <input
                id={f.name}
                type={f.type ?? "text"}
                autoComplete={"autoComplete" in f ? f.autoComplete : undefined}
                value={values[f.name]}
                onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
              />
            )}
          </div>
        ))}
      </div>
      {(state === "invalid" || state === "failed") && (
        <div role="alert">
          <p className="error">{state === "failed" ? `That didn't go through: ${message}` : message}</p>
        </div>
      )}
      <div>
        <button type="submit" className="btn-gold" disabled={state === "sending"}>
          {state === "sending" ? "Sending…" : state === "failed" ? "Retry" : submit}
        </button>
      </div>
    </form>
  );
}
