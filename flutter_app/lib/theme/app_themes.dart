import 'package:flutter/material.dart';

enum Trend7ThemeType {
  darkTech('黑色科技風'),
  minimalWhite('白色極簡風'),
  purpleAi('紫色 AI 未來風'),
  hotOrange('橘紅熱門風'),
  colorfulGradient('彩色漸層風'),
  cuteHealing('可愛療癒風');

  final String label;
  const Trend7ThemeType(this.label);
}

class AppThemes {
  static ThemeData getTheme(Trend7ThemeType type) {
    switch (type) {
      case Trend7ThemeType.darkTech:
        return ThemeData(
          useMaterial3: true,
          brightness: Brightness.dark,
          colorScheme: ColorScheme.fromSeed(
            seedColor: const Color(0xFF3B82F6),
            brightness: Brightness.dark,
            surface: const Color(0xFF11151F),
          ),
          scaffoldBackgroundColor: const Color(0xFF090B10),
        );
      case Trend7ThemeType.minimalWhite:
        return ThemeData(
          useMaterial3: true,
          brightness: Brightness.light,
          colorScheme: ColorScheme.fromSeed(
            seedColor: const Color(0xFF0F172A),
            brightness: Brightness.light,
            surface: Colors.white,
          ),
          scaffoldBackgroundColor: const Color(0xFFF8FAFC),
        );
      case Trend7ThemeType.purpleAi:
        return ThemeData(
          useMaterial3: true,
          brightness: Brightness.dark,
          colorScheme: ColorScheme.fromSeed(
            seedColor: const Color(0xFF8B5CF6),
            brightness: Brightness.dark,
            surface: const Color(0xFF17122B),
          ),
          scaffoldBackgroundColor: const Color(0xFF0E0A1A),
        );
      case Trend7ThemeType.hotOrange:
        return ThemeData(
          useMaterial3: true,
          brightness: Brightness.light,
          colorScheme: ColorScheme.fromSeed(
            seedColor: const Color(0xFFEA580C),
            brightness: Brightness.light,
            surface: Colors.white,
          ),
          scaffoldBackgroundColor: const Color(0xFFFFFBF7),
        );
      case Trend7ThemeType.colorfulGradient:
        return ThemeData(
          useMaterial3: true,
          brightness: Brightness.light,
          colorScheme: ColorScheme.fromSeed(
            seedColor: const Color(0xFF2563EB),
            brightness: Brightness.light,
            surface: Colors.white,
          ),
          scaffoldBackgroundColor: const Color(0xFFF5F7FF),
        );
      case Trend7ThemeType.cuteHealing:
        return ThemeData(
          useMaterial3: true,
          brightness: Brightness.light,
          colorScheme: ColorScheme.fromSeed(
            seedColor: const Color(0xFF0D9488),
            brightness: Brightness.light,
            surface: Colors.white,
          ),
          scaffoldBackgroundColor: const Color(0xFFF4F7F4),
        );
    }
  }
}
