interface ServerInquiryRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  preferredDate: string;
  dressReference: string;
  message: string;
  authorUid: string;
  createdAt: string;
}

let vercelInquiries: ServerInquiryRecord[] = [];

export default function handler(req: any, res: any) {
  if (req.method === 'GET') {
    res.status(200).json({ inquiries: vercelInquiries });
    return;
  }

  if (req.method === 'POST') {
    const body = req.body || {};
    const id = String(body.id || `inq_${Date.now()}`);
    const record: ServerInquiryRecord = {
      id,
      name: String(body.name || 'Customer').slice(0, 100),
      email: String(body.email || '').slice(0, 180),
      phone: String(body.phone || '+91 98251 21298').slice(0, 30),
      preferredDate: String(
        body.preferredDate || 'Shingar Dresses (M.G. Road Main Shop)'
      ).slice(0, 80),
      dressReference: String(body.dressReference || 'General Shop Question').slice(
        0,
        150
      ),
      message: String(body.message || '').slice(0, 1000),
      authorUid: String(body.authorUid || 'guest_visitor').slice(0, 120),
      createdAt: String(body.createdAt || new Date().toISOString()),
    };
    vercelInquiries = [
      record,
      ...vercelInquiries.filter((inq) => inq.id !== id),
    ];
    res.status(200).json({ ok: true, inquiry: record });
    return;
  }

  if (req.method === 'DELETE') {
    const targetId = String(req.query?.id || req.body?.id || '');
    vercelInquiries = vercelInquiries.filter((inq) => inq.id !== targetId);
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ error: 'Method Not Allowed' });
}
