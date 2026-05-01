# travel_service/chat/views.py

import openai
from django.http import JsonResponse
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

# Cấu hình API Key cho OpenAI
openai.api_key = settings.OPENAI_API_KEY  # Đảm bảo bạn đã cấu hình API Key trong settings.py

@csrf_exempt
@require_POST
def chat_with_ai(request):
    try:
        data = request.POST
        user_message = data.get('message', '').strip()  # Lấy câu hỏi từ người dùng

        if not user_message:
            return JsonResponse({'error': 'No message provided'}, status=400)

        # Gửi yêu cầu tới OpenAI API để lấy câu trả lời
        response = openai.Completion.create(
            engine="text-davinci-003",  # Sử dụng engine của OpenAI
            prompt=user_message,
            max_tokens=150  # Điều chỉnh số lượng từ trong câu trả lời
        )

        ai_response = response.choices[0].text.strip()  # Lấy câu trả lời từ AI

        return JsonResponse({'response': ai_response})

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)