import 'dart:math';

class OrderResult {
  final String ticketId;
  final int etaMinutes;
  OrderResult({required this.ticketId, required this.etaMinutes});
}

class FoodService {
  Future<OrderResult> placeOrder({required String vendor, required String item, required int quantity}) async {
    await Future.delayed(const Duration(milliseconds: 350));
    final eta = 10 + Random().nextInt(20);
    final ticket = '${vendor.substring(0,2).toUpperCase()}-${Random().nextInt(90000)+10000}';
    return OrderResult(ticketId: ticket, etaMinutes: eta);
  }
}
