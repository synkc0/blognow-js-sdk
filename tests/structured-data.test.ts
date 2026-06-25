import { extractStructuredData } from "../src/utils/structured-data";

// Builds a "Top N" listicle: numbered H2 sections + an "at a glance" <ol>.
function buildListicle(
  count: number,
  opts: { withIds?: boolean; olItems?: number } = {}
): string {
  const { withIds = true, olItems = count } = opts;
  const ol = Array.from(
    { length: olItems },
    (_, i) => `<li>Company ${i + 1}</li>`
  ).join("");
  const sections = Array.from({ length: count }, (_, i) => {
    const id = withIds ? ` id="company-${i + 1}"` : "";
    return `<h2${id}>${i + 1}. Company${i + 1} — Best for thing ${i + 1}</h2><p>Body ${i + 1}.</p>`;
  }).join("");

  return `<h2>At a glance</h2><ol>${ol}</ol>${sections}`;
}

// Builds an FAQ section with H3 questions and paragraph answers.
function buildFaq(pairs: Array<{ q: string; a: string }>): string {
  const body = pairs
    .map((p) => `<h3>${p.q}</h3>${p.a}`)
    .join("");
  return `<h2>Frequently Asked Questions</h2>${body}`;
}

describe("extractStructuredData", () => {
  describe("ItemList", () => {
    it("emits 10 ordered ListItems with correct names from a Top 10 post", () => {
      const { itemList } = extractStructuredData(buildListicle(10));
      expect(itemList).toBeDefined();
      const items = itemList!.itemListElement as any[];
      expect(items).toHaveLength(10);
      expect(items[0]).toMatchObject({
        "@type": "ListItem",
        position: 1,
        name: "Company1",
      });
      expect(items[9].position).toBe(10);
      expect(items.map((i) => i.position)).toEqual(
        Array.from({ length: 10 }, (_, i) => i + 1)
      );
    });

    it("includes @context and @type", () => {
      const { itemList } = extractStructuredData(buildListicle(5));
      expect(itemList).toMatchObject({
        "@context": "https://schema.org",
        "@type": "ItemList",
      });
    });

    it("adds item urls when headings have ids and pageUrl is provided", () => {
      const { itemList } = extractStructuredData(buildListicle(3), {
        pageUrl: "https://x.co/blog/top",
      });
      const items = itemList!.itemListElement as any[];
      expect(items[0].url).toBe("https://x.co/blog/top#company-1");
    });

    it("omits urls when headings have no ids", () => {
      const { itemList } = extractStructuredData(
        buildListicle(3, { withIds: false }),
        { pageUrl: "https://x.co/blog/top" }
      );
      const items = itemList!.itemListElement as any[];
      expect(items[0].url).toBeUndefined();
    });

    it("omits urls when pageUrl is absent even if ids exist", () => {
      const { itemList } = extractStructuredData(buildListicle(3));
      const items = itemList!.itemListElement as any[];
      expect(items[0].url).toBeUndefined();
    });

    it("guards: no itemList when ol count and headings disagree", () => {
      const { itemList } = extractStructuredData(
        buildListicle(10, { olItems: 9 })
      );
      expect(itemList).toBeUndefined();
    });

    it("guards: no itemList for fewer than 3 items", () => {
      const { itemList } = extractStructuredData(buildListicle(2));
      expect(itemList).toBeUndefined();
    });

    it("guards: no itemList without a cross-checking ordered list", () => {
      const headingsOnly =
        "<h2>1. A — x</h2><h2>2. B — y</h2><h2>3. C — z</h2>";
      expect(extractStructuredData(headingsOnly).itemList).toBeUndefined();
    });
  });

  describe("FAQPage", () => {
    const faqPairs = Array.from({ length: 7 }, (_, i) => ({
      q: `Question ${i + 1}?`,
      a: `<p>Answer ${i + 1}.</p>`,
    }));

    it("emits one Question/acceptedAnswer per FAQ entry", () => {
      const { faqPage } = extractStructuredData(buildFaq(faqPairs));
      expect(faqPage).toBeDefined();
      const entities = faqPage!.mainEntity as any[];
      expect(entities).toHaveLength(7);
      expect(entities[0]).toMatchObject({
        "@type": "Question",
        name: "Question 1?",
        acceptedAnswer: { "@type": "Answer", text: "Answer 1." },
      });
      expect(faqPage).toMatchObject({
        "@context": "https://schema.org",
        "@type": "FAQPage",
      });
    });

    it("joins multi-paragraph answers into readable plain text", () => {
      const { faqPage } = extractStructuredData(
        buildFaq([
          { q: "Q1?", a: "<p>First para.</p><p>Second <strong>para</strong>.</p>" },
          { q: "Q2?", a: "<p>Only one.</p>" },
        ])
      );
      const entities = faqPage!.mainEntity as any[];
      expect(entities[0].acceptedAnswer.text).toBe("First para. Second para.");
    });

    it("stops collecting at the end of the FAQ section", () => {
      const html =
        buildFaq([
          { q: "Q1?", a: "<p>A1.</p>" },
          { q: "Q2?", a: "<p>A2.</p>" },
        ]) + "<h2>Next section</h2><h3>Not a question</h3><p>nope</p>";
      const entities = extractStructuredData(html).faqPage!.mainEntity as any[];
      expect(entities).toHaveLength(2);
    });

    it("guards: no faqPage with fewer than 2 well-formed pairs", () => {
      const { faqPage } = extractStructuredData(
        buildFaq([{ q: "Only one?", a: "<p>Yes.</p>" }])
      );
      expect(faqPage).toBeUndefined();
    });

    it("guards: no faqPage when there is no FAQ heading", () => {
      const html = "<h3>Question 1?</h3><p>A.</p><h3>Question 2?</h3><p>B.</p>";
      expect(extractStructuredData(html).faqPage).toBeUndefined();
    });
  });

  describe("combined / negative", () => {
    it("returns both schemas for a post with a list and an FAQ", () => {
      const html =
        buildListicle(5) +
        buildFaq([
          { q: "Q1?", a: "<p>A1.</p>" },
          { q: "Q2?", a: "<p>A2.</p>" },
        ]);
      const sd = extractStructuredData(html);
      expect(sd.itemList).toBeDefined();
      expect(sd.faqPage).toBeDefined();
    });

    it("returns {} for a plain prose post", () => {
      const html =
        "<h2>Intro</h2><p>Some prose.</p><h2>More</h2><p>Even more prose.</p>";
      expect(extractStructuredData(html)).toEqual({});
    });

    it("returns {} for empty or invalid input", () => {
      expect(extractStructuredData("")).toEqual({});
      expect(extractStructuredData(undefined as any)).toEqual({});
    });
  });
});
