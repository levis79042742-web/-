import 'package:flutter/material.dart';
import '../services/ai_service.dart';

class AIStudioScreen extends StatefulWidget {
  const AIStudioScreen({super.key});

  @override
  State<AIStudioScreen> createState() => _AIStudioScreenState();
}

class _AIStudioScreenState extends State<AIStudioScreen> {
  final AIService _aiService = AIService();
  final TextEditingController _topicCtrl = TextEditingController();
  String _targetPlatform = 'TikTok / Reels';
  bool _generating = false;
  Map<String, dynamic>? _result;
  String? _error;

  Future<void> _generate() async {
    if (_topicCtrl.text.trim().isEmpty) return;
    setState(() {
      _generating = true;
      _error = null;
    });
    try {
      final res = await _aiService.generateCreativeKit(
        topic: _topicCtrl.text.trim(),
        targetPlatform: _targetPlatform,
        tone: '高互動接地氣',
      );
      if (!mounted) return;
      setState(() => _result = res);
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _generating = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text('AI 創作中心', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),
        TextField(
          controller: _topicCtrl,
          decoration: const InputDecoration(
            labelText: '輸入熱門話題或關鍵字',
            hintText: '例如：台北隱藏版滷肉飯、秋冬極簡穿搭',
            border: OutlineInputBorder(),
          ),
        ),
        const SizedBox(height: 12),
        DropdownButtonFormField<String>(
          value: _targetPlatform,
          decoration: const InputDecoration(labelText: '目標社群平台', border: OutlineInputBorder()),
          items: const [
            DropdownMenuItem(value: 'TikTok / Reels', child: Text('TikTok / IG Reels')),
            DropdownMenuItem(value: 'YouTube Shorts', child: Text('YouTube Shorts')),
            DropdownMenuItem(value: 'Threads', child: Text('Threads')),
            DropdownMenuItem(value: '小紅書', child: Text('小紅書')),
          ],
          onChanged: (v) {
            if (v != null) setState(() => _targetPlatform = v);
          },
        ),
        const SizedBox(height: 12),
        FilledButton(
          onPressed: _generating ? null : _generate,
          child: Text(_generating ? 'AI 生成中...' : '一鍵生成腳本、標題與提示詞'),
        ),
        if (_error != null) ...[
          const SizedBox(height: 12),
          Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
        ],
        if (_result != null) ...[
          const SizedBox(height: 16),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: SelectableText(_result.toString()),
            ),
          ),
        ],
      ],
    );
  }
}
