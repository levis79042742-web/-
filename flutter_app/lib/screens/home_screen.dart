import 'package:flutter/material.dart';
import '../models/trend_item.dart';
import '../services/trend_repository.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final TrendRepository _repo = TrendRepository();
  List<TrendItem> _trends = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _loading = true);
    final items = await _repo.fetchTrends(
      platform: 'all',
      timeRange: '7d',
      region: 'TW',
      category: '全部',
    );
    if (!mounted) return;
    setState(() {
      _trends = items;
      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return RefreshIndicator(
      onRefresh: _loadData,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(
            '這週紅什麼 Trend7',
            style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 4),
          Text(
            '六大社群，一手掌握每週爆紅趨勢',
            style: theme.textTheme.bodyMedium?.copyWith(color: theme.colorScheme.onSurfaceVariant),
          ),
          const SizedBox(height: 16),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('本週台灣趨勢焦點', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  const Text('整合 IG、FB、YouTube、TikTok、小紅書、Threads，未串接平台明確顯示示範資料或暫無資料。'),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          if (_loading)
            const Center(child: Padding(padding: EdgeInsets.all(32), child: CircularProgressIndicator()))
          else if (_trends.isEmpty)
            const Card(
              child: Padding(
                padding: EdgeInsets.all(24),
                child: Text('目前尚無快取資料，請下拉重新整理或檢查後端連線網址。'),
              ),
            )
          else
            ..._trends.take(6).map((item) => Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ListTile(
                    leading: CircleAvatar(child: Text('${item.rank}')),
                    title: Text(item.title, maxLines: 2, overflow: TextOverflow.ellipsis),
                    subtitle: Text('${item.platform.toUpperCase()} · ${item.creatorName} · 觀看 ${TrendItem.formatMetric(item.views)}'),
                    trailing: Text('${item.viralIndex}', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                  ),
                )),
        ],
      ),
    );
  }
}
