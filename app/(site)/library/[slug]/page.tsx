import Link from "next/link";
import { notFound } from "next/navigation";
import { libraryItem } from "@/lib/content";
import { currentMember } from "@/lib/auth";
import { libraryGate } from "@/lib/access";
import { renderMarkdown } from "@/lib/markdown";

export const dynamic = "force-dynamic";

export default async function LibraryItemPage({ params }: { params: Promise<{ slug: string }> }) {
  const item = await libraryItem((await params).slug);
  if (!item || item.status !== "published") notFound();
  const gate = libraryGate(await currentMember(), item);
  return (
    <article className="wrap pt-[150px] pb-[var(--section)] max-w-[880px]">
      <p className="eyebrow">{item.kind.replace("_", " ")}</p>
      <h1 className="h2 mt-6">{item.title}</h1>
      {item.summary && <p className="body mt-6">{item.summary}</p>}
      {gate.open ? (
        <div className="prose-v mt-12">
          {item.body_md && <div dangerouslySetInnerHTML={{ __html: renderMarkdown(item.body_md) }} />}
          {item.url && <p><a href={item.url} rel="noopener">Open</a></p>}
          {item.author_of_record && <p className="text-[13px]" style={{ color: "var(--color-dim)" }}>By {item.author_of_record}</p>}
        </div>
      ) : (
        <div className="mt-12 rule-top pt-8">
          <p className="body">{gate.reason === "sign_in" ? "Sign in with your email to read this." : "This piece is part of The Vantage Library."}</p>
          <Link className="btn-gold mt-6" href={gate.reason === "sign_in" ? `/begin?next=/library/${item.slug}` : "/join"}>
            {gate.reason === "sign_in" ? "Begin with your email" : "Join the library"}
          </Link>
        </div>
      )}
    </article>
  );
}
