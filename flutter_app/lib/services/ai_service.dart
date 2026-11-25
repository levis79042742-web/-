import 'dart:convert';
import 'package:http/http.dart' as http;

class AIService {
  final String baseUrl = const String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://your-trend7-server.run.app',
  );

  /// 呼叫安全後端代理進行爆紅原因與商機分析（不於前端儲存 AI 金鑰）
  Future<Map<String, dynamic>> analyzeTrend({
    required String title,
    required String platform,
    required String summary,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/ai/analyze'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'title': title,
        'platform': platform,
        'summary': summary,
      }),
    );

    if (response.statusCode != 200) {
      throw Exception('AI 分析失敗 (${response.statusCode})');
    }
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  /// 一鍵生成短影音腳本、爆款標題、社群貼文文案、Hashtag 與生圖/生影提示詞
  Future<Map<String, dynamic>> generateCreativeKit({
    required String topic,
    required String targetPlatform,
    required String tone,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/ai/create'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'topic': topic,
        'targetPlatform': targetPlatform,
        'tone': tone,
      }),
    );

    if (response.statusCode != 200) {
      throw Exception('AI 創作生成失敗 (${response.statusCode})');
    }
    return jsonDecode(response.body) as Map<String, dynamic>;
  }
}
