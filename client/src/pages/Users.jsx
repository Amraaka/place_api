import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../lib/api';

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await apiRequest('/api/users');
        setUsers(data.users || []);
      } catch (err) {
        setError(err.message || 'Хэрэглэгчдийн мэдээлэл ачаалж чадсангүй.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <h1 className="mb-4 text-xl font-semibold text-slate-800">
        Бүх хэрэглэгч
      </h1>

      {loading && <p className="text-sm text-slate-600">Ачаалж байна...</p>}
      {error && (
        <p className="mb-4 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {!loading && !error && users.length === 0 ? (
        <p className="mt-8 text-sm text-slate-600">
          Одоогоор хэн ч газар нийтлээгүй байна.{' '}
          <Link to="/authenticate" className="underline">
            Бүртгүүлэх
          </Link>{' '}
        </p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {users.map((user) => (
            <li
              key={user.id}
              className="flex items-center gap-3 rounded border border-slate-200 bg-white p-4"
            >
              {user.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={user.name}
                  className="h-10 w-10 shrink-0 rounded-full border border-slate-300 object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-slate-100 text-sm font-semibold text-slate-700">
                  {user.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}

              <div className="flex-1">
                <h3 className="text-base font-medium text-slate-800">
                  {user.name}
                </h3>
              </div>

              <Link
                to={`/${user.id}/places`}
                className="rounded bg-slate-800 px-3 py-1.5 text-sm text-white no-underline hover:bg-slate-700"
              >
                Газруудыг харах
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Users;
