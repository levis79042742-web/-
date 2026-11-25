import 'package:flutter/material.dart';
import '../models/trend_item.dart';
import '../services/trend_repository.dart';

class BookmarksScreen extends StatefulWidget {
  const BookmarksScreen({super.key});

  @override
  State<BookmarksScreen> createState() => _BookmarksScreenState();
}

class _BookmarksScreenState extends State<BookmarksScreen> {
  final TrendRepository _repo = TrendRepository();
  List<TrendItem> _saved = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final list = await _repo.loadBookmarks();
    if (!mounted) return;
    setState(() => _saved = list);
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text('離線收藏中心', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),
        if (_saved.isEmpty)
          const Card(
            child: Padding(
              padding: EdgeInsets.all(24),
              child: Text('尚未收藏任何趨勢內容，在排行榜點擊書籤圖示即可離線儲存。'),
            ),
          )
        else
          ..._saved.map((item) => Card(
                margin: const EdgeInsets.only(bottom: 10),
                child: ListTile(
                  title: Text(item.title),
                  subtitle: Text('${item.platform} · ${item.creatorName}'),
                  trailing: IconButton(
                    icon: const Icon(Icons.delete_outline),
                    onPressed: () async {
                      await _repo.toggleBookmark(item);
                      await _load();
                    },
                  ),
                ),
              )),
      ],
    );
  }
}
