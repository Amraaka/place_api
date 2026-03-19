import { useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePlaces } from '../context/PlacesContext';

const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

function UpdatePlace() {
  const { pid } = useParams();
  const { isLoggedIn } = useAuth();
  const { places, updatePlace } = usePlaces();
  const navigate = useNavigate();

  const place = places.find((p) => p.id === pid);

  const [formData, setFormData] = useState({
    title:       place?.title       || '',
    description: place?.description || '',
    imageUrl:    place?.imageUrl    || '',
    address:     place?.address     || '',
  });
  const [errors, setErrors] = useState({});

  if (!isLoggedIn) return <Navigate to="/authenticate" replace />;

  if (!place) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
        <p className="mt-10 text-center text-base italic text-slate-500">Газар олдсонгүй.</p>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
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
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    updatePlace(pid, formData);
    navigate(`/${place.creator}/places`);
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
            className="rounded bg-slate-800 px-3 py-2 text-sm text-white hover:bg-slate-700"
          >
            Хадгалах
          </button>
        </div>
      </form>
    </div>
  );
}

export default UpdatePlace;
