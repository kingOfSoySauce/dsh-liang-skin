import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';

const css = readFileSync(new URL('../src/client/skin.css', import.meta.url), 'utf8');
const oldCss = execFileSync('git', ['show', '976fcbf9b4a91b79f14b90c16cbe0d3f553c2bd3:src/client/skin.css'], {encoding:'utf8'});
const browser = await chromium.launch({
  ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}),
  headless: true,
});
try {
  const page = await browser.newPage();
  async function measure(skin, mode, enabled = true) {
    await page.setContent(`<style>
      html,body,#root{height:100%;margin:0}
      body:is([data-dsh-desktop-mode="compatibility"],[data-dsh-desktop-mode="extended"]){--dsh-desktop-frame-height:36px}
      body:is([data-dsh-desktop-mode="compatibility"],[data-dsh-desktop-mode="extended"]) #root {
        box-sizing:border-box;position:fixed;top:36px;right:0;bottom:0;left:0;
        width:auto;height:auto;padding-top:0;overflow:hidden;transform:translateZ(0);
      }
      ${skin}
      </style><body data-liang-skin="${enabled?'on':'off'}" ${mode?`data-dsh-desktop-mode="${mode}"`:''}>
      <div class="liang-skin-backdrop" data-media="sequence"><img class="liang-skin-sequence-frame"></div>
      <div id="root"><div style="height:280px">Content shorter than viewport</div></div></body>`);
    return page.evaluate(() => {
      const root=document.getElementById('root');
      const rect=root.getBoundingClientRect();
      const bg=document.querySelector('.liang-skin-backdrop').getBoundingClientRect();
      const img=document.querySelector('img').getBoundingClientRect();
      return {position:getComputedStyle(root).position,top:rect.top,bottom:rect.bottom,height:rect.height,bgTop:bg.top,bgBottom:bg.bottom,imgHeight:img.height};
    });
  }
  await page.setViewportSize({width:1200,height:900});
  const before=await measure(oldCss,'compatibility');
  assert.equal(before.position,'relative');
  assert.ok(before.bottom<900,'Must reproduce the original collapsed layout');
  for (const size of [{width:1200,height:900},{width:800,height:600},{width:1800,height:1300}]) {
    await page.setViewportSize(size);
    for (const mode of ['compatibility','extended','']) {
      const result=await measure(css,mode);
      assert.equal(result.position,mode?'fixed':'relative');
      assert.equal(result.top,mode?36:0);
      assert.equal(result.bottom,size.height);
      assert.equal(result.bgBottom,size.height);
      assert.equal(result.bgTop,mode?36:0);
      assert.equal(result.imgHeight,size.height-(mode?36:0));
    }
    const off=await measure(css,'compatibility',false);
    assert.equal(off.position,'fixed');
    assert.equal(off.bottom,size.height);
  }
  console.log('PASS: old CSS reproduces collapse; fixed CSS passes desktop/Web, 3 viewport sizes, skin off.');
} finally { await browser.close(); }
