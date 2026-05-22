"use client";

import { useState, useEffect } from "react";
import MarkdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";
import markdownItTaskLists from "markdown-it-task-lists";
import hljs from "highlight.js/lib/common";
import type { Config, DOMPurify } from "dompurify";

function highlightCode(str: string, lang: string): string {
  if (lang && hljs.getLanguage(lang)) {
    try {
      return hljs.highlight(str, { language: lang, ignoreIllegals: true }).value;
    } catch {
      /* fall back to plain escaping */
    }
  }
  return "";
}

function createRenderer(allowHtml: boolean): MarkdownIt {
  const instance = new MarkdownIt({
    html: allowHtml,
    linkify: true,
    breaks: false,
    typographer: false,
    highlight: highlightCode,
  })
    .use(markdownItAnchor, { permalink: false })
    .use(markdownItTaskLists, { enabled: true, label: true });

  const defaultLinkRender =
    instance.renderer.rules.link_open ||
    ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options));

  instance.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const href = token.attrGet("href") || "";
    if (/^https?:\/\//i.test(href)) {
      token.attrSet("target", "_blank");
      token.attrSet("rel", "noopener noreferrer");
    }
    return defaultLinkRender(tokens, idx, options, env, self);
  };

  return instance;
}

// mdSafe escapes raw HTML — its output is XSS-safe without a sanitizer,
// so it can render on the server. mdFull allows raw HTML and its output
// MUST be sanitized, which only happens on the client.
const mdSafe = createRenderer(false);
const mdFull = createRenderer(true);

const ALLOWED_TAGS = [
  "a", "abbr", "address", "article", "aside", "b", "blockquote", "br",
  "caption", "cite", "code", "col", "colgroup", "dd", "details", "dfn",
  "div", "dl", "dt", "em", "figcaption", "figure", "footer", "h1", "h2",
  "h3", "h4", "h5", "h6", "header", "hr", "i", "img", "input", "ins",
  "kbd", "li", "mark", "nav", "ol", "p", "pre", "q", "s", "samp",
  "section", "small", "span", "strong", "sub", "summary", "sup", "table",
  "tbody", "td", "tfoot", "th", "thead", "time", "tr", "u", "ul", "var",
];

const ALLOWED_ATTR = [
  "href", "title", "alt", "src", "class", "id", "target", "rel",
  "type", "checked", "disabled", "open", "colspan", "rowspan",
  "start", "value", "datetime", "lang", "dir",
];

const SANITIZE_CONFIG: Config = {
  ALLOWED_TAGS,
  ALLOWED_ATTR,
  ALLOW_DATA_ATTR: false,
  FORBID_ATTR: ["style", "onerror", "onload", "onclick"],
};

// Loaded once on the client; dompurify never reaches the server bundle.
let purifier: DOMPurify | null = null;

function renderSanitized(content: string): string {
  return purifier!.sanitize(mdFull.render(content), SANITIZE_CONFIG);
}

export function MarkdownPreview({ content }: { content: string }) {
  const [html, setHtml] = useState(() =>
    purifier ? renderSanitized(content) : mdSafe.render(content),
  );

  useEffect(() => {
    let cancelled = false;
    const apply = () => {
      if (!cancelled) setHtml(renderSanitized(content));
    };
    if (purifier) {
      apply();
    } else {
      import("dompurify").then((mod) => {
        purifier = mod.default;
        apply();
      });
    }
    return () => {
      cancelled = true;
    };
  }, [content]);

  return (
    <div
      className="markdown-preview"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
