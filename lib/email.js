import { Resend } from "resend";

export async function sendPriceDropAlert(
  userEmail,
  product,
  oldPrice,
  newPrice
) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[Email Error]: RESEND_API_KEY is not configured.");
    return { error: "RESEND_API_KEY is missing" };
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
  const resend = new Resend(apiKey);

  try {
    const validOld = oldPrice !== null && oldPrice !== undefined && !isNaN(oldPrice) ? Number(oldPrice) : Number(newPrice);
    const validNew = Number(newPrice);
    const hasTarget = product.target_price !== null && product.target_price !== undefined;
    const targetPrice = hasTarget ? Number(product.target_price) : null;

    const priceDrop = validOld > validNew ? validOld - validNew : 0;
    const percentageDrop = validOld > 0 && priceDrop > 0 ? ((priceDrop / validOld) * 100).toFixed(1) : "0.0";

    const subject = hasTarget && validNew <= targetPrice
      ? `🎯 Target Price Hit: ${product.name} is now ${product.currency || "USD"} ${validNew.toFixed(2)}!`
      : `🎉 Price Drop Alert: ${product.name}`;

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: userEmail,
      subject,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            
            <div style="background: linear-gradient(135deg, #FA5D19 0%, #FF8C42 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 26px;">${hasTarget && validNew <= targetPrice ? "🎯 Target Price Reached!" : "🎉 Price Drop Alert!"}</h1>
            </div>
            
            <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
              
              ${
                product.image_url
                  ? `
                <div style="text-align: center; margin-bottom: 20px;">
                  <img src="${product.image_url}" alt="${product.name}" style="max-width: 180px; max-height: 180px; object-fit: contain; border-radius: 8px; border: 1px solid #e5e7eb; padding: 4px;">
                </div>
              `
                  : ""
              }
              
              <h2 style="color: #1f2937; margin-top: 0; font-size: 20px;">${product.name}</h2>
              
              ${
                hasTarget
                  ? `
                <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
                  <p style="margin: 0; font-size: 14px; color: #065f46;">
                    <strong>Target Price: ${product.currency || "USD"} ${targetPrice.toFixed(2)}</strong> (Current price is at or below your goal!)
                  </p>
                </div>
              `
                  : `
                <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
                  <p style="margin: 0; font-size: 14px; color: #92400e;">
                    <strong>Price dropped by ${percentageDrop}%!</strong>
                  </p>
                </div>
              `
              }
              
              <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
                ${
                  validOld > validNew
                    ? `
                  <tr>
                    <td style="padding: 10px; background: #f9fafb; border-radius: 6px; border: 1px solid #f3f4f6;">
                      <div style="font-size: 13px; color: #6b7280;">Previous Price</div>
                      <div style="font-size: 18px; color: #9ca3af; text-decoration: line-through;">
                        ${product.currency || "USD"} ${validOld.toFixed(2)}
                      </div>
                    </td>
                  </tr>
                `
                    : ""
                }
                <tr>
                  <td style="padding: 12px 10px;">
                    <div style="font-size: 13px; color: #6b7280;">Current Price</div>
                    <div style="font-size: 30px; color: #FA5D19; font-weight: bold;">
                      ${product.currency || "USD"} ${validNew.toFixed(2)}
                    </div>
                  </td>
                </tr>
                ${
                  priceDrop > 0
                    ? `
                  <tr>
                    <td style="padding: 10px; background: #dcfce7; border-radius: 6px; border: 1px solid #bbf7d0;">
                      <div style="font-size: 13px; color: #166534;">You Save</div>
                      <div style="font-size: 22px; color: #16a34a; font-weight: bold;">
                        ${product.currency || "USD"} ${priceDrop.toFixed(2)} (${percentageDrop}%)
                      </div>
                    </td>
                  </tr>
                `
                    : ""
                }
              </table>
              
              <div style="text-align: center; margin: 25px 0;">
                <a href="${product.url}" 
                   style="display: inline-block; background: #FA5D19; color: white; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">
                  View Product on Store →
                </a>
              </div>
              
              <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 20px; text-align: center; color: #6b7280; font-size: 12px;">
                <p style="margin: 0;">You're receiving this email because you're tracking this product on PriceRadar.</p>
                <p style="margin-top: 8px;">
                  <a href="${
                    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
                  }" style="color: #FA5D19; text-decoration: none;">
                    Manage your watchlist on PriceRadar
                  </a>
                </p>
              </div>
            </div>
            
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("[Resend Error]:", error);
      return { error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("[Email Exception]:", error);
    return { error: error.message };
  }
}
