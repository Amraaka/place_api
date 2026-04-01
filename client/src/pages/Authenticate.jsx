import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../lib/api';
import { isValidUrl } from '../lib/utils';

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

function Authenticate() {
  const { isLoggedIn, authChecked, login } = useAuth();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    imageUrl: '',
  });
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!authChecked) {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-8">
        <p className="text-center text-sm text-slate-600">Нэвтрэлтийн төлөв шалгаж байна...</p>
      </div>
    );
  }

  if (isLoggedIn) return <Navigate to="/" replace />;

  const switchMode = (loginMode) => {
    setIsLogin(loginMode);
    setErrors({});
    setGlobalError('');
    setFormData({ name: '', email: '', password: '', imageUrl: '' });
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    setGlobalError('');
  };

  const validate = () => {
    const errs = {};
    if (!isLogin && !formData.name.trim()) {
      errs.name = 'Нэр оруулах шаардлагатай.';
    }
    if (!isValidEmail(formData.email)) {
      errs.email = 'Зөв имэйл хаяг оруулна уу.';
    }
    if (formData.password.length < 6) {
      errs.password = 'Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой.';
    }
    if (!isLogin && !formData.imageUrl.trim()) {
      errs.imageUrl = 'Профайл зургийн URL шаардлагатай.';
    } else if (!isLogin && !isValidUrl(formData.imageUrl)) {
      errs.imageUrl = 'Зөв URL оруулна уу (жишээ: https://example.com/avatar.jpg).';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setGlobalError('');

    try {
      const endpoint = isLogin ? '/api/users/login' : '/api/users/signup';
      const payload = isLogin
        ? {
            gmail: formData.email,
            password: formData.password,
          }
        : {
            name: formData.name.trim(),
            gmail: formData.email,
            password: formData.password,
            imageUrl: formData.imageUrl.trim(),
          };

      const data = await apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      login(data.user.id, data.user.name, data.user.imageUrl || '');
      navigate('/');
    } catch (err) {
      if (err?.status === 403 && err?.code === 'GUEST_ONLY') {
        navigate('/');
        return;
      }
      setGlobalError(err.message || 'Нэвтрэх үед алдаа гарлаа.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    'w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500';
  const inputErrorClass = 'border-red-500';
  return (
    <div className="mx-auto w-full max-w-md px-4 py-8">
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h1 className="mb-4 text-center text-xl font-semibold text-slate-800">
          {isLogin ? 'Нэвтрэх' : 'Бүртгүүлэх'}
        </h1>

        <div className="mb-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            className={`rounded border px-3 py-2 text-sm ${
              isLogin
                ? 'border-slate-700 bg-slate-700 text-white'
                : 'border-slate-300 bg-white text-slate-700'
            }`}
            onClick={() => switchMode(true)}
          >
            Нэвтрэх
          </button>
          <button
            type="button"
            className={`rounded border px-3 py-2 text-sm ${
              !isLogin
                ? 'border-slate-700 bg-slate-700 text-white'
                : 'border-slate-300 bg-white text-slate-700'
            }`}
            onClick={() => switchMode(false)}
          >
            Бүртгүүлэх
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
          {globalError && (
            <p className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
              {globalError}
            </p>
          )}

          {!isLogin && (
            <div className="flex flex-col gap-1">
              <label htmlFor="name" className="text-sm text-slate-700">Нэр</label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Бүтэн нэрээ оруулна уу"
                className={`${inputClass} ${
                  errors.name ? inputErrorClass : ''
                }`}
              />
              {errors.name && (
                <span className="text-xs text-red-600">{errors.name}</span>
              )}
            </div>
          )}

          {!isLogin && (
            <div className="flex flex-col gap-1">
              <label htmlFor="imageUrl" className="text-sm text-slate-700">Профайл зураг (URL)</label>
              <input
                id="imageUrl"
                name="imageUrl"
                type="url"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/avatar.jpg"
                className={`${inputClass} ${
                  errors.imageUrl ? inputErrorClass : ''
                }`}
              />
              {errors.imageUrl && (
                <span className="text-xs text-red-600">{errors.imageUrl}</span>
              )}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm text-slate-700">Имэйл</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="ner@example.com"
              className={`${inputClass} ${
                errors.email ? inputErrorClass : ''
              }`}
            />
            {errors.email && (
              <span className="text-xs text-red-600">{errors.email}</span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm text-slate-700">Нууц үг</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Хамгийн багадаа 6 тэмдэгт"
              className={`${inputClass} ${
                errors.password ? inputErrorClass : ''
              }`}
            />
            {errors.password && (
              <span className="text-xs text-red-600">{errors.password}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 w-full rounded bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            {isSubmitting
              ? 'Түр хүлээнэ үү...'
              : isLogin
                ? 'Нэвтрэх'
                : 'Бүртгэл үүсгэх'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Authenticate;
