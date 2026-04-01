import { useEffect, useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePlaces } from '../context/PlacesContext';
import { isValidUrl } from '../lib/utils';

function UpdatePlace() {
  const { pid } = useParams();
  const { isLoggedIn, authChecked, userId } = useAuth();
  const { fetchPlaceById, updatePlace } = usePlaces();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    address: '',
    lng: '',
    lat: '',
  });
  const [errors, setErrors] = useState({});
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadPlace = async () => {
      setLoading(true);
      setGlobalError('');

      try {
        const fetched = await fetchPlaceById(pid);
        setPlace(fetched);
        setFormData({
          title: fetched.title || '',
          description: fetched.description || '',
          imageUrl: fetched.imageUrl || '',
          address: fetched.address || '',
          lng: String(fetched.location?.lng ?? ''),
          lat: String(fetched.location?.lat ?? ''),
        });
      } catch (err) {
        setGlobalError(err.message || 'Газрын мэдээлэл ачаалж чадсангүй.');
      } finally {
        setLoading(false);
      }
    };

    loadPlace();
  }, [pid, fetchPlaceById]);

  if (!authChecked) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
        <p className="mt-10 text-center text-base italic text-slate-500">Нэвтрэлтийн төлөв шалгаж байна...</p>
      </div>
    );
  }

  if (!isLoggedIn) return <Navigate to="/authenticate" replace />;

  if (!place) {
    if (loading) {
      return (
        <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
          <p className="mt-10 text-center text-base italic text-slate-500">Ачаалж байна...</p>
        </div>
      );
    }

    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
        {globalError && (
          <p className="mx-auto mb-4 max-w-md rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
            {globalError}
          </p>
        )}
        <p className="mt-10 text-center text-base italic text-slate-500">Газар олдсонгүй.</p>
      </div>
    );
  }

  const canEdit = place.creator === userId;
  if (!canEdit) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
        <p className="mt-10 text-center text-base italic text-slate-500">
          Та зөвхөн өөрийнхөө газрыг засах боломжтой.
        </p>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    setGlobalError('');
  };

  const validate = () => {
    const errs = {};
    if (!formData.title.trim())       errs.title = 'Гарчиг оруулах шаардлагатай.';
    if (!formData.description.trim()) errs.description = 'Тайлбар оруулах шаардлагатай.';
    if (!formData.imageUrl.trim()) {
      errs.imageUrl = 'Зургийн холбоос оруулах шаардлагатай.';
    } else if (!isValidUrl(formData.imageUrl)) {
      errs.imageUrl = 'Зөв холбоос оруулна уу (жишээ: https://example.com/photo.jpg).';
    }
    if (!formData.address.trim())     errs.address = 'Хаяг оруулах шаардлагатай.';
    if (formData.lng === '' || Number.isNaN(Number(formData.lng))) {
      errs.lng = 'Уртраг зөв тоо байх ёстой.';
    }
    if (formData.lat === '' || Number.isNaN(Number(formData.lat))) {
      errs.lat = 'Өргөрөг зөв тоо байх ёстой.';
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
      await updatePlace(pid, {
        title: formData.title,
        description: formData.description,
        imageUrl: formData.imageUrl,
        address: formData.address,
        location: {
          lng: Number(formData.lng),
          lat: Number(formData.lat),
        },
      });
      navigate(`/${place.creator}/places`);
    } catch (err) {
      setGlobalError(err.message || 'Засвар хадгалах үед алдаа гарлаа.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    'w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500';
  const inputErrorClass = 'border-red-500';

  return (
    <div className="mx-auto w-full max-w-md px-4 py-8">
      <h1 className="mb-4 text-xl font-semibold text-slate-800">
        Газрын мэдээлэл засах
      </h1>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-5"
        noValidate
      >
        {globalError && (
          <p className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
            {globalError}
          </p>
        )}

        <div className="flex flex-col gap-1">
          <label htmlFor="title" className="text-sm text-slate-700">Гарчиг</label>
          <input
            id="title" name="title" type="text"
            value={formData.title} onChange={handleChange}
            className={`${inputClass} ${
              errors.title ? inputErrorClass : ''
            }`}
          />
          {errors.title && <span className="text-xs text-red-600">{errors.title}</span>}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="description" className="text-sm text-slate-700">Тайлбар</label>
          <textarea
            id="description" name="description"
            value={formData.description} onChange={handleChange}
            rows={4}
            className={`${inputClass} ${
              errors.description ? inputErrorClass : ''
            }`}
          />
          {errors.description && (
            <span className="text-xs text-red-600">{errors.description}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="imageUrl" className="text-sm text-slate-700">Зургийн холбоос</label>
          <input
            id="imageUrl" name="imageUrl" type="url"
            value={formData.imageUrl} onChange={handleChange}
            className={`${inputClass} ${
              errors.imageUrl ? inputErrorClass : ''
            }`}
          />
          {errors.imageUrl && (
            <span className="text-xs text-red-600">{errors.imageUrl}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="address" className="text-sm text-slate-700">Хаяг</label>
          <input
            id="address" name="address" type="text"
            value={formData.address} onChange={handleChange}
            className={`${inputClass} ${
              errors.address ? inputErrorClass : ''
            }`}
          />
          {errors.address && (
            <span className="text-xs text-red-600">{errors.address}</span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="lng" className="text-sm text-slate-700">Longitude</label>
            <input
              id="lng" name="lng" type="number" step="any"
              value={formData.lng} onChange={handleChange}
              className={`${inputClass} ${
                errors.lng ? inputErrorClass : ''
              }`}
            />
            {errors.lng && (
              <span className="text-xs text-red-600">{errors.lng}</span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="lat" className="text-sm text-slate-700">Latitude</label>
            <input
              id="lat" name="lat" type="number" step="any"
              value={formData.lat} onChange={handleChange}
              className={`${inputClass} ${
                errors.lat ? inputErrorClass : ''
              }`}
            />
            {errors.lat && (
              <span className="text-xs text-red-600">{errors.lat}</span>
            )}
          </div>
        </div>

        <div className="mt-2 flex justify-end gap-2">
          <button
            type="button"
            className="rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            onClick={() => navigate(-1)}
          >
            Болих
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded bg-slate-800 px-3 py-2 text-sm text-white hover:bg-slate-700"
          >
            {isSubmitting ? 'Түр хүлээнэ үү...' : 'Хадгалах'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default UpdatePlace;
