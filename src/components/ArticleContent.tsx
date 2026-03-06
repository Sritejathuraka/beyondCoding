import { useEffect, useRef, useState } from 'react';

// Generate a URL-friendly slug from text
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

// Extract headings from HTML content
export interface Heading {
  id: string;
  text: string;
  level: number; // 1 for H1, 2 for H2
}

export const extractHeadings = (htmlContent: string): Heading[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const headings: Heading[] = [];
  const seenSlugs = new Map<string, number>();
  
  doc.querySelectorAll('h1, h2').forEach((el) => {
    const text = el.textContent?.trim() || '';
    if (!text) return;
    
    let slug = generateSlug(text);
    
    // Handle duplicate slugs by appending number
    const count = seenSlugs.get(slug) || 0;
    seenSlugs.set(slug, count + 1);
    if (count > 0) {
      slug = `${slug}-${count}`;
    }
    
    headings.push({
      id: slug,
      text,
      level: el.tagName === 'H1' ? 1 : 2,
    });
  });
  
  return headings;
};

// Add IDs to headings in HTML content
const addHeadingIds = (htmlContent: string): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const seenSlugs = new Map<string, number>();
  
  doc.querySelectorAll('h1, h2').forEach((el) => {
    const text = el.textContent?.trim() || '';
    if (!text) return;
    
    let slug = generateSlug(text);
    
    const count = seenSlugs.get(slug) || 0;
    seenSlugs.set(slug, count + 1);
    if (count > 0) {
      slug = `${slug}-${count}`;
    }
    
    el.setAttribute('id', slug);
  });
  
  return doc.body.innerHTML;
};

// Renders a single HTML embed in a sandboxed iframe
const HtmlEmbedFrame = ({ html }: { html: string }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(400);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !html) return;

    const doc = iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();

      // Auto-resize after content loads
      const checkHeight = () => {
        const body = doc.body;
        if (body) {
          const newHeight = Math.max(100, body.scrollHeight + 20);
          setHeight(Math.min(newHeight, 800));
        }
      };

      // Check height on load and after a delay for animations
      iframe.onload = checkHeight;
      setTimeout(checkHeight, 500);
      setTimeout(checkHeight, 1500);
    }
  }, [html]);

  return (
    <div className="relative rounded-lg overflow-hidden border border-[var(--color-border)] my-6">
      <div className="absolute top-2 right-2 z-10 px-2 py-1 bg-black/70 text-white text-xs rounded flex items-center gap-1">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
        Interactive
      </div>
      <iframe
        ref={iframeRef}
        title="HTML Embed"
        sandbox="allow-scripts allow-same-origin"
        style={{
          width: '100%',
          height: `${height}px`,
          border: 'none',
          display: 'block',
          backgroundColor: '#0f0f0f',
        }}
      />
    </div>
  );
};

// Renders article content with HTML embeds properly displayed
const ArticleContent = ({ content, className = '' }: { content: string; className?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [processedContent, setProcessedContent] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    if (!content) {
      setProcessedContent([]);
      return;
    }

    // First, add IDs to all headings
    const contentWithIds = addHeadingIds(content);

    // Parse the HTML content
    const parser = new DOMParser();
    const doc = parser.parseFromString(contentWithIds, 'text/html');
    
    // Find all HTML embed divs
    const embeds = doc.querySelectorAll('div[data-html-embed]');
    
    if (embeds.length === 0) {
      // No embeds, just render normally
      setProcessedContent([
        <div key="content" dangerouslySetInnerHTML={{ __html: contentWithIds }} />
      ]);
      return;
    }

    // Replace embed divs with placeholders and split content
    const parts: React.ReactNode[] = [];
    let currentHtml = contentWithIds;
    let partIndex = 0;

    embeds.forEach((embed, i) => {
      const embedHtml = embed.getAttribute('data-html-content') || '';
      const embedOuterHtml = embed.outerHTML;
      
      const splitIndex = currentHtml.indexOf(embedOuterHtml);
      if (splitIndex !== -1) {
        // Add content before the embed
        const before = currentHtml.substring(0, splitIndex);
        if (before.trim()) {
          parts.push(
            <div key={`part-${partIndex++}`} dangerouslySetInnerHTML={{ __html: before }} />
          );
        }

        // Add the embed
        parts.push(
          <HtmlEmbedFrame key={`embed-${i}`} html={embedHtml} />
        );

        // Continue with remaining content
        currentHtml = currentHtml.substring(splitIndex + embedOuterHtml.length);
      }
    });

    // Add remaining content after last embed
    if (currentHtml.trim()) {
      parts.push(
        <div key={`part-${partIndex}`} dangerouslySetInnerHTML={{ __html: currentHtml }} />
      );
    }

    setProcessedContent(parts);
  }, [content]);

  return (
    <article ref={containerRef} className={className}>
      {processedContent}
    </article>
  );
};

export default ArticleContent;
