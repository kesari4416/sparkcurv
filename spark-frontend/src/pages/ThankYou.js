import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const ThankYou = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div
      data-testid="thank-you-page"
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#02028B] to-blue-600"
    >
      <div className="text-center px-6 animate-fade-in">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 rounded-full mb-8 animate-slide-up">
          <CheckCircle className="w-14 h-14 text-white" />
        </div>

        <h1 className="text-5xl font-bold text-white mb-6">
          Thank You!
        </h1>

        <p className="text-xl text-blue-100 max-w-lg mx-auto mb-4">
          Your enquiry has been sent successfully. Our team will get back to you shortly.
        </p>

        <p className="text-blue-200 text-sm">
          Redirecting to home in {countdown}s...
        </p>
      </div>
    </div>
  );
};

export default ThankYou;