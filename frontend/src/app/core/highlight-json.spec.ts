import { highlightJson } from './highlight-json';

describe('highlightJson', () => {
  it('wraps keys, strings, numbers and keywords', () => {
    const html = highlightJson(JSON.stringify({ a: 'b', n: 1.5, ok: true, z: null }));
    expect(html).toContain('<span class="j-key">&quot;a&quot;</span>:');
    expect(html).toContain('<span class="j-str">&quot;b&quot;</span>');
    expect(html).toContain('<span class="j-num">1.5</span>');
    expect(html).toContain('<span class="j-kw">true</span>');
    expect(html).toContain('<span class="j-kw">null</span>');
  });

  it('escapes markup coming from user-provided labels', () => {
    const html = highlightJson(JSON.stringify({ label: '<img src=x onerror=alert(1)>' }));
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;img');
  });
});
