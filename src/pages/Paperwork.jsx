export default function Paperwork() {
  return (
    <div className="holder" style={{ paddingTop: '200px', minHeight: '70vh' }}>
      <div className="reveal">
        <h2><div className="text-wrap"><div className="text-inner">Verified Paperwork</div></div></h2>
        <div className="subheading"><div className="text-wrap"><div className="text-inner">100% Transparent Transactions</div></div></div>
      </div>
      <div style={{ maxWidth: '800px', margin: '60px auto', opacity: 0.8, lineHeight: '1.8' }}>
        <p style={{ marginBottom: '20px' }}>Our legal team conducts rigorous due diligence on every plot and property listed on our platform. We ensure that EC (Encumbrance Certificates), Khata extracts, and Title Deeds are clear before any property reaches you.</p>
        <ul style={{ listStyle: 'disc', paddingLeft: '20px' }}>
          <li>RERA Approved Projects</li>
          <li>MUDA / DTCP Approved Layouts</li>
          <li>Clear Titles & Background Checks</li>
        </ul>
      </div>
    </div>
  );
}
