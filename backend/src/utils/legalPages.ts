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
    max-width: 800px;
    margin: 0 auto;
    background: #ffffff;
    border-radius: 16px;
    padding: 32px 28px;
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
    font-size: 28px;
    margin: 14px 0 6px;
  }
  .meta {
    color: #526358;
    font-size: 14px;
    margin-bottom: 24px;
  }
  h2 {
    color: #14532d;
    font-size: 19px;
    margin-top: 28px;
    margin-bottom: 10px;
    border-bottom: 1px solid #eef4f0;
    padding-bottom: 6px;
  }
  h3 {
    color: #1f2937;
    font-size: 16px;
    margin-top: 18px;
    margin-bottom: 6px;
  }
  p, li {
    font-size: 15px;
    color: #2b3b30;
    line-height: 1.65;
  }
  ul {
    padding-left: 22px;
    margin: 8px 0 16px;
  }
  li {
    margin-bottom: 6px;
  }
  .nav {
    margin-top: 36px;
    padding-top: 20px;
    border-top: 1px solid #e5ede7;
    font-size: 14px;
    display: flex;
    gap: 18px;
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
  .box-danger {
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 12px;
    padding: 16px 18px;
    margin: 18px 0;
  }
  .box-info {
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 12px;
    padding: 16px 18px;
    margin: 18px 0;
  }
  .table-wrap {
    overflow-x: auto;
    margin: 14px 0;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }
  th, td {
    border: 1px solid #e5e7eb;
    padding: 10px 12px;
    text-align: left;
  }
  th {
    background: #f9fafb;
    color: #111827;
    font-weight: 700;
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
    <p class="meta">KrushikaDhara (Package: <code>com.krushikadhara.app</code>) · Developer: NeedIO · Last updated: November 2026</p>
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
  "Google Play Compliant · Official Legal Disclosure",
  `
  <div class="box-info">
    <strong>KrushikaDhara Privacy Commitment:</strong>
    <p style="margin:4px 0 0;">KrushikaDhara (<code>com.krushikadhara.app</code>) is an agricultural advisory platform built for Indian farmers. We collect only minimal, purposeful data required to provide farming guidance. <strong>We do not sell personal data, do not display third-party advertisements, and do not track users across other apps or websites.</strong></p>
  </div>

  <h2>1. Developer &amp; Application Identity</h2>
  <p>This Privacy Policy applies to the <strong>KrushikaDhara</strong> mobile application and web services:</p>
  <ul>
    <li><strong>Application Name:</strong> KrushikaDhara (ಕೃಷಿಕಧಾರಾ)</li>
    <li><strong>Application Package ID:</strong> <code>com.krushikadhara.app</code></li>
    <li><strong>Developer / Organization:</strong> NeedIO / KrushikaDhara Agritech Team</li>
    <li><strong>Support &amp; Privacy Contact Email:</strong> <a href="mailto:needioindia@gmail.com">needioindia@gmail.com</a> / <a href="mailto:support@krushikadhara.in">support@krushikadhara.in</a></li>
    <li><strong>Physical Location:</strong> Bengaluru &amp; Mandya, Karnataka, India</li>
  </ul>

  <h2>2. Information We Collect and Why</h2>
  <p>We collect and process the following categories of data solely to provide agricultural features:</p>
  
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Data Category</th>
          <th>Specific Data</th>
          <th>Purpose &amp; Processing</th>
          <th>Required or Optional</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Account &amp; Sign-In</strong></td>
          <td>10-digit Indian Mobile Number</td>
          <td>Delivering one-time password (OTP) verification and maintaining farm records.</td>
          <td>Required for authenticated profile sync</td>
        </tr>
        <tr>
          <td><strong>Farmer Profile</strong></td>
          <td>Farmer name, district, taluk, village, farm acreage, active crops, soil NPK/pH values</td>
          <td>Personalizing crop stage advisories, spraying recommendations, and weather thresholds.</td>
          <td>Optional (farmer can edit or clear anytime)</td>
        </tr>
        <tr>
          <td><strong>Photos &amp; Images</strong></td>
          <td>Photographs of crop leaves captured or selected by the user</td>
          <td>Input to YOLO11s TFLite &amp; Gemini Multimodal Vision for plant pest/disease identification and treatment advice.</td>
          <td>Optional (triggered only when user taps Scan or selects gallery image)</td>
        </tr>
        <tr>
          <td><strong>Voice Audio</strong></td>
          <td>Microphone voice recordings</td>
          <td>Transcribed via Sarvam AI Speech-to-Text to answer farming queries in Kannada or English. Audio files are processed in-memory and immediately discarded.</td>
          <td>Optional (triggered only when user taps the Speak button)</td>
        </tr>
        <tr>
          <td><strong>Location Data</strong></td>
          <td>Approximate &amp; Precise GPS Location (Foreground Only)</td>
          <td>Discovering verified APMC Mandis within 50 km, hyperlocal weather forecasts, and nearby rental machinery. Location coordinates are never saved to our database or tracked in the background.</td>
          <td>Optional (farmers can also choose manual farming hubs like Mandya, Mysuru, etc.)</td>
        </tr>
      </tbody>
    </table>
  </div>

  <h2>3. Android Device Permissions Declared &amp; Justification</h2>
  <p>In accordance with Google Play Store Developer Policies, KrushikaDhara explicitly declares and bounds each requested permission:</p>
  <ul>
    <li><code>android.permission.CAMERA</code>: Used strictly when the user activates the in-app camera viewfinder to photograph a diseased crop leaf. Never accessed in the background.</li>
    <li><code>android.permission.RECORD_AUDIO</code>: Used strictly when the user taps and holds or presses the microphone button to ask a spoken agronomy question. Audio recording stops immediately upon releasing or tapping stop. Background recording is strictly disabled (<code>enableBackgroundRecording: false</code>).</li>
    <li><code>android.permission.ACCESS_FINE_LOCATION</code> &amp; <code>android.permission.ACCESS_COARSE_LOCATION</code>: Used solely in the foreground when fetching nearest APMC mandis and localized weather alerts. <strong>Background location (<code>ACCESS_BACKGROUND_LOCATION</code>) is NOT requested or used.</strong></li>
    <li><code>android.permission.INTERNET</code> &amp; <code>android.permission.ACCESS_NETWORK_STATE</code>: Used to establish secure HTTPS connections to cloud advisory services and data.gov.in mandi directories.</li>
    <li><code>android.permission.MODIFY_AUDIO_SETTINGS</code>: Used for smooth playback of synthesized Kannada/English voice responses.</li>
  </ul>

  <h2>4. Data Security &amp; Encryption in Transit</h2>
  <p>All network communications between the KrushikaDhara mobile app and our servers use TLS 1.3 / HTTPS encryption. Sensitive authentication tokens (JWT) are stored securely using encrypted device storage and are verified on every protected API call.</p>

  <h2>5. Third-Party Service Providers</h2>
  <p>To deliver advanced agricultural AI and verified public market data, we partner with reputable cloud and API providers under strict data privacy terms:</p>
  <ul>
    <li><strong>Google Gemini API:</strong> AI plant pathology diagnosis and agronomist intelligence.</li>
    <li><strong>Sarvam AI:</strong> Indic voice recognition (Speech-to-Text) and natural voice synthesis (Text-to-Speech) for Kannada and English.</li>
    <li><strong>data.gov.in / National Informatics Centre (NIC):</strong> Daily wholesale commodity price data from verified APMC mandis.</li>
    <li><strong>WeatherAPI.com:</strong> Hyperlocal agricultural weather forecasts and rainfall projections.</li>
    <li><strong>Cloudinary:</strong> Secure cloud media storage for crop diagnostic photos.</li>
  </ul>
  <p>We do not share your mobile number, identity, or farm profile with external commercial marketing partners.</p>

  <h2>6. Non-Government Entity Disclaimer</h2>
  <div class="box-info">
    <p style="margin:0;"><strong>Independent Agricultural Platform Disclaimer:</strong> KrushikaDhara is an independent decision-support platform created by NeedIO. It is <strong>NOT an official government entity, agency, or department</strong>, and is not affiliated with, endorsed by, or authorized by the Government of India, the Government of Karnataka, the Ministry of Agriculture &amp; Farmers Welfare, or any state agricultural department. Crop insurance calculations and scheme directories reference public information from official portals (<em>pmfby.gov.in</em>, <em>pmkisan.gov.in</em>, and <em>myscheme.gov.in</em>). Official applications and claim settlements must be submitted directly through official government portals.</p>
  </div>

  <h2>7. Children's Privacy</h2>
  <p>KrushikaDhara is intended solely for adult farmers, agricultural entrepreneurs, and rural workers aged <strong>18 and older</strong>. We do not knowingly collect or solicit personal information from children under the age of 13. If we become aware that a child under 13 has provided personal data, we will promptly delete it.</p>

  <h2>8. User Rights: Instant Account &amp; Data Deletion</h2>
  <p>You retain full sovereignty over your data. In full compliance with Google Play's Account Deletion policy, you may permanently purge your account and all associated records:</p>
  <ul>
    <li><strong>In-App Deletion:</strong> Open KrushikaDhara → tap Profile / Settings → open Privacy Policy → tap <strong>Delete My Account &amp; Data</strong>. All records are purged immediately.</li>
    <li><strong>Web Deletion Form:</strong> Visit <a href="/delete-account">https://krushikadhara-api.onrender.com/delete-account</a> and submit your registered mobile number. Verified deletion is executed within 7 business days.</li>
  </ul>

  <h2>9. Contact &amp; Grievance Redressal</h2>
  <p>For privacy questions, access requests, or policy inquiries, contact our Data Protection Officer:</p>
  <ul>
    <li><strong>Email:</strong> <a href="mailto:needioindia@gmail.com">needioindia@gmail.com</a> / <a href="mailto:support@krushikadhara.in">support@krushikadhara.in</a></li>
    <li><strong>Postal Address:</strong> NeedIO Agricultural Technologies, Bengaluru &amp; Mandya, Karnataka, India.</li>
  </ul>
`
)

export const TERMS_OF_SERVICE_HTML = pageShell(
  "Terms of Service",
  "KrushikaDhara · Farmer Usage Agreement",
  `
  <h2>1. Acceptance of Terms</h2>
  <p>By downloading, installing, accessing, or using KrushikaDhara (<code>com.krushikadhara.app</code>), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please discontinue use of the application.</p>

  <h2>2. Agricultural Advisory &amp; AI Diagnostic Disclaimer</h2>
  <p>KrushikaDhara provides AI crop pest and disease diagnosis (powered by YOLO11s and Google Gemini Vision), weather projections, and crop-stage nutrient guidelines as <strong>decision-support tools</strong>:</p>
  <ul>
    <li>AI diagnostics are designed to assist farmers in identifying potential crop issues based on photographic evidence and user observations.</li>
    <li>Before applying any chemical pesticide, fungicide, herbicide, or fertilizer, farmers must always inspect the physical product packaging, verify registered dosages, check expiry dates, and consult a certified agronomist or local Raitha Samparka Kendra (RSK) officer.</li>
    <li>KrushikaDhara and its developers are not liable for crop yield variations, adverse chemical reactions, or weather deviations.</li>
  </ul>

  <h2>3. Equipment Rental Marketplace Terms</h2>
  <p>KrushikaDhara enables local farm equipment owners and renters to discover each other:</p>
  <ul>
    <li>Equipment owners are responsible for maintaining machinery in safe, roadworthy, and operational condition.</li>
    <li>Renters are responsible for verifying operator licenses, agreed rental fees, diesel/fuel arrangements, and field suitability prior to dispatch.</li>
    <li>Transactions and physical handovers take place directly between machinery owners and renters.</li>
  </ul>

  <h2>4. PMFBY Crop Insurance &amp; Government Schemes</h2>
  <p>KrushikaDhara provides informational tools including premium estimates, document checklists, and eligibility summaries:</p>
  <ul>
    <li>The application does not underwrite insurance policies, collect premium payments, or disburse claim funds.</li>
    <li>Official policy issuance, insurance coverage, damage assessment, and Direct Benefit Transfer (DBT) claim settlements remain governed solely by the Government of India, the Government of Karnataka (Samrakshane Portal), and authorized agricultural insurance companies via <a href="https://pmfby.gov.in" target="_blank" rel="noopener">pmfby.gov.in</a>.</li>
  </ul>

  <h2>5. Prohibited Conduct</h2>
  <p>Users agree not to: (a) upload malicious files or non-crop imagery intended to corrupt AI models; (b) misuse OTP verification endpoints; (c) attempt unauthorized access to platform servers; or (d) post fraudulent machinery rental listings.</p>

  <h2>6. Governing Law &amp; Dispute Resolution</h2>
  <p>These terms are governed by the laws of India. Any legal dispute or claim arising out of or in connection with KrushikaDhara shall be subject to the exclusive jurisdiction of the courts in Bengaluru / Mandya, Karnataka, India.</p>

  <h2>7. Support &amp; Legal Queries</h2>
  <p>Questions regarding these terms may be directed to <a href="mailto:needioindia@gmail.com">needioindia@gmail.com</a> or <a href="mailto:support@krushikadhara.in">support@krushikadhara.in</a>.</p>
`
)

export const DELETE_ACCOUNT_HTML = pageShell(
  "Account & Data Deletion",
  "Google Play Data Safety · Permanent User Data Erasure",
  `
  <div class="box-danger">
    <strong>Instant In-App Deletion (Fastest &amp; Recommended):</strong>
    <p style="margin:6px 0 0;">Open <strong>KrushikaDhara</strong> on your Android phone → tap the <strong>Profile / Settings</strong> icon → open <strong>Privacy Policy</strong> → scroll to the bottom and tap <strong>Delete My Account &amp; Data</strong>. Your profile and records are wiped immediately.</p>
  </div>

  <h2>1. Right to Permanent Data Erasure</h2>
  <p>In strict compliance with Google Play Store Developer Policies, KrushikaDhara (<code>com.krushikadhara.app</code>) provides every user the unconditional right to permanently delete their account and all associated personal data.</p>

  <h2>2. What Data Is Permanently Deleted</h2>
  <p>When an account deletion request is processed, the following data points linked to your registered mobile number are permanently and irreversibly purged from our servers and active databases:</p>
  <ul>
    <li><strong>Farmer Profile:</strong> Name, phone number, state, district, taluk, village, farm size, and profile photo.</li>
    <li><strong>Crop Health Records:</strong> All past crop leaf scan images, diagnosis reports, and severity assessments.</li>
    <li><strong>Crop Stage &amp; Field Data:</strong> Active crop fields, sowing dates, and tracked growth stages.</li>
    <li><strong>Equipment Listings:</strong> All machinery listings or booking requests published by your account.</li>
    <li><strong>PMFBY Drafts:</strong> Saved crop insurance calculations and document checklists.</li>
    <li><strong>Authentication Tokens:</strong> All active JWT session tokens and OTP verification tokens.</li>
  </ul>

  <h2>3. Web Deletion Request (If App Is Uninstalled)</h2>
  <p>If you have uninstalled KrushikaDhara from your mobile device and wish to delete your account and all associated data, you may submit a request using either method below:</p>
  <ul>
    <li><strong>Email Request:</strong> Send an email to <a href="mailto:needioindia@gmail.com?subject=KrushikaDhara%20Account%20Deletion%20Request">needioindia@gmail.com</a> or <a href="mailto:support@krushikadhara.in?subject=KrushikaDhara%20Account%20Deletion%20Request">support@krushikadhara.in</a> with the subject <em>"KrushikaDhara Account Deletion Request"</em> stating your 10-digit registered Indian mobile number.</li>
    <li><strong>Processing Timeline:</strong> Verified email requests are executed within <strong>7 business days</strong>. Once completed, a confirmation notice will be returned to your contact email, and zero residual personal data is retained on our servers.</li>
  </ul>
`
)
