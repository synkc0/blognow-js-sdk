import { parse, HTMLElement, Node } from "node-html-parser";

// A valid schema.org JSON-LD node, ready to JSON.stringify into a <script>.
export type JsonLdObject = Record<string, unknown>;

export interface StructuredDataOptions {
  // Canonical URL of the post; used to build ItemList item URLs as `${pageUrl}#${headingId}`.
  pageUrl?: string;
}

export interface PostStructuredData {
  itemList?: JsonLdObject; // schema.org ItemList, omitted unless a confident listicle
  faqPage?: JsonLdObject; // schema.org FAQPage, omitted unless a confident FAQ section
}

const SCHEMA_CONTEXT = "https://schema.org";
const MIN_LIST_ITEMS = 3;
const MIN_FAQ_PAIRS = 2;

// Extracts ready-to-emit JSON-LD from a post's HTML. Pure, synchronous, isomorphic.
// Conservative by design: a schema is emitted only when redundant signals agree.
export function extractStructuredData(
  content: string,
  options: StructuredDataOptions = {}
): PostStructuredData {
  if (!content || typeof content !== "string") {
    return {};
  }

  const root = parse(content);
  const headings = collectHeadings(root);

  const result: PostStructuredData = {};

  const itemList = extractItemList(root, headings, options.pageUrl);
  if (itemList) {
    result.itemList = itemList;
  }

  const faqPage = extractFaqPage(headings);
  if (faqPage) {
    result.faqPage = faqPage;
  }

  return result;
}

interface Heading {
  el: HTMLElement;
  level: number; // 1-6
  text: string;
}

// All headings in document order, with parsed level and trimmed text.
function collectHeadings(root: HTMLElement): Heading[] {
  return root
    .querySelectorAll("h1, h2, h3, h4, h5, h6")
    .map((el) => ({ el, level: levelOf(el), text: el.text.trim() }))
    .filter((h) => h.level > 0 && h.text.length > 0);
}

function levelOf(node: Node): number {
  const tag = tagOf(node);
  const match = /^h([1-6])$/.exec(tag);
  return match ? Number(match[1]) : 0;
}

function tagOf(node: Node): string {
  const tag = (node as HTMLElement).tagName;
  return tag ? String(tag).toLowerCase() : "";
}

function childElements(node: HTMLElement): HTMLElement[] {
  return node.childNodes.filter(
    (n): n is HTMLElement => (n as HTMLElement).nodeType === 1
  );
}

// ---- ItemList ---------------------------------------------------------------

const NUMBER_PREFIX = /^\s*(\d+)[.)]\s+(.+)$/;
// Separators that split a ranked name from its blurb: em/en dash, colon, spaced hyphen.
const NAME_SEPARATOR = /\s*[—–]\s*|:\s+|\s+-\s+/;

function extractItemList(
  root: HTMLElement,
  headings: Heading[],
  pageUrl?: string
): JsonLdObject | undefined {
  const numbered = longestNumberedRun(headings);
  if (numbered.length < MIN_LIST_ITEMS) {
    return undefined;
  }

  // Cross-check: require an ordered list whose item count matches the headings.
  if (!hasMatchingOrderedList(root, numbered.length)) {
    return undefined;
  }

  const itemListElement = numbered.map((h, i) => {
    const item: JsonLdObject = {
      "@type": "ListItem",
      position: i + 1,
      name: rankedName(h.text),
    };
    const id = h.el.getAttribute("id");
    if (pageUrl && id) {
      item.url = `${pageUrl}#${id}`;
    }
    return item;
  });

  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "ItemList",
    itemListElement,
  };
}

// Longest run of headings numbered 1, 2, 3, … in document order (same level).
function longestNumberedRun(headings: Heading[]): Heading[] {
  let best: Heading[] = [];
  let current: Heading[] = [];
  let expected = 1;
  let level = 0;

  for (const h of headings) {
    const match = NUMBER_PREFIX.exec(h.text);
    const num = match ? Number(match[1]) : NaN;

    if (match && num === 1 && (current.length === 0 || h.level !== level)) {
      current = [h];
      expected = 2;
      level = h.level;
    } else if (match && num === expected && h.level === level) {
      current.push(h);
      expected += 1;
    } else {
      if (current.length > best.length) best = current;
      current = [];
      expected = 1;
    }
  }
  if (current.length > best.length) best = current;
  return best;
}

function hasMatchingOrderedList(root: HTMLElement, count: number): boolean {
  return root
    .querySelectorAll("ol")
    .some(
      (ol) =>
        childElements(ol).filter((c) => tagOf(c) === "li").length === count
    );
}

// "1. SynkPay — Best for X" → "SynkPay". Strips the number prefix, then the blurb.
function rankedName(headingText: string): string {
  const match = NUMBER_PREFIX.exec(headingText);
  const withoutNumber = match ? match[2] : headingText;
  const name = withoutNumber.split(NAME_SEPARATOR)[0].trim();
  return name.length > 0 ? name : withoutNumber.trim();
}

// ---- FAQPage ----------------------------------------------------------------

const FAQ_HEADING = /frequently asked questions|faqs?/i;

function extractFaqPage(headings: Heading[]): JsonLdObject | undefined {
  const faqIndex = headings.findIndex((h) => FAQ_HEADING.test(h.text));
  if (faqIndex === -1) {
    return undefined;
  }

  const faqLevel = headings[faqIndex].level;
  const mainEntity: JsonLdObject[] = [];

  for (let i = faqIndex + 1; i < headings.length; i++) {
    const h = headings[i];
    if (h.level <= faqLevel) break; // left the FAQ section
    const answer = answerTextAfter(h.el);
    if (answer.length > 0) {
      mainEntity.push({
        "@type": "Question",
        name: h.text,
        acceptedAnswer: { "@type": "Answer", text: answer },
      });
    }
  }

  if (mainEntity.length < MIN_FAQ_PAIRS) {
    return undefined;
  }

  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "FAQPage",
    mainEntity,
  };
}

// Plain-text answer = sibling content after a question heading up to the next heading.
function answerTextAfter(questionEl: HTMLElement): string {
  const parts: string[] = [];
  let sibling = questionEl.nextElementSibling;

  while (sibling && levelOf(sibling) === 0) {
    const text = sibling.text.replace(/\s+/g, " ").trim();
    if (text.length > 0) parts.push(text);
    sibling = sibling.nextElementSibling;
  }

  return parts.join(" ");
}
