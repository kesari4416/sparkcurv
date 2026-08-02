import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQSection = ({ faqs, title }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  useEffect(() => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-faq-schema', 'true');
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, [faqs]);

  return (
    <section className="pt-[1cm] pb-24 md:pb-32 bg-gray-50" data-testid="faq-section">
      <div className="max-w-4xl mx-auto px-6 lg:px-12">
        <div className="text-center mb-16 reveal-on-scroll">
          <div className="inline-block bg-gradient-to-r from-[#02028B]/10 to-blue-100 rounded-full px-6 py-2 mb-4">
            <span className="text-sm font-bold text-[#02028B] uppercase tracking-wider">FAQ</span>
          </div>
          <h2 className="font-clash text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
            {title || <>Frequently Asked <span className="text-gradient-blue">Questions</span></>}
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              data-testid={`faq-item-${index}`}
              className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden transition-all duration-300 hover:border-[#02028B]/20 reveal-on-scroll"
            >
              <button
                onClick={() => toggle(index)}
                data-testid={`faq-toggle-${index}`}
                className="w-full flex items-center justify-between px-6 py-5 text-left"
              >
                <span className="font-clash text-lg font-semibold text-gray-900 pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-[#02028B] flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96 pb-6' : 'max-h-0'
                }`}
              >
                <p className="px-6 text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
