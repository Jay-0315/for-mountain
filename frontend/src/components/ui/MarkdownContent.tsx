"use client";

import type { ReactNode } from "react";

type MarkdownContentProps = {
  content: string;
  className?: string;
};

function parseInline(text: string): ReactNode[] {
  const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g);

  return tokens.filter(Boolean).map((token, index) => {
    if (token.startsWith("**") && token.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold text-slate-900">
          {token.slice(2, -2)}
        </strong>
      );
    }

    if (token.startsWith("*") && token.endsWith("*")) {
      return (
        <em key={index} className="italic">
          {token.slice(1, -1)}
        </em>
      );
    }

    if (token.startsWith("`") && token.endsWith("`")) {
      return (
        <code
          key={index}
          className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.92em] text-slate-800"
        >
          {token.slice(1, -1)}
        </code>
      );
    }

    const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const [, label, href] = linkMatch;
      return (
        <a
          key={index}
          href={href}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-orange-600 underline decoration-orange-200 underline-offset-4 hover:text-orange-700"
        >
          {label}
        </a>
      );
    }

    return token;
  });
}

function renderParagraph(lines: string[], key: string) {
  return (
    <p key={key} className="text-sm leading-8 text-slate-600 sm:text-base">
      {lines.map((line, lineIndex) => (
        <span key={lineIndex}>
          {parseInline(line)}
          {lineIndex < lines.length - 1 && <br />}
        </span>
      ))}
    </p>
  );
}

export function stripMarkdown(content: string) {
  return content
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/(```[\s\S]*?```|`[^`]+`)/g, "")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/^[-*]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/(\*\*|__|\*|_)/g, "")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default function MarkdownContent({ content, className }: MarkdownContentProps) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const nodes: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();

    if (!line) {
      index += 1;
      continue;
    }

    const headingMatch = line.match(/^(#{1,3})\s*(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const heading = headingMatch[2];

      if (level === 1) {
        nodes.push(
          <h1 key={`h1-${index}`} className="text-2xl font-bold text-slate-900">
            {parseInline(heading)}
          </h1>
        );
      } else if (level === 2) {
        nodes.push(
          <h2 key={`h2-${index}`} className="text-xl font-bold text-slate-900">
            {parseInline(heading)}
          </h2>
        );
      } else {
        nodes.push(
          <h3 key={`h3-${index}`} className="text-lg font-semibold text-slate-900">
            {parseInline(heading)}
          </h3>
        );
      }

      index += 1;
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^[-*]\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^[-*]\s+/, ""));
        index += 1;
      }

      nodes.push(
        <ul key={`ul-${index}`} className="list-disc space-y-2 pl-5 text-sm leading-8 text-slate-600 sm:text-base">
          {items.map((item, itemIndex) => (
            <li key={itemIndex}>{parseInline(item)}</li>
          ))}
        </ul>
      );
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\d+\.\s+/, ""));
        index += 1;
      }

      nodes.push(
        <ol key={`ol-${index}`} className="list-decimal space-y-2 pl-5 text-sm leading-8 text-slate-600 sm:text-base">
          {items.map((item, itemIndex) => (
            <li key={itemIndex}>{parseInline(item)}</li>
          ))}
        </ol>
      );
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quoteLines: string[] = [];
      while (index < lines.length && /^>\s?/.test(lines[index].trim())) {
        quoteLines.push(lines[index].trim().replace(/^>\s?/, ""));
        index += 1;
      }

      nodes.push(
        <blockquote
          key={`quote-${index}`}
          className="border-l-4 border-orange-200 pl-4 text-sm italic leading-8 text-slate-600 sm:text-base"
        >
          {quoteLines.map((quoteLine, quoteIndex) => (
            <p key={quoteIndex}>{parseInline(quoteLine)}</p>
          ))}
        </blockquote>
      );
      continue;
    }

    const paragraphLines: string[] = [];
    while (index < lines.length) {
      const current = lines[index].trim();
      if (
        !current ||
        /^(#{1,3})\s*/.test(current) ||
        /^[-*]\s+/.test(current) ||
        /^\d+\.\s+/.test(current) ||
        /^>\s?/.test(current)
      ) {
        break;
      }
      paragraphLines.push(current);
      index += 1;
    }

    if (paragraphLines.length > 0) {
      nodes.push(renderParagraph(paragraphLines, `p-${index}`));
      continue;
    }

    index += 1;
  }

  return <div className={className ?? "space-y-4"}>{nodes}</div>;
}
