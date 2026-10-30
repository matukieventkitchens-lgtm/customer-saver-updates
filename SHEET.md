# Google Sheet me live customer list — setup (5 minute, ek baar)

1. PC/phone browser me **sheets.google.com** kholo → **naya blank sheet** banao → naam do "Customers"
2. Upar menu me **Extensions → Apps Script** dabao (nayi tab khulegi)
3. Jo code wahan pehle se hai use **poora delete** karo, aur `sheet-script.gs` file ka code **paste** karo
   (https://raw.githubusercontent.com/matukieventkitchens-lgtm/customer-saver-updates/main/sheet-script.gs)
4. **💾 Save** (Ctrl+S) dabao
5. Upar right me **Deploy → New deployment**
   - ⚙️ gear icon → **Web app** chuno
   - Execute as: **Me**
   - Who has access: **Anyone**
   - **Deploy** dabao
6. Google permission maangega → apna account chuno → **Advanced → Go to (project) (unsafe)** → **Allow**
7. Ek **Web app URL** milega (`https://script.google.com/macros/s/..../exec`) → **Copy**
8. Phone me Customer Saver app → Settings → **"Google Sheet link"** box me paste → **Settings save karo**
9. Tools me **"Poori list Google Sheet me bhejo"** dabao → sheet me saare customer aa jayenge ✓

Iske baad har naya customer, naam badlav, aur call count **apne aap** sheet me update hota rahega.

Check: browser me wo URL kholo → "Customer Saver sheet link kaam kar raha hai ✓" dikhna chahiye.
