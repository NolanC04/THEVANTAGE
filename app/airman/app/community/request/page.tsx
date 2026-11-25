import { Form } from "@/components/airman/Form";
import { CRISIS } from "@/lib/airman/privacy";

export default function Request() {
  return (
    <main className="page" style={{ display: "grid", gap: 14 }}>
      <h1 style={{ fontSize: 22, margin: "8px 0 0" }}>Request a growth session</h1>
      <p className="card" style={{ margin: 0, fontWeight: 600 }}>{CRISIS}</p>
      <div className="card">
        <Form endpoint="/api/airman/requests/new" submit="Send request" fields={[
          { name: "kind", label: "What kind", type: "select", options: [["one_on_one", "One-on-one"], ["small_group", "Small group"], ["team", "Team"]] },
          { name: "preferred_times", label: "Times that work", required: true, help: "For example: weekday mornings after PT" },
          { name: "note", label: "Anything you want the facilitator to know (optional)", type: "textarea", help: "Only the facilitator and admin read this. Emails never include it." },
        ]} />
      </div>
    </main>
  );
}
