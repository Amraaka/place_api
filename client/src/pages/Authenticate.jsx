import { useEffect, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import sampleUsers from '../../db/users.json';

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const ensureUsersSeeded = () => {
  const storedUsers = localStorage.getItem('users');

  if (!storedUsers) {
    localStorage.setItem('users', JSON.stringify(sampleUsers));
    return;
  }

  try {
    const parsed = JSON.parse(storedUsers);
    if (!Array.isArray(parsed)) {
      throw new Error('Invalid users payload');
    }

    const existingIds = new Set(parsed.map((user) => user.id));
    const existingEmails = new Set(parsed.map((user) => user.email));
    const missingSeedUsers = sampleUsers.filter(
      (user) => !existingIds.has(user.id) && !existingEmails.has(user.email)
    );

    if (missingSeedUsers.length > 0) {
      localStorage.setItem('users', JSON.stringify([...parsed, ...missingSeedUsers]));
    }
  } catch {
    localStorage.setItem('users', JSON.stringify(sampleUsers));
  }
};

const readUsers = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem('users') || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

function Authenticate() {
  const { isLoggedIn, login } = useAuth();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');

  useEffect(() => {
    ensureUsersSeeded();
  }, []);

  if (isLoggedIn) return <Navigate to="/" replace />;

  const switchMode = (loginMode) => {
    setIsLogin(loginMode);
    setErrors({});
    setGlobalError('');
    setFormData({ name: '', email: '', password: '' });
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
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const users = readUsers();

    if (isLogin) {
      const existingUser = users.find(
        (u) => u.email === formData.email && u.password === formData.password
      );
      if (!existingUser) {
        setGlobalError('Имэйл эсвэл нууц үг буруу байна. Дахин оролдоно уу.');
        return;
      }
      login(existingUser.id, existingUser.name);
    } else {
      if (users.find((u) => u.email === formData.email)) {
        setGlobalError(
          'Энэ имэйлээр бүртгэл аль хэдийн байна. Нэвтэрнэ үү.'
        );
        return;
      }
      const newUser = {
        id: `user_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        name: formData.name.trim(),
        email: formData.email,
        password: formData.password,
      };
      localStorage.setItem('users', JSON.stringify([...users, newUser]));
      login(newUser.id, newUser.name);
    }

    navigate('/');
  };

  const inputClass =
    'w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500';
  const inputErrorClass = 'border-red-500';
  const sampleHint = sampleUsers
    .map((user) => `${user.email} / ${user.password}`)
    .join(' | ');

  return (
    <div className="mx-auto w-full max-w-md px-4 py-8">
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h1 className="mb-4 text-center text-xl font-semibold text-slate-800">
          {isLogin ? 'Нэвтрэх' : 'Бүртгүүлэх'}
        </h1>
        <p className="mb-4 text-center text-xs text-slate-500">
          Жишээ нэвтрэх мэдээлэл: {sampleHint}
        </p>

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
            className="mt-2 w-full rounded bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            {isLogin ? 'Нэвтрэх' : 'Бүртгэл үүсгэх'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Authenticate;
