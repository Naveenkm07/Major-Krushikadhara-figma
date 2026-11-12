const BASE_STYLES = `
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    margin: 0;
    padding: 24px 16px 48px;
    background: #f4f7f5;
    color: #18231c;
    line-height: 1.6;
  }
  .wrap {
    max-width: 760px;
    margin: 0 auto;
    background: #ffffff;
    border-radius: 16px;
    padding: 28px 24px;
    box-shadow: 0 4px 20px rgba(22, 89, 34, 0.08);
    border: 1px solid #e1ebe4;
  }
  .badge {
    display: inline-block;
    background: #dcfce7;
    color: #165922;
    font-weight: 700;
    font-size: 12px;
    padding: 4px 10px;
    border-radius: 999px;
    letter-spacing: 0.4px;
    text-transform: uppercase;
  }
  h1 {
    color: #165922;
    font-size: 26px;
    margin: 12px 0 4px;
  }
  .meta {
    color: #526358;
    font-size: 14px;
    margin-bottom: 20px;
  }
  h2 {
    color: #14532d;
    font-size: 18px;
    margin-top: 24px;
    margin-bottom: 8px;
    border-bottom: 1px solid #eef4f0;
    padding-bottom: 4px;
  }
  p, li {
    font-size: 15px;
    color: #2b3b30;
  }
  ul {
    padding-left: 20px;
  }
  .nav {
    margin-top: 28px;
    padding-top: 16px;
    border-top: 1px solid #e5ede7;
    font-size: 14px;
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }
  a {
    color: #15803d;
    font-weight: 600;
    text-decoration: none;
  }
  a:hover {
    text-decoration: underline;
  }
  .box {
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 12px;
    padding: 14px 16px;
    margin: 16px 0;
  }
`

function pageShell(title: string, badge: string, content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} — KrushikaDhara</title>
  <style>${BASE_STYLES}</style>
</head>
<body>
  <main class="wrap">
    <span class="badge">${badge}</span>
    <h1>${title}</h1>
    <p class="meta">KrushikaDhara Smart Farming Platform · Last updated: November 2026</p>
    ${content}
    <nav class="nav">
      <a href="/privacy">Privacy Policy</a>
      <a href="/terms">Terms of Service</a>
      <a href="/delete-account">Account &amp; Data Deletion</a>
      <a href="/api/health">API Status</a>
    </nav>
  </main>
</body>
</html>`
}

export const PRIVACY_POLICY_HTML = pageShell(
  "Privacy Policy",
  "KrushikaDhara · Legal",
  `
  <h2>1. Information We Collect</h2>
  <p>KrushikaDhara collects only the information required to deliver agricultural advisory and farm management features:</p>
  <ul>
    <li><strong>Account Sign-In:</strong> Your 10-digit Indian mobile number for OTP verification.</li>
    <li><strong>Farmer &amp; Farm Profile (Optional):</strong> Name, state, district, taluk/village, farm acreage, active crops, soil NPK/pH values, and profile photo.</li>
    <li><strong>Crop Photos (Optional):</strong> Leaf or crop images you capture or select when using AI Pest &amp; Disease Scan.</li>
    <li><strong>Voice Audio (Optional):</strong> Microphone recordings captured only when you tap the Speak / Voice AI button.</li>
    <li><strong>Approximate/Precise Location (While In Use):</strong> Used only when the app is open to find APMC Mandis within 50 km, hyperlocal weather advisories, and nearby rental machinery.</li>
  </ul>

  <h2>2. How We Use &amp; Process Data</h2>
  <p>We never sell farmer personal data to advertisers or data brokers. Uploaded crop images, agricultural questions, and voice clips are transmitted over encrypted HTTPS solely to compute:</p>
  <ul>
    <li>AI crop pest &amp; disease diagnosis (YOLO11s &amp; Gemini Vision)</li>
    <li>Kannada &amp; English voice transcription/answers (Sarvam AI)</li>
    <li>Live APMC mandi pricing, hyperlocal weather, and crop-stage guidance</li>
  </ul>

  <h2>3. Government Portal &amp; Disclaimer</h2>
  <p>KrushikaDhara is an independent farmer decision-support application and is <strong>not an official government entity</strong>. Crop insurance (PMFBY) calculators and government scheme summaries reference public information from official portals such as <em>pmfby.gov.in</em>, <em>myscheme.gov.in</em>, and <em>data.gov.in</em>.</p>

  <h2>4. Retention &amp; Account Deletion Rights</h2>
  <p>You retain full ownership of your farm records. You can permanently delete your farmer profile, crop scan history, saved tips, equipment bookings, and crop insurance records at any time inside the app (<strong>Settings → Privacy Policy → Delete My Account &amp; Data</strong>) or by following instructions at <a href="/delete-account">/delete-account</a>.</p>

  <h2>5. Contact</h2>
  <p>Privacy questions or grievances: <a href="mailto:support@krushikadhara.in">support@krushikadhara.in</a> (Bengaluru &amp; Mandya, Karnataka, India).</p>
`
)

export const TERMS_OF_SERVICE_HTML = pageShell(
  "Terms of Service",
  "KrushikaDhara · Legal",
  `
  <h2>1. Agricultural Advisory Disclaimer</h2>
  <p>AI pest detection (YOLO11s / Gemini Vision), weather advisories, and fertilizer dosages are decision-support tools. Before applying chemical pesticides, verify product labels, approved dosages, and local Karnataka Raitha Samparka Kendra (RSK) agronomist guidance.</p>

  <h2>2. Equipment Rental Marketplace</h2>
  <p>KrushikaDhara connects local farm machinery owners and renters directly. Owners must maintain safe working machinery; renters must inspect fuel, attachments, and agreed daily rates before dispatch.</p>

  <h2>3. PMFBY Insurance &amp; Official Portals</h2>
  <p>Premium calculations, eligibility checks, and claim tracking assist farmers in organizing records. Official policy issuance, claim settlement, and DBT disbursements are governed solely by <em>pmfby.gov.in</em>, Karnataka Samrakshane, and respective government portals.</p>

  <h2>4. Grievance &amp; Contact</h2>
  <p>For support, account deletion requests, or legal queries, contact KrushikaDhara Farmer Support at <a href="mailto:support@krushikadhara.in">support@krushikadhara.in</a>.</p>
`
)

export const DELETE_ACCOUNT_HTML = pageShell(
  "Account & Data Deletion",
  "KrushikaDhara · Google Play Data Safety",
  `
  <div class="box">
    <strong>Instant In-App Deletion (Recommended):</strong>
    <p style="margin:6px 0 0;">Open <strong>KrushikaDhara</strong> on Android → tap the <strong>Profile / Settings</strong> icon → open <strong>Privacy Policy</strong> → tap <strong>Delete My Account &amp; Data</strong> and confirm.</p>
  </div>

  <h2>What Data Is Permanently Deleted</h2>
  <p>Confirming deletion immediately removes all records linked to your registered mobile number:</p>
  <ul>
    <li>Farmer profile, farm acreage, soil health NPK/pH values, and saved crops</li>
    <li>Crop pest &amp; disease scan history and uploaded leaf images</li>
    <li>Saved AI agronomy tips and advisories</li>
    <li>Equipment rental listings and booking records</li>
    <li>PMFBY crop insurance drafts and claim tracking entries</li>
    <li>OTP authentication tokens and local device session storage</li>
  </ul>

  <h2>Request Deletion Without the App</h2>
  <p>If you uninstalled KrushikaDhara and want your account deleted manually, send an email to <a href="mailto:support@krushikadhara.in?subject=Delete%20KrushikaDhara%20Account">support@krushikadhara.in</a> from your contact email with your registered 10-digit mobile number. Verified deletion requests are completed within 7 business days with zero residual personal data retained.</p>
`
)
