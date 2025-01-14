import { useState } from 'react';
import { auth } from '../config/firebase';
import { signInWithEmailAndPassword, signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth';
import '../styles/auth.css';

const Login = () => {
  const [method, setMethod] = useState('email'); // 'email' or 'phone'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: input, 2: verification (for phone)

  const setupRecaptcha = () => {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      'size': 'normal',
      'callback': () => {
        // reCAPTCHA solved
      }
    });
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Redirect will be handled by the auth state observer
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (step === 1) {
        setupRecaptcha();
        const formattedPhone = phone.startsWith('+84') ? phone : `+84${phone.substring(1)}`;
        const confirmation = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);
        setVerificationId(confirmation.verificationId);
        setStep(2);
      } else {
        // Verify code
        const credential = await auth.signInWithCredential(
          auth.PhoneAuthProvider.credential(verificationId, verificationCode)
        );
        // Redirect will be handled by the auth state observer
      }
    } catch (err) {
      setError(err.message);
      if (step === 1) {
        window.recaptchaVerifier?.reset();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Đăng nhập</h2>
        
        <div className="auth-method-selector">
          <button 
            className={`method-btn ${method === 'email' ? 'active' : ''}`}
            onClick={() => setMethod('email')}
          >
            Email
          </button>
          <button 
            className={`method-btn ${method === 'phone' ? 'active' : ''}`}
            onClick={() => setMethod('phone')}
          >
            Số điện thoại
          </button>
        </div>

        {method === 'email' ? (
          <form onSubmit={handleEmailLogin}>
            <div className="input-group">
              <label>Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email..."
                disabled={isLoading}
                required
              />
            </div>

            <div className="input-group">
              <label>Mật khẩu:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu..."
                disabled={isLoading}
                required
              />
            </div>

            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
            </button>
          </form>
        ) : (
          <form onSubmit={handlePhoneLogin}>
            {step === 1 ? (
              <>
                <div className="input-group">
                  <label>Số điện thoại:</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Nhập số điện thoại..."
                    disabled={isLoading}
                    required
                  />
                </div>
                <div id="recaptcha-container"></div>
              </>
            ) : (
              <div className="input-group">
                <label>Mã xác thực:</label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Nhập mã xác thực..."
                  disabled={isLoading}
                  required
                />
              </div>
            )}

            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Đang xử lý...' : (step === 1 ? 'Gửi mã' : 'Xác thực')}
            </button>
          </form>
        )}

        {error && <div className="error-message">{error}</div>}
        
        <div className="auth-links">
          <a href="/register">Chưa có tài khoản? Đăng ký ngay</a>
          {method === 'email' && <a href="/forgot-password">Quên mật khẩu?</a>}
        </div>
      </div>
    </div>
  );
};

export default Login;
