import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isValidUrl } from '../lib/utils';

const EMPTY = { title: '', description: '', imageUrl: '', address: '', lng: '', lat: '' };

const inputClass = 'w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500';

function FormField({ id, label, error, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm text-slate-700">{label}</label>
      {children}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}

function validate(formData) {
  const errs = {};
  if (!formData.title.trim())       errs.title       = 'Гарчиг оруулах шаардлагатай.';
  if (!formData.description.trim()) errs.description  = 'Тайлбар оруулах шаардлагатай.';
  if (!formData.address.trim())     errs.address      = 'Хаяг оруулах шаардлагатай.';
  if (!formData.imageUrl.trim()) {
    errs.imageUrl = 'Зургийн холбоос оруулах шаардлагатай.';
  } else if (!isValidUrl(formData.imageUrl)) {
    errs.imageUrl = 'Зөв холбоос оруулна уу (жишээ: https://example.com/photo.jpg).';
  }
  if (!formData.lng || Number.isNaN(Number(formData.lng))) errs.lng = 'Уртраг зөв тоо байх ёстой.';
  if (!formData.lat || Number.isNaN(Number(formData.lat))) errs.lat = 'Өргөрөг зөв тоо байх ёстой.';
  return errs;
}

/**
 * Reusable place form used by NewPlace and UpdatePlace.
 * `onSubmit` receives a { title, description, imageUrl, address, location } object.
 * Throw from onSubmit to display a global error inside the form.
 */
function PlaceForm({ initialValues = {}, onSubmit, submitLabel = 'Хадгалах' }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ ...EMPTY, ...initialValues });
  const [errors, setErrors]     = useState({});
  const [globalError, setGlobalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev)    => ({ ...prev, [name]: '' }));
    setGlobalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(formData);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setIsSubmitting(true);
    setGlobalError('');
    try {
      await onSubmit({
        title:       formData.title,
        description: formData.description,
        imageUrl:    formData.imageUrl,
        address:     formData.address,
        location: {
          lng: Number(formData.lng),
          lat: Number(formData.lat),
        },
      });
    } catch (err) {
      setGlobalError(err.message || 'Алдаа гарлаа.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const cls = (field) => `${inputClass} ${errors[field] ? 'border-red-500' : ''}`;

  return (
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

      <FormField id="title" label="Гарчиг" error={errors.title}>
        <input id="title" name="title" type="text"
          value={formData.title} onChange={handleChange}
          placeholder="Жишээ: Үндэсний цэцэрлэгт хүрээлэн"
          className={cls('title')} />
      </FormField>

      <FormField id="description" label="Тайлбар" error={errors.description}>
        <textarea id="description" name="description" rows={4}
          value={formData.description} onChange={handleChange}
          placeholder="Энэ газрын онцлог юу вэ?"
          className={cls('description')} />
      </FormField>

      <FormField id="imageUrl" label="Зургийн холбоос" error={errors.imageUrl}>
        <input id="imageUrl" name="imageUrl" type="url"
          value={formData.imageUrl} onChange={handleChange}
          placeholder="https://example.com/photo.jpg"
          className={cls('imageUrl')} />
      </FormField>

      <FormField id="address" label="Хаяг" error={errors.address}>
        <input id="address" name="address" type="text"
          value={formData.address} onChange={handleChange}
          placeholder="Жишээ: СБД, 1-р хороо"
          className={cls('address')} />
      </FormField>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormField id="lng" label="Longitude" error={errors.lng}>
          <input id="lng" name="lng" type="number" step="any"
            value={formData.lng} onChange={handleChange}
            placeholder="106.9057"
            className={cls('lng')} />
        </FormField>

        <FormField id="lat" label="Latitude" error={errors.lat}>
          <input id="lat" name="lat" type="number" step="any"
            value={formData.lat} onChange={handleChange}
            placeholder="47.9185"
            className={cls('lat')} />
        </FormField>
      </div>

      <div className="mt-2 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          Болих
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded bg-slate-800 px-3 py-2 text-sm text-white hover:bg-slate-700"
        >
          {isSubmitting ? 'Түр хүлээнэ үү...' : submitLabel}
        </button>
      </div>
    </form>
  );
}

export default PlaceForm;
