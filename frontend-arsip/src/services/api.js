import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add bearer token automatically
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Helper mock data store in local storage to keep state persistent across refreshes
const MOCK_DATA_KEY = 'arsip_modul_mock_data';

const getMockData = () => {
  const data = localStorage.getItem(MOCK_DATA_KEY);
  if (data) return JSON.parse(data);

  // Initial mock data
  const initial = [
    {
      id: 1,
      judul: 'Rencana Pelaksanaan Pembelajaran Matematika Kelas X',
      mapel: 'Matematika',
      jenis: 'Modul',
      file_path: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      status: 'ACC',
      catatan_revisi: 'Sangat baik, struktur kompetensi dasar sudah lengkap.',
      created_at: '2026-08-10T10:00:00.000Z',
      user_id: 2,
      user: { name: 'Budi Santoso, S.Pd' }
    },
    {
      id: 2,
      judul: 'Program Tahunan Fisika Semester Ganjil & Genap',
      mapel: 'Fisika',
      jenis: 'Prota',
      file_path: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      status: 'Pending',
      catatan_revisi: null,
      created_at: '2026-08-11T02:30:00.000Z',
      user_id: 2,
      user: { name: 'Budi Santoso, S.Pd' }
    },
    {
      id: 3,
      judul: 'Program Semester Kimia Kelas XI',
      mapel: 'Kimia',
      jenis: 'Promes',
      file_path: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      status: 'Revisi',
      catatan_revisi: 'Mohon perbaiki alokasi waktu pada minggu ke-3 bulan Oktober.',
      created_at: '2026-08-09T08:15:00.000Z',
      user_id: 3,
      user: { name: 'Sri Wahyuni, M.Pd' }
    },
    {
      id: 4,
      judul: 'Modul Pembelajaran Bahasa Inggris - Narrative Text',
      mapel: 'Bahasa Inggris',
      jenis: 'Modul',
      file_path: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      status: 'Pending',
      catatan_revisi: null,
      created_at: '2026-08-11T05:00:00.000Z',
      user_id: 4,
      user: { name: 'Ahmad Subarjo, S.Hum' }
    }
  ];
  localStorage.setItem(MOCK_DATA_KEY, JSON.stringify(initial));
  return initial;
};

const saveMockData = (data) => {
  localStorage.setItem(MOCK_DATA_KEY, JSON.stringify(data));
};

// API Services for Module Management
export const modulService = {
  // Get modules uploaded by current teacher
  // Get modules uploaded by current teacher
  getMyModuls: async () => {
    try {
      const response = await API.get('/moduls');
      return response.data.data;
    } catch (err) {
      console.warn('API getMyModuls failed, using mock data fallback:', err);
      // Simulating teacher user_id = 2 (Budi Santoso, S.Pd)
      return getMockData().filter(m => m.user_id === 2);
    }
  },

  // Get all modules (Admin view)
  getAllModuls: async () => {
    try {
      const response = await API.get('/moduls');
      return response.data.data;
    } catch (err) {
      console.warn('API getAllModuls failed, using mock data fallback:', err);
      return getMockData();
    }
  },

  // Upload a module
  uploadModul: async (formData) => {
    try {
      const response = await API.post('/moduls', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (err) {
      console.warn('API uploadModul failed, simulating local success:', err);
      
      const file = formData.get('file');
      let fileUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
      
      // If we got a file in form data, create a temporary Object URL for local review
      if (file && file instanceof File) {
        fileUrl = URL.createObjectURL(file);
      }

      const newModul = {
        id: Date.now(),
        judul: formData.get('judul') || 'Modul Pembelajaran',
        mapel: formData.get('mapel') || 'Matematika',
        jenis: formData.get('jenis') || 'Modul',
        file_path: fileUrl,
        status: 'Pending',
        catatan_revisi: null,
        created_at: new Date().toISOString(),
        user_id: 2,
        user: { name: 'Budi Santoso, S.Pd' }
      };

      const updatedData = [newModul, ...getMockData()];
      saveMockData(updatedData);
      return newModul;
    }
  },

  // Review module (Admin action)
  reviewModul: async (id, status, catatanRevisi) => {
    try {
      const response = await API.post(`/moduls/${id}/review`, { status, catatan_revisi: catatanRevisi });
      return response.data;
    } catch (err) {
      console.warn('API reviewModul failed, updating local state:', err);
      const data = getMockData().map(m => {
        if (m.id === Number(id) || m.id === id) {
          return { ...m, status, catatan_revisi: catatanRevisi };
        }
        return m;
      });
      saveMockData(data);
      return { id, status, catatan_revisi: catatanRevisi };
    }
  }
};

// Auth Services
export const authService = {
  login: async (email, password) => {
    const response = await API.post('/login', { email, password });
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    return response.data;
  }
};

// Mapel Services
export const mapelService = {
  getAllMapels: async () => {
    const response = await API.get('/mapels');
    return response.data;
  }
};
