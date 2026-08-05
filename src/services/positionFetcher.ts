/**
 * Position Document Fetcher & Text Extractor
 * Resolves job requirements from raw text or web page links (URLs)
 */
export async function resolvePositionDocument(input: string): Promise<string> {
  const trimmed = input.trim();

  // Check if input is a Web URL
  const isUrl = /^https?:\/\/[^\s]+$/i.test(trimmed);

  if (!isUrl) {
    return trimmed;
  }

  console.log(`🌐 [positionFetcher] Web URL detected: "${trimmed}". Fetching position document...`);

  try {
    const response = await fetch(trimmed, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });

    if (!response.ok) {
      console.warn(`⚠️ [positionFetcher] Failed to fetch URL ${trimmed}: ${response.status} ${response.statusText}`);
      return `Position document from URL (${trimmed}). Note: Unable to scrape external web page directly (HTTP ${response.status}).`;
    }

    const html = await response.text();
    const cleanText = extractTextFromHtml(html);

    console.log(`✅ [positionFetcher] Successfully extracted ${cleanText.length} characters of position text from ${trimmed}`);
    return `[Position Spec Source: ${trimmed}]\n\n${cleanText.slice(0, 4000)}`;
  } catch (err: any) {
    console.warn(`⚠️ [positionFetcher] Error fetching URL ${trimmed}: ${err.message || String(err)}`);
    return `Position document specified at ${trimmed}. (External URL fetch note: ${err.message || String(err)})`;
  }
}

/**
 * Helper to strip HTML tags, scripts, styles, and extract main content text
 */
function extractTextFromHtml(html: string): string {
  // Remove script and style tags
  let text = html.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, '');
  // Extract title if present
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : '';

  // Strip remaining HTML tags
  text = text.replace(/<[^>]+>/g, ' ');
  // Decode HTML entities
  text = text.replace(/&nbsp;/g, ' ')
             .replace(/&amp;/g, '&')
             .replace(/&lt;/g, '<')
             .replace(/&gt;/g, '>')
             .replace(/&quot;/g, '"')
             .replace(/&#39;/g, "'");

  // Collapse consecutive whitespace
  text = text.replace(/\s+/g, ' ').trim();

  return title ? `Job Title: ${title}\n\n${text}` : text;
}
