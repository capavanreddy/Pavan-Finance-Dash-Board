
/**
 * Professional Email Templates for Finance Hub
 * Uses table-based layouts for high compatibility across email clients.
 */

export const emailStyles = `
  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #334155; margin: 0; padding: 0; background-color: #f8fafc; }
  .container { width: 100%; max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
  .header { background: #0f172a; padding: 32px; color: #ffffff; text-align: center; }
  .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.02em; }
  .content { padding: 32px; }
  .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 16px; }
  .badge-blue { background: #eff6ff; color: #2563eb; }
  .badge-green { background: #f0fdf4; color: #166534; }
  .badge-red { background: #fef2f2; color: #ef4444; }
  .table { width: 100%; border-collapse: collapse; margin: 24px 0; background: #fafafa; border-radius: 8px; overflow: hidden; border: 1px solid #f1f5f9; }
  .table th { text-align: left; padding: 12px 16px; background: #f1f5f9; color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; width: 140px; }
  .table td { padding: 12px 16px; color: #1e293b; font-size: 14px; border-bottom: 1px solid #f1f5f9; }
  .footer { padding: 24px; text-align: center; font-size: 12px; color: #94a3b8; background: #f8fafc; border-top: 1px solid #e2e8f0; }
  .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 700; margin-top: 24px; }
`;

interface EmailData {
  title: string;
  badgeText: string;
  badgeType: 'blue' | 'green' | 'red';
  rows: { label: string; value: string | undefined | null }[];
  ctaLink?: string;
  ctaText?: string;
}

export const getBaseTemplate = (data: EmailData) => {
  const tableRows = data.rows
    .filter(row => row.value !== undefined && row.value !== null && row.value !== "")
    .map(row => `
      <tr>
        <th>${row.label}</th>
        <td>${row.value}</td>
      </tr>
    `).join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>${emailStyles}</style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Finance Hub</h1>
          </div>
          <div class="content">
            <div class="badge badge-${data.badgeType}">${data.badgeText}</div>
            <h2 style="margin: 0 0 16px 0; color: #0f172a; font-size: 20px;">${data.title}</h2>
            
            <table class="table">
              ${tableRows}
            </table>

            ${data.ctaLink ? `
              <div style="text-align: center;">
                <a href="${data.ctaLink}" class="button">${data.ctaText || 'View Details'}</a>
              </div>
            ` : ''}
          </div>
          <div class="footer">
            This is an automated notification from the Finance Hub Platform.<br>
            © ${new Date().getFullYear()} IntelliCar Finance Team
          </div>
        </div>
      </body>
    </html>
  `;
};
