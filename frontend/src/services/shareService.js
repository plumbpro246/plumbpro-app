// Share Service for PlumbPro
import { Share } from '@capacitor/share';

// Check if native sharing is available
export const canShare = async () => {
  try {
    const result = await Share.canShare();
    return result.value;
  } catch {
    // Fallback to Web Share API check
    return 'share' in navigator;
  }
};

// Share bid via native share or email
export const shareBid = async (bid, pdfBlob = null) => {
  const subject = `Job Estimate: ${bid.job_name}`;
  const body = `
Hi ${bid.client_name},

Please find attached the estimate for: ${bid.job_name}

Estimate Summary:
- Labor: $${bid.labor_cost.toFixed(2)} (${bid.labor_hours} hours @ $${bid.hourly_rate}/hr)
- Materials: $${bid.material_cost.toFixed(2)}
- Total: $${bid.total_bid.toFixed(2)}

Description:
${bid.description}

${bid.notes ? `Notes:\n${bid.notes}` : ''}

This estimate is valid for 30 days.

Thank you for your business!
`.trim();

  try {
    // Try native sharing first
    const canNativeShare = await canShare();
    
    if (canNativeShare) {
      await Share.share({
        title: subject,
        text: body,
        dialogTitle: 'Share Estimate'
      });
      return { success: true, method: 'native' };
    }
  } catch (error) {
    console.log('Native share failed, trying fallback');
  }

  // Fallback to mailto link
  const mailtoLink = `mailto:${bid.client_contact || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(mailtoLink, '_blank');
  return { success: true, method: 'mailto' };
};

// Share timesheet summary
export const shareTimesheetSummary = async (data) => {
  const subject = `Timesheet Report: ${data.period.start} to ${data.period.end}`;
  const body = `
Timesheet Report
Employee: ${data.user.name}
${data.user.company ? `Company: ${data.user.company}` : ''}
Period: ${data.period.start} to ${data.period.end}

Summary:
- Total Hours: ${data.summary.total_hours}
- Total Entries: ${data.summary.total_entries}

Hours by Job:
${Object.entries(data.summary.jobs_summary)
  .map(([job, stats]) => `- ${job}: ${stats.hours.toFixed(2)} hours (${stats.entries} entries)`)
  .join('\n')}

Generated: ${new Date().toLocaleString()}
`.trim();

  try {
    const canNativeShare = await canShare();
    
    if (canNativeShare) {
      await Share.share({
        title: subject,
        text: body,
        dialogTitle: 'Share Timesheet'
      });
      return { success: true, method: 'native' };
    }
  } catch (error) {
    console.log('Native share failed');
  }

  // Fallback
  const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(mailtoLink, '_blank');
  return { success: true, method: 'mailto' };
};

// Share generic content
export const shareContent = async (title, text, url = null) => {
  try {
    const canNativeShare = await canShare();
    
    if (canNativeShare) {
      await Share.share({
        title,
        text,
        url,
        dialogTitle: 'Share'
      });
      return { success: true };
    }
  } catch (error) {
    console.log('Share failed:', error);
  }

  // Fallback to clipboard
  try {
    await navigator.clipboard.writeText(`${title}\n\n${text}${url ? `\n\n${url}` : ''}`);
    return { success: true, method: 'clipboard' };
  } catch {
    return { success: false };
  }
};

export default {
  canShare,
  shareBid,
  shareTimesheetSummary,
  shareContent
};
