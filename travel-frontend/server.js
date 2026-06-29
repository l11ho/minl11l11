const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const DJANGO_API_BASE = 'http://127.0.0.1:8000';

const DATA_ENDPOINTS = {
  flights: `${DJANGO_API_BASE}/api/flights/`,
  hotels: `${DJANGO_API_BASE}/api/hotels/`,
  tours: `${DJANGO_API_BASE}/api/tours/`,
};

const SYSTEM_PROMPT = `
Bạn là trợ lý AI của website du lịch BestPrice.

Nhiệm vụ:
- Trả lời câu hỏi của khách dựa trên DỮ LIỆU THẬT được cung cấp từ hệ thống.
- Luôn trả lời đúng ngôn ngữ của khách.
- Nếu khách hỏi tiếng Việt, trả lời tiếng Việt.
- Nếu khách hỏi tiếng Anh, trả lời tiếng Anh.
- Nếu khách hỏi tiếng Nga, trả lời tiếng Nga.

Quy tắc bắt buộc:
- Không bịa giá.
- Không bịa khuyến mãi.
- Không bịa lịch bay.
- Không bịa khách sạn, tour hoặc dịch vụ không có trong dữ liệu.
- Nếu dữ liệu không có thông tin khách hỏi, hãy nói rõ rằng hiện tại hệ thống chưa có thông tin đó.
- Nếu khách hỏi giá, hãy trả lời theo giá có trong dữ liệu thật.
- Nếu khách hỏi đặt vé, thanh toán, email vé điện tử, hãy hướng dẫn ngắn gọn.
- Nếu khách hỏi trạng thái đơn hàng, hãy yêu cầu cung cấp mã đơn hàng hoặc email đặt vé.
- Trả lời ngắn gọn, rõ ràng, hữu ích.
`;

async function fetchJson(url) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.warn(`Không lấy được dữ liệu từ ${url}. Status: ${response.status}`);
      return [];
    }

    const data = await response.json();

    if (Array.isArray(data)) return data;
    if (Array.isArray(data.results)) return data.results;
    if (Array.isArray(data.data)) return data.data;

    return [];
  } catch (error) {
    console.warn(`Lỗi khi gọi API ${url}:`, error.message);
    return [];
  }
}

function formatFlight(flight) {
  return {
    id: flight.id || '',
    flight_number: flight.flight_number || flight.flightNumber || flight.code || '',
    airline: flight.airline || flight.airline_name || flight.name || '',
    departure: flight.departure || flight.from || flight.origin || '',
    arrival: flight.arrival || flight.to || flight.destination || '',
    departure_date: flight.departure_date || flight.date || '',
    flight_time: flight.flight_time || flight.time || '',
    price: flight.price || flight.amount || '',
    currency: flight.currency || '',
  };
}

function formatHotel(hotel) {
  return {
    id: hotel.id || '',
    name: hotel.name || hotel.hotel_name || '',
    location: hotel.location || hotel.city || hotel.address || '',
    price: hotel.price || hotel.amount || '',
    rating: hotel.rating || '',
    description: hotel.description || '',
  };
}

function formatTour(tour) {
  return {
    id: tour.id || '',
    name: tour.name || tour.tour_name || tour.title || '',
    destination: tour.destination || tour.location || '',
    duration: tour.duration || '',
    price: tour.price || tour.amount || '',
    description: tour.description || '',
  };
}

function compactList(items, formatter, limit = 30) {
  return items.slice(0, limit).map(formatter);
}

async function getRealWebsiteData() {
  const [flightsRaw, hotelsRaw, toursRaw] = await Promise.all([
    fetchJson(DATA_ENDPOINTS.flights),
    fetchJson(DATA_ENDPOINTS.hotels),
    fetchJson(DATA_ENDPOINTS.tours),
  ]);

  return {
    flights: compactList(flightsRaw, formatFlight, 50),
    hotels: compactList(hotelsRaw, formatHotel, 30),
    tours: compactList(toursRaw, formatTour, 30),
  };
}

function buildDataContext(realData) {
  return `
DỮ LIỆU THẬT TỪ HỆ THỐNG BESTPRICE:

1. Flights:
${JSON.stringify(realData.flights, null, 2)}

2. Hotels:
${JSON.stringify(realData.hotels, null, 2)}

3. Tours:
${JSON.stringify(realData.tours, null, 2)}

Hướng dẫn sử dụng dữ liệu:
- Chỉ dùng dữ liệu ở trên để trả lời.
- Nếu không tìm thấy chuyến bay / khách sạn / tour phù hợp, hãy nói rằng hiện tại hệ thống chưa có thông tin phù hợp.
- Không tự tạo thêm giá, lịch bay, tên khách sạn, tên tour hoặc khuyến mãi.
- Nếu giá bị thiếu, hãy nói rằng giá hiện chưa được cập nhật trong hệ thống.
`;
}

app.get('/', (req, res) => {
  res.send('BestPrice AI chat server is running');
});

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Thiếu messages' });
    }

    const trimmedMessages = messages.slice(-8);

    const realData = await getRealWebsiteData();
    const dataContext = buildDataContext(realData);

    const ollamaMessages = [
      {
        role: 'system',
        content: `${SYSTEM_PROMPT}\n\n${dataContext}`,
      },
      ...trimmedMessages,
    ];

    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen3:1.7b',
        messages: ollamaMessages,
        stream: false,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error || 'Lỗi khi gọi Ollama',
      });
    }

    return res.json({
      reply: data.message?.content || 'Xin lỗi, tôi chưa thể trả lời lúc này.',
    });
  } catch (error) {
    console.error('Lỗi server Ollama:', error);
    return res.status(500).json({
      error: error.message || 'Không kết nối được tới Ollama',
    });
  }
});

app.listen(5000, () => {
  console.log('BestPrice AI chat server is running at http://localhost:5000');
});