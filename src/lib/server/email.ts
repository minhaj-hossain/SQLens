/**
 * SQLENS EMAIL SERVICE
 *
 * Sends transactional auth emails (verification) via Resend's REST API using
 * plain `fetch` — no extra dependency. When `RESEND_API_KEY` is not set the
 * email is logged to the server console instead (dev-friendly: the
 * verification link is printed and can be clicked directly).
 *
 * The HTML template mirrors the site's "execution plan" design system:
 * graphite surfaces, gold accent (#f4c430), monospace section labels.
 */

interface SendVerificationEmailOptions {
  to: string;
  subject: string;
  verificationUrl: string;
}

export interface SendEmailResult {
  delivered: boolean;
  error?: string;
}

const resendEndpoint = 'https://api.resend.com/emails';
const fromAddress = process.env.EMAIL_FROM ?? 'SQLens <onboarding@resend.dev>';

/**
 * Send the verification email. Resolves (never throws) so a provider outage
 * can't take down sign-up; callers only need `delivered` for logging.
 */
export async function sendVerificationEmail({
  to,
  subject,
  verificationUrl,
}: SendVerificationEmailOptions): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    // Dev fallback — no provider configured: print the magic link.
    console.log(
      [
        '[email] RESEND_API_KEY not set — verification email not sent.',
        `[email] To: ${to}`,
        `[email] Subject: ${subject}`,
        `[email] Verification link: ${verificationUrl}`,
      ].join('\n'),
    );
    return { delivered: false };
  }

  try {
    const res = await fetch(resendEndpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [to],
        subject,
        html: verificationEmailHtml({ verificationUrl }),
        text: verificationEmailText(verificationUrl),
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      console.error(`[email] Resend request failed (${res.status}): ${detail}`);
      return { delivered: false, error: `resend_${res.status}` };
    }
    return { delivered: true };
  } catch (err) {
    console.error('[email] Resend request threw:', err);
    return { delivered: false, error: 'network_error' };
  }
}
/* ____TEMPLATES_BELOW____ */

/* ========================================================================== */
/* Email templates                                                            */
/* ========================================================================== */

function verificationEmailText(verificationUrl: string): string {
  return [
    'Verify your email address',
    '',
    'Welcome to SQLens — confirm this email address to activate your account and start your 38-day SQL journey.',
    '',
    `Verify your email: ${verificationUrl}`,
    '',
    'This link expires in 1 hour. If you did not create a SQLens account, you can safely ignore this email.',
    '',
    '— SQLens',
  ].join('\n');
}

function verificationEmailHtml({ verificationUrl }: { verificationUrl: string }): string {
  const ink = '#0a0a0a';
  const surface = '#131313';
  const border = '#262626';
  const text = '#f2f2f0';
  const dim = '#93938e';
  const faint = '#83837c';
  const gold = '#f4c430';

  return `<!DOCTYPE html>
<html>
  <body style="margin:0; padding:0; background:${ink};">
    <div style="display:none; max-height:0; overflow:hidden; mso-hide:all;">
      Confirm your email to activate your SQLens account.
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${ink}; padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px; background:${surface}; border:1px solid ${border}; border-radius:12px; overflow:hidden;">
            <tr>
              <td style="padding:36px 40px 0 40px; font-family:'JetBrains Mono', Consolas, monospace; font-size:19px; font-weight:700; letter-spacing:-0.5px; color:${text};">
                SQL<span style="color:${gold};">ens</span>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 40px 8px 40px; font-family:'JetBrains Mono', Consolas, monospace; font-size:11px; letter-spacing:0.08em; text-transform:uppercase; color:${gold};">
                -- Step 1 of 1: verify your email
              </td>
            </tr>
            <tr>
              <td style="padding:0 40px 8px 40px; font-family:Inter, -apple-system, 'Segoe UI', sans-serif; font-size:22px; font-weight:600; color:${text};">
                One click left
              </td>
            </tr>
            <tr>
              <td style="padding:0 40px 24px 40px; font-family:Inter, -apple-system, 'Segoe UI', sans-serif; font-size:14px; line-height:1.65; color:${dim};">
                Welcome to SQLens. Confirm this email address to activate your account and keep your 38-day SQL progress synced across every device.
              </td>
            </tr>
            <tr>
              <td style="padding:0 40px 8px 40px;">
                <a href="${verificationUrl}"
                   style="display:block; background:${gold}; color:${ink}; font-family:Inter, -apple-system, 'Segoe UI', sans-serif; font-size:15px; font-weight:700; text-align:center; text-decoration:none; padding:14px 24px; border-radius:8px;">
                  Verify email address
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 40px 32px 40px; font-family:'JetBrains Mono', Consolas, monospace; font-size:11.5px; line-height:1.6; color:${faint};">
                Button not working? Paste this link into your browser:<br />
                <a href="${verificationUrl}" style="color:${dim}; word-break:break-all;">${verificationUrl}</a>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 40px 28px 40px; border-top:1px solid ${border}; font-family:'JetBrains Mono', Consolas, monospace; font-size:10.5px; line-height:1.7; color:${faint};">
                This link expires in 1 hour. If you didn't create a SQLens account, you can safely ignore this email — no address was activated.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

