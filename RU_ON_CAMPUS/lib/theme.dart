import 'package:flutter/material.dart';

const scarlet = Color(0xFFCC0033); // Rutgers Scarlet
const scarletDark = Color(0xFFA00029);

ThemeData buildScarletTheme() {
  final base = ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: scarlet,
      primary: scarlet,
      secondary: scarletDark,
      brightness: Brightness.light,
    ),
  );
  return base.copyWith(
    appBarTheme: const AppBarTheme(
      backgroundColor: scarlet,
      foregroundColor: Colors.white,
      centerTitle: true,
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: scarlet,
        foregroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    ),
    cardTheme: const CardThemeData(
  elevation: 2,
  margin: EdgeInsets.all(8),
),

  );
}
