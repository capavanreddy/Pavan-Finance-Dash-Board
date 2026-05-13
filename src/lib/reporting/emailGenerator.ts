import { BRAND_COLORS, BRAND_TEXT } from './reportAssets';

/**
 * Professional HTML Email Template for Reports
 */
export function generateProfessionalReportEmail({
  title,
  subtitle,
  metrics,
  summaryText,
  ctaLink
}: {
  title: string;
  subtitle: string;
  metrics: { label: string; value: string | number; color?: string }[];
  summaryText: string;
  ctaLink: string;
}) {
  // Generate metrics table rows
  const metricCells = metrics.map(m => `
    <td align="center" style="padding: 10px;">
      <div style="background: ${BRAND_COLORS.LIGHT}; padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0; min-width: 140px;">
        <div style="font-size: 11px; color: ${BRAND_COLORS.MUTED}; text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px; margin-bottom: 8px;">${m.label}</div>
        <div style="font-size: 24px; color: ${m.color || BRAND_COLORS.INTELLICAR_BLUE}; font-weight: 800;">${m.value}</div>
      </div>
    </td>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; -webkit-font-smoothing: antialiased;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <tr>
                <td align="center" style="background-color: ${BRAND_COLORS.DARK}; padding: 40px 30px;">
                  <div style="color: #94a3b8; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2.5px; margin-bottom: 10px;">${BRAND_TEXT.CORPORATE_NAME}</div>
                  <h1 style="color: #ffffff; font-size: 28px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">${BRAND_TEXT.PRODUCT_NAME}</h1>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 40px 35px;">
                  <h2 style="font-size: 22px; font-weight: 800; color: ${BRAND_COLORS.DARK}; margin: 0 0 10px 0;">${title}</h2>
                  <p style="font-size: 15px; color: ${BRAND_COLORS.MUTED}; margin: 0 0 35px 0; font-weight: 500;">${subtitle}</p>

                  <!-- Metrics Table -->
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 35px;">
                    <tr>
                      ${metricCells}
                    </tr>
                  </table>

                  <!-- Summary Box -->
                  <div style="background-color: #fff1f2; border-left: 4px solid ${BRAND_COLORS.DANGER}; padding: 20px; border-radius: 0 12px 12px 0; margin-bottom: 40px;">
                    <div style="color: ${BRAND_COLORS.DANGER}; font-size: 13px; font-weight: 800; text-transform: uppercase; margin-bottom: 6px;">Executive Summary</div>
                    <div style="font-size: 15px; color: #475569; line-height: 1.6; font-weight: 500;">${summaryText}</div>
                  </div>

                  <!-- CTA Button (Bulletproof) -->
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td align="center" style="padding: 20px 0 10px 0;">
                        <table border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate !important;">
                          <tr>
                            <td align="center" bgcolor="${BRAND_COLORS.INTELLICAR_BLUE}" style="border-radius: 12px; color: #ffffff; display: block; font-size: 16px; font-weight: 800; line-height: 1; padding: 22px 40px; text-align: center; text-decoration: none; box-shadow: 0 10px 20px rgba(79, 70, 229, 0.3);">
                              <a href="${ctaLink}" target="_blank" style="color: #ffffff; text-decoration: none; display: block;">VIEW LIVE DASHBOARD</a>
                            </td>
                          </tr>
                        </table>
                        <p style="font-size: 11px; color: #94a3b8; margin-top: 15px; font-weight: 600;">Link expires in 7 days for security.</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td align="center" style="background-color: #f8fafc; padding: 35px; border-top: 1px solid #e2e8f0;">
                  <div style="font-size: 12px; color: #94a3b8; line-height: 1.8;">
                    <p style="margin: 0 0 15px 0;">This is an automated performance update from the <strong>${BRAND_TEXT.DIVISION}</strong>. This email contains confidential information.</p>
                    <p style="margin: 0;">${BRAND_TEXT.COPYRIGHT}</p>
                    <div style="margin-top: 20px; font-weight: 700; color: ${BRAND_COLORS.DARK}; opacity: 0.6;">${BRAND_TEXT.POWERED_BY}</div>
                  </div>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}
