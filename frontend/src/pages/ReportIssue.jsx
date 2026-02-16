import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AlertCircle, MapPin, CheckCircle, Loader } from 'lucide-react';

const ReportIssue = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'POTHOLE',
    latitude: '',
    longitude: '',
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [geoloading, setGeoLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  const getErrorMessage = (err) => {
    const data = err?.response?.data;
    if (!data) return err.message || 'Failed to submit issue. Please try again.';
    if (typeof data === 'string') return data;
    if (data.detail) return data.detail;

    const firstFieldError = Object.values(data).find((value) => {
      if (Array.isArray(value) && value.length > 0) return true;
      return typeof value === 'string';
    });

    if (Array.isArray(firstFieldError)) return firstFieldError[0];
    if (typeof firstFieldError === 'string') return firstFieldError;
    return 'Failed to submit issue. Please check your inputs.';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, image: file }));
    setPreviewUrl(file ? URL.createObjectURL(file) : '');
    setError(null);
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      setGeoLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6),
          }));
          setGeoLoading(false);
        },
        () => {
          setError('Unable to get location. Please enable location services.');
          setGeoLoading(false);
        }
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }

    if (!formData.latitude || !formData.longitude) {
      setError('Location is required. Please click "Get Current Location".');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('description', formData.description);
      payload.append('category', formData.category);
      payload.append('latitude', String(Number(formData.latitude)));
      payload.append('longitude', String(Number(formData.longitude)));
      if (formData.image) {
        payload.append('image', formData.image);
      }

      const response = await api.post('/issues/', payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Issue created:', response.data);

      setSuccess(true);
      setFormData({
        title: '',
        description: '',
        category: 'POTHOLE',
        latitude: '',
        longitude: '',
        image: null,
      });
      setPreviewUrl('');

      // Wait 2 seconds then redirect
      setTimeout(() => {
        navigate('/issues');
      }, 2000);
    } catch (err) {
      console.error('Error submitting issue:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex gap-3">
            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex gap-3">
            <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Success!</p>
              <p className="text-sm">Issue reported successfully. Redirecting...</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              disabled={loading || success}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="e.g., Large pothole on Main Street"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={loading || success}
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Provide detailed description of the issue..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              disabled={loading || success}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="POTHOLE">Pothole</option>
              <option value="STREETLIGHT">Streetlight</option>
              <option value="GARBAGE">Garbage</option>
              <option value="WATER">Water Leakage</option>
              <option value="TRAFFIC">Traffic Signal</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Issue Image (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={loading || success}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm file:mr-4 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
            />
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Issue preview"
                className="mt-3 h-28 w-40 object-cover rounded-lg border border-gray-200"
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Latitude <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm focus:ring-2 focus:ring-blue-500"
                placeholder="Auto-filled"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Longitude <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm focus:ring-2 focus:ring-blue-500"
                placeholder="Auto-filled"
                readOnly
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleGetLocation}
            disabled={loading || success || geoloading}
            className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {geoloading ? (
              <>
                <Loader size={18} className="animate-spin" />
                Getting Location...
              </>
            ) : (
              <>
                <MapPin size={18} />
                Get Current Location
              </>
            )}
          </button>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader size={18} className="animate-spin" />
                Submitting...
              </>
            ) : (
              'Report Issue'
            )}
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700">
            <span className="font-semibold">Tip:</span> Click "Get Current Location" to automatically fill in your coordinates.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReportIssue;
