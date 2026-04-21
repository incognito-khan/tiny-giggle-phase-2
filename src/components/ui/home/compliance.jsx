export function Compliance() {
  const badges = [
    { src: "/hippa.png", alt: "HIPAA Compliant" },
    { src: "/GDPR.png", alt: "GDPR Compliant" },
    { src: "/pci.png", alt: "PCI DSS Compliant" },
  ];

  return (
    <div className="w-full py-12 flex flex-col items-center gap-8">
      <div className="text-center">
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">
          Trusted & Verified
        </p>
        <h2 className="text-xl font-medium text-gray-800">
          Our Compliance Standards
        </h2>
      </div>

      <div className="flex flex-wrap gap-6 justify-center items-center">
        {badges.map((badge) => (
          <div
            key={badge.alt}
            className="flex flex-col items-center justify-center bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
            style={{ minWidth: "140px" }}
          >
            <img
              src={badge.src}
              alt={badge.alt}
              className="w-36 h-36 object-contain"
            />
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 text-center max-w-md">
        Your data is protected under internationally recognized security
        standards
      </p>
    </div>
  );
}
