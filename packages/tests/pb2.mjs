import { chromium } from '@playwright/test'
const ID='components-stories-textfield-origamtextfield-story-vue'
const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1400,height:900}})
await p.goto(`http://localhost:6006/stories/story/${ID}?variantId=${ID}-0`,{waitUntil:'domcontentloaded'})
await p.waitForTimeout(4000)
const labels=await p.locator('label').allTextContents()
console.log('controls:', labels.filter(t=>t.trim()).slice(0,24).join(' | '))
