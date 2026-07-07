import { RichText } from '@tarojs/components';
import MarkdownIt from 'markdown-it';

interface MarkdownProps {
  content: string;
}

const md = new MarkdownIt({
  html: false,
  breaks: true,
  linkify: false,
});

const BASE_TEXT_STYLE = 'font-size:var(--text-base);color:var(--text-secondary);line-height:var(--leading-relaxed);';
const HEADING_STYLE = 'font-weight:var(--font-bold);color:var(--text-primary);margin:var(--space-4) 0 var(--space-2);';
const LIST_STYLE = 'padding-left:var(--space-4);margin:var(--space-2) 0;';
const LIST_ITEM_STYLE = `${BASE_TEXT_STYLE}margin:var(--space-1) 0;`;
const HR_STYLE = 'border:none;border-top:1rpx solid var(--border-color);margin:var(--space-4) 0;';

md.renderer.rules.heading_open = (tokens, idx) => {
  const tag = tokens[idx].tag;
  const sizeMap: Record<string, string> = {
    h1: 'var(--text-2xl)',
    h2: 'var(--text-xl)',
    h3: 'var(--text-lg)',
    h4: 'var(--text-base)',
    h5: 'var(--text-sm)',
    h6: 'var(--text-xs)',
  };
  const size = sizeMap[tag] || 'var(--text-base)';
  return `<${tag} style="font-size:${size};${HEADING_STYLE}">`;
};

md.renderer.rules.paragraph_open = () => `<p style="${BASE_TEXT_STYLE}margin:var(--space-2) 0;">`;
md.renderer.rules.bullet_list_open = () => `<ul style="${LIST_STYLE}">`;
md.renderer.rules.ordered_list_open = () => `<ol style="${LIST_STYLE}">`;
md.renderer.rules.list_item_open = () => `<li style="${LIST_ITEM_STYLE}">`;
md.renderer.rules.hr = () => `<hr style="${HR_STYLE}">`;
md.renderer.rules.strong_open = () => '<strong style="font-weight:var(--font-bold);color:var(--text-primary);">';
md.renderer.rules.em_open = () => '<em style="font-style:italic;color:var(--text-secondary);">';

/**
 * Markdown 渲染组件
 *
 * 使用小程序 RichText 渲染轻量 Markdown，支持标题、列表、加粗、斜体、分隔线。
 */
export default function Markdown({ content }: MarkdownProps) {
  const normalized = content.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n');
  const html = md.render(normalized);
  return <RichText nodes={html} />;
}
