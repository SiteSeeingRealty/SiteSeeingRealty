export default function About() {
  return (
    <div className="holder" style={{ paddingTop: '200px', minHeight: '70vh' }}>
      <div className="reveal">
        <h2><div className="text-wrap"><div className="text-inner">About Us</div></div></h2>
        <div className="subheading"><div className="text-wrap"><div className="text-inner">The Premium Broker of Mysore</div></div></div>
      </div>
      <div style={{ maxWidth: '800px', margin: '60px auto', opacity: 0.8, lineHeight: '1.8' }}>
        <p style={{ marginBottom: '20px' }}>We are dedicated to bringing transparency, luxury, and ease to the real estate market in Karnataka. Starting in Mysore, our vision is to create a seamless platform for buyers to discover premium plots, villas, and apartments.</p>
        <p>Unlike traditional brokers, we verify all paperwork and provide an immersive digital experience for every property, ensuring you make your investment with absolute confidence.</p>
      </div>
    </div>
  );
}
