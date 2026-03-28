import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ViewPage({ params }: Props) {
  const { slug } = await params;
  const filename = `${slug}.html`;

  return (
    <div className="-mx-4 -mt-6 sm:-mx-6 flex flex-col" style={{ height: "calc(100vh - 49px)" }}>
      {/* Top bar */}
      <div className="flex items-center gap-3 border-b border-border bg-surface px-4 py-2 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-1.5 rounded-md bg-accent/10 px-3 py-1 text-xs font-medium text-accent hover:bg-accent/20 transition-colors"
        >
          <ArrowLeft size={14} />
          Dashboard
        </Link>
        <span className="text-sm font-medium text-text-dim">{filename}</span>
      </div>

      {/* Iframe */}
      <iframe
        src={`/pages/${filename}`}
        className="flex-1 w-full border-none"
        title={slug}
      />
    </div>
  );
}
