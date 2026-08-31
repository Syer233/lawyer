(() => {
  if (window.__legalFeedbackEnhancerLoaded) return;
  window.__legalFeedbackEnhancerLoaded = true;
  const key = `legal-feedback-v2:${document.title}`;
  const labels = { correct: '完全正确', improve: '基本正确，但可以更好', somewhat_wrong: '有点不正确', wrong: '完全不正确' };
  let feedback = {};
  try { feedback = JSON.parse(localStorage.getItem(key) || '{}'); } catch (_) { feedback = {}; }
  const escape = value => String(value || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const save = () => localStorage.setItem(key, JSON.stringify(feedback));
  const issueArticles = () => [...document.querySelectorAll('article[data-id]')];
  const issueData = article => ({
    id: article.dataset.id,
    title: article.querySelector('h2,h3')?.textContent.trim() || article.dataset.id,
    clause: article.querySelector('.meta,.clause')?.textContent.trim() || '',
    risk: article.querySelector('.risk')?.textContent.trim() || '',
    suggestion: article.querySelector('.revision')?.textContent.trim() || ''
  });
  const style = document.createElement('style');
  style.textContent = `.lawyer-feedback-v2{margin-top:16px;padding:14px;border:1px solid #cfdce9;border-radius:10px;background:#f7faff}.lawyer-feedback-v2 h4{margin:0 0 8px;font-size:14px}.lawyer-feedback-v2 .rating{display:flex;gap:7px;flex-wrap:wrap}.lawyer-feedback-v2 button{font:inherit;padding:7px 9px;border:1px solid #b9c2cb;background:#fff;border-radius:7px;cursor:pointer}.lawyer-feedback-v2 button[data-on=true]{background:#173f67;border-color:#173f67;color:#fff}.lawyer-feedback-v2 textarea{width:100%;min-height:70px;margin-top:10px;border:1px solid #b9c2cb;border-radius:7px;padding:8px;font:inherit;box-sizing:border-box}.lawyer-feedback-banner{position:sticky;bottom:12px;z-index:99;max-width:920px;margin:18px auto;padding:12px 14px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;background:#173f67;color:#fff;border-radius:10px;box-shadow:0 8px 25px rgba(0,0,0,.18)}.lawyer-feedback-banner button{font:inherit;padding:8px 11px;border:0;border-radius:7px;background:#fff;color:#173f67;cursor:pointer}.lawyer-feedback-banner .small{font-size:12px;opacity:.85;margin-left:auto}`;
  document.head.appendChild(style);
  function render(article) {
    const data = issueData(article), f = feedback[data.id] || {};
    let panel = article.querySelector('.lawyer-feedback-v2');
    if (!panel) { panel = document.createElement('section'); panel.className = 'lawyer-feedback-v2'; article.appendChild(panel); }
    panel.innerHTML = `<h4>律师对本条 AI 意见的评价</h4><div class="rating">${Object.entries(labels).map(([value, label]) => `<button type="button" data-rating="${value}" data-on="${f.rating === value}">${label}</button>`).join('')}</div><textarea aria-label="${escape(data.id)} 的律师备注" placeholder="选填：说明为什么、如何改进、适用的审查偏好或替代文本。输入即自动保存。">${escape(f.note || '')}</textarea><div style="font-size:12px;color:#667282;margin-top:5px">${f.updatedAt ? `已自动保存 · ${new Date(f.updatedAt).toLocaleString('zh-CN')}` : '尚未填写'}</div>`;
    panel.querySelectorAll('[data-rating]').forEach(button => button.onclick = () => { const next = feedback[data.id] || {}; next.rating = button.dataset.rating; next.updatedAt = new Date().toISOString(); feedback[data.id] = next; save(); render(article); updateBanner(); });
    panel.querySelector('textarea').oninput = event => { const next = feedback[data.id] || {}; next.note = event.target.value; next.updatedAt = new Date().toISOString(); feedback[data.id] = next; save(); panel.querySelector('div:last-child').textContent = `已自动保存 · ${new Date(next.updatedAt).toLocaleString('zh-CN')}`; updateBanner(); };
  }
  const banner = document.createElement('aside'); banner.className = 'lawyer-feedback-banner';
  function updateBanner() { const total = issueArticles().length, done = Object.values(feedback).filter(x => x.rating).length; banner.innerHTML = `<strong>律师反馈</strong><span>${done} / ${total} 条已评价</span><button type="button" id="export-html-feedback">导出反馈包 HTML</button><span class="small">仅导出评价、备注和 AI 意见定位；不含合同原文</span>`; banner.querySelector('#export-html-feedback').onclick = exportHtml; }
  function exportHtml() {
    const rows = issueArticles().map(article => { const issue = issueData(article), f = feedback[issue.id] || {}; return { ...issue, rating: f.rating || '', ratingLabel: labels[f.rating] || '未评价', note: f.note || '', updatedAt: f.updatedAt || '' }; });
    const payload = { schemaVersion: 2, kind: 'lawyer_feedback_html', reviewTitle: document.title, exportedAt: new Date().toISOString(), rows };
    const body = rows.map((row, index) => `<article><h2>${index + 1}. ${escape(row.title)}</h2><p><b>定位：</b>${escape(row.id)} · ${escape(row.clause)}</p><p><b>AI 建议方向：</b>${escape(row.suggestion || '未提取')}</p><p><b>律师评价：</b>${escape(row.ratingLabel)}</p><p><b>律师备注：</b>${escape(row.note || '（无）')}</p></article>`).join('');
    const doc = `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><title>${escape(document.title)} - 律师反馈包</title><style>body{max-width:900px;margin:36px auto;padding:0 20px;font-family:-apple-system,BlinkMacSystemFont,"Microsoft YaHei",sans-serif;line-height:1.65;color:#1d2732}h1{color:#143d64}article{border-top:1px solid #dfe4e9;padding:14px 0}h2{font-size:18px;margin:0 0 8px}p{white-space:pre-wrap}</style><body><h1>合同审阅律师反馈包</h1><p>审阅文件：${escape(document.title)}<br>导出时间：${new Date().toLocaleString('zh-CN')}<br>说明：本反馈包不含合同原文。</p>${body}<script id="legal-feedback-data" type="application/json">${JSON.stringify(payload).replace(/</g, '\\u003c')}</script></body></html>`;
    const blob = new Blob([doc], { type: 'text/html;charset=utf-8' }), a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${document.title.replace(/[\\/:*?"<>|]/g, '_')}-律师反馈包.html`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  issueArticles().forEach(render); updateBanner(); document.body.appendChild(banner);
})();
