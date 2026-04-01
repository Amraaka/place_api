import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navigation() {
  const { isLoggedIn, userName, userId, userAvatarUrl, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-3">
        <Link
          to="/"
          className="text-lg font-semibold text-slate-800 no-underline"
        >
        Газар
        </Link>

        <nav className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <Link
                to={`/${userId}/places`}
                className="text-sm text-slate-700 no-underline hover:underline"
              >
                Миний газрууд
              </Link>
              <Link
                to="/places/new"
                className="text-sm text-slate-700 no-underline hover:underline"
              >
                Газар нэмэх
              </Link>
              <span className="hidden text-sm text-slate-500 sm:inline">
                {userName}
              </span>
              {userAvatarUrl ? (
                <img
                  src={userAvatarUrl}
                  alt={userName || 'user'}
                  className="h-8 w-8 rounded-full border border-slate-300 object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=80&q=60';
                  }}
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 bg-slate-100 text-xs font-semibold text-slate-700">
                  {userName?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}
              <button
                onClick={handleLogout}
                className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                Гарах
              </button>
            </>
          ) : (
            <>
              <Link
                to="/"
                className="text-sm text-slate-700 no-underline hover:underline"
              >
                Бүх хэрэглэгч
              </Link>
              <Link
                to="/authenticate"
                className="rounded bg-slate-800 px-3 py-1.5 text-sm text-white no-underline hover:bg-slate-700"
              >
                Нэвтрэх / Бүртгүүлэх
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navigation;
