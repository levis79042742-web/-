import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/trend_item.dart';
import '../services/trend_repository.dart';

class RankingScreen extends StatefulWidget {
  const RankingScreen({super.key});

  @override
  State<RankingScreen> createState() => _RankingScreenState();
}

class _RankingScreenState extends State<RankingScreen> {
  final TrendRepository _repo = TrendRepository();
  String _platform = 'all';
  String _timeRange = '7d';
  List<TrendItem> _items = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    final res = await _repo.fetchTrends(
      platform: _platform,
      timeRange: _timeRange,
      region: 'TW',
      category: '全部',
    );
    if (!mounted) return;
    setState(() {
      _items = res;
      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
          child: Row(
            children: [
              Expanded(
                child: DropdownButtonFormField<String>(
                  value: _platform,
                  decoration: const InputDecoration(labelText: '平台', border: OutlineInputBorder()),
                  items: const [
                    DropdownMenuItem(value: 'all', child: Text('跨平台綜合')),
                    DropdownMenuItem(value: 'instagram', child: Text('Instagram')),
                    DropdownMenuItem(value: 'facebook', child: Text('Facebook')),
                    DropdownMenuItem(value: 'youtube', child: Text('YouTube')),
                    DropdownMenuItem(value: 'tiktok', child: Text('TikTok')),
                    DropdownMenuItem(value: 'xiaohongshu', child: Text('小紅書')),
                    DropdownMenuItem(value: 'threads', child: Text('Threads')),
                  ],
                  onChanged: (v) {
                    if (v != null) {
                      _platform = v;
                      _load();
                    }
                  },
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: DropdownButtonFormField<String>(
                  value: _timeRange,
                  decoration: const InputDecoration(labelText: '時間範圍', border: OutlineInputBorder()),
                  items: const [
                    DropdownMenuItem(value: '24h', child: Text('最近 24 小時')),
                    DropdownMenuItem(value: '3d', child: Text('最近 3 天')),
                    DropdownMenuItem(value: '7d', child: Text('最近 7 天')),
                    DropdownMenuItem(value: '30d', child: Text('最近 30 天')),
                  ],
                  onChanged: (v) {
                    if (v != null) {
                      _timeRange = v;
                      _load();
                    }
                  },
                ),
              ),
            ],
          ),
        ),
        Expanded(
          child: _loading
              ? const Center(child: CircularProgressIndicator())
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _items.length,
                  itemBuilder: (context, index) {
                    final item = _items[index];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      child: Padding(
                        padding: const EdgeInsets.all(14),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('#${item.rank} · ${item.platform.toUpperCase()} · ${item.sourceLabel}',
                                style: Theme.of(context).textTheme.labelMedium),
                            const SizedBox(height: 6),
                            Text(item.title, style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                            const SizedBox(height: 8),
                            Text('觀看: ${TrendItem.formatMetric(item.views)} · 按讚: ${TrendItem.formatMetric(item.likes)} · 留言: ${TrendItem.formatMetric(item.comments)} · 分享: ${TrendItem.formatMetric(item.shares)}'),
                            const SizedBox(height: 8),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text('AI 爆紅指數 ${item.viralIndex}/100'),
                                Row(
                                  children: [
                                    IconButton(
                                      icon: const Icon(Icons.bookmark_border),
                                      onPressed: () => _repo.toggleBookmark(item),
                                    ),
                                    TextButton(
                                      onPressed: () async {
                                        final uri = Uri.tryParse(item.originalUrl);
                                        if (uri != null) {
                                          await launchUrl(uri, mode: LaunchMode.externalApplication);
                                        }
                                      },
                                      child: const Text('原連結'),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
        ),
      ],
    );
  }
}
