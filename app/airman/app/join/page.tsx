import { Form } from "@/components/airman/Form";
export default async function Join({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const { code } = await searchParams;
  return (
    <main className="page" style={{ display: "grid", gap: 14 }}>
      <h1 style={{ fontSize: 22 }}>Join class</h1>
      <div className="card">
        <Form endpoint="/api/airman/join" submit="Join" fields={[{ name: "code", label: "Class code (on the room screen)", required: true, value: code?.toUpperCase() ?? "" }]} />
      </div>
    </main>
  );
}
