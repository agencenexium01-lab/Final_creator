import type { CalendarDay, ScriptResult } from '@/types';

export function calendarToText(days: CalendarDay[]): string {
  return days
    .map((d) => `Jour ${d.day}${d.date ? ` (${formatDate(d.date)})` : ''} · ${d.format} · ${d.platform === 'facebook' ? 'Facebook' : 'TikTok'}\n${d.idea}\nHook : ${d.hook}`)
    .join('\n\n');
}

export function scriptToText(script: ScriptResult): string {
  const parts = script.sections.map((s) => `${s.label}\n${s.content}${s.visual_note ? `\n[À l'écran : ${s.visual_note}]` : ''}`);
  if (script.caption) parts.push(`Légende\n${script.caption}`);
  if (script.hashtags?.length) parts.push(script.hashtags.join(' '));
  return parts.join('\n\n');
}

export function formatDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
}

/** PDF texte (vectoriel, léger, imprimable). jsPDF n'est chargé qu'au clic. */
export async function exportCalendarPdf(days: CalendarDay[], title: string) {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const margin = 15;
  const width = pdf.internal.pageSize.getWidth() - margin * 2;
  const bottom = pdf.internal.pageSize.getHeight() - margin;
  let y = margin;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.text(title, margin, y);
  y += 10;

  for (const d of days) {
    const header = `Jour ${d.day}${d.date ? ` - ${formatDate(d.date)}` : ''}  |  ${d.format}  |  ${d.platform === 'facebook' ? 'Facebook' : 'TikTok'}`;
    const idea = pdf.splitTextToSize(d.idea, width) as string[];
    const hook = pdf.splitTextToSize(`Hook : ${d.hook}`, width) as string[];
    const blockHeight = 6 + (idea.length + hook.length) * 5 + 4;
    if (y + blockHeight > bottom) {
      pdf.addPage();
      y = margin;
    }
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(90, 60, 180);
    pdf.text(header, margin, y);
    y += 6;
    pdf.setTextColor(20, 20, 20);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    pdf.text(idea, margin, y);
    y += idea.length * 5;
    pdf.setTextColor(80, 80, 80);
    pdf.text(hook, margin, y);
    y += hook.length * 5 + 4;
  }
  pdf.save(`${title.toLowerCase().replace(/[^a-z0-9]+/gi, '-')}.pdf`);
}
