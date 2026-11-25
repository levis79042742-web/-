import 'package:flutter/material.dart';
import '../theme/app_themes.dart';

class SettingsScreen extends StatefulWidget {
  final Trend7ThemeType currentTheme;
  final ValueChanged<Trend7ThemeType> onThemeChanged;

  const SettingsScreen({
    super.key,
    required this.currentTheme,
    required this.onThemeChanged,
  });

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _dailyNotify = true;
  bool _weeklyNotify = true;
  String _region = 'TW';

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text('個人設定', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold)),
        const SizedBox(height: 16),
        Text('切換介面主題（六種風格）', style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 8),
        ...Trend7ThemeType.values.map(
          (theme) => RadioListTile<Trend7ThemeType>(
            title: Text(theme.label),
            value: theme,
            groupValue: widget.currentTheme,
            onChanged: (v) {
              if (v != null) widget.onThemeChanged(v);
            },
          ),
        ),
        const Divider(height: 32),
        SwitchListTile(
          title: const Text('每日熱門趨勢通知'),
          value: _dailyNotify,
          onChanged: (v) => setState(() => _dailyNotify = v),
        ),
        SwitchListTile(
          title: const Text('每週爆紅排行榜通知'),
          value: _weeklyNotify,
          onChanged: (v) => setState(() => _weeklyNotify = v),
        ),
        ListTile(
          title: const Text('預設地區'),
          trailing: DropdownButton<String>(
            value: _region,
            items: const [
              DropdownMenuItem(value: 'TW', child: Text('台灣')),
              DropdownMenuItem(value: 'JP', child: Text('日本')),
              DropdownMenuItem(value: 'KR', child: Text('韓國')),
              DropdownMenuItem(value: 'US', child: Text('美國')),
            ],
            onChanged: (v) {
              if (v != null) setState(() => _region = v);
            },
          ),
        ),
      ],
    );
  }
}
