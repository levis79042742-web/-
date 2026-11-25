import 'package:flutter/material.dart';
import 'theme/app_themes.dart';
import 'screens/home_screen.dart';
import 'screens/ranking_screen.dart';
import 'screens/ai_studio_screen.dart';
import 'screens/bookmarks_screen.dart';
import 'screens/settings_screen.dart';

void main() {
  runApp(const Trend7App());
}

class Trend7App extends StatefulWidget {
  const Trend7App({super.key});

  @override
  State<Trend7App> createState() => _Trend7AppState();
}

class _Trend7AppState extends State<Trend7App> {
  Trend7ThemeType _currentTheme = Trend7ThemeType.darkTech;
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    final screens = [
      const HomeScreen(),
      const RankingScreen(),
      const AIStudioScreen(),
      const BookmarksScreen(),
      SettingsScreen(
        currentTheme: _currentTheme,
        onThemeChanged: (theme) => setState(() => _currentTheme = theme),
      ),
    ];

    return MaterialApp(
      title: '這週紅什麼 Trend7',
      debugShowCheckedModeBanner: false,
      theme: AppThemes.getTheme(_currentTheme),
      home: Scaffold(
        body: SafeArea(child: screens[_selectedIndex]),
        bottomNavigationBar: NavigationBar(
          selectedIndex: _selectedIndex,
          onDestinationSelected: (index) => setState(() => _selectedIndex = index),
          destinations: const [
            NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: '首頁'),
            NavigationDestination(icon: Icon(Icons.leaderboard_outlined), selectedIcon: Icon(Icons.leaderboard), label: '排行榜'),
            NavigationDestination(icon: Icon(Icons.auto_awesome_outlined), selectedIcon: Icon(Icons.auto_awesome), label: 'AI 創作'),
            NavigationDestination(icon: Icon(Icons.bookmark_outline), selectedIcon: Icon(Icons.bookmark), label: '收藏'),
            NavigationDestination(icon: Icon(Icons.settings_outlined), selectedIcon: Icon(Icons.settings), label: '設定'),
          ],
        ),
      ),
    );
  }
}
