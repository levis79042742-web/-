import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/trend_item.dart';

/// 可替換的資料來源介面，支援後續接上 IG / FB / YouTube / TikTok / 小紅書 / Threads 官方 API
abstract class TrendDataAdapter {
  Future<List<TrendItem>> fetchTrends({
    required String platform,
    required String timeRange,
    required String region,
    required String category,
    int page = 1,
    int pageSize = 20,
  });
}

class TrendRepository implements TrendDataAdapter {
  static const String _cacheKey = 'trend7_cached_trends_v1';
  static const String _bookmarksKey = 'trend7_offline_bookmarks_v1';

  final String baseUrl = const String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://your-trend7-server.run.app',
  );

  @override
  Future<List<TrendItem>> fetchTrends({
    required String platform,
    required String timeRange,
    required String region,
    required String category,
    int page = 1,
    int pageSize = 20,
  }) async {
    final uri = Uri.parse('$baseUrl/api/trends').replace(queryParameters: {
      'platform': platform,
      'timeRange': timeRange,
      'region': region,
      'category': category,
      'page': page.toString(),
      'pageSize': pageSize.toString(),
    });

    try {
      final response = await http.get(uri).timeout(const Duration(seconds: 12));
      if (response.statusCode == 200) {
        final decoded = jsonDecode(response.body) as Map<String, dynamic>;
        final items = (decoded['items'] as List<dynamic>)
            .map((e) => TrendItem.fromJson(e as Map<String, dynamic>))
            .toList();
        await _saveCache(items);
        return items;
      }
      throw Exception('伺服器回應錯誤: ${response.statusCode}');
    } catch (_) {
      return await loadCachedTrends();
    }
  }

  Future<void> _saveCache(List<TrendItem> items) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(
      _cacheKey,
      jsonEncode(items.map((e) => e.toJson()).toList()),
    );
  }

  Future<List<TrendItem>> loadCachedTrends() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_cacheKey);
    if (raw == null || raw.isEmpty) return [];
    final list = jsonDecode(raw) as List<dynamic>;
    return list.map((e) => TrendItem.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<List<TrendItem>> loadBookmarks() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_bookmarksKey);
    if (raw == null || raw.isEmpty) return [];
    final list = jsonDecode(raw) as List<dynamic>;
    return list.map((e) => TrendItem.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<void> toggleBookmark(TrendItem item) async {
    final current = await loadBookmarks();
    final exists = current.any((e) => e.id == item.id);
    final updated = exists
        ? current.where((e) => e.id != item.id).toList()
        : [item, ...current];
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(
      _bookmarksKey,
      jsonEncode(updated.map((e) => e.toJson()).toList()),
    );
  }
}
