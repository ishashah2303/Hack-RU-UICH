import 'package:flutter/material.dart';
import '../services/food_service.dart';

class FoodRunnerScreen extends StatefulWidget {
  const FoodRunnerScreen({super.key});

  @override
  State<FoodRunnerScreen> createState() => _FoodRunnerScreenState();
}

class _FoodRunnerScreenState extends State<FoodRunnerScreen> {
  final _service = FoodService();

  String _vendor = 'Starbucks';
  String _item = 'Cappuccino';
  int _qty = 1;
  bool _placing = false;

  final vendors = const ['Starbucks', 'Domino\'s', 'Dunkin\''];
  final items = const {
    'Starbucks': ['Cappuccino', 'Latte', 'Cold Brew'],
    'Domino\'s': ['Margherita Pizza', 'Veggie Pizza', 'Pepperoni Pizza'],
    'Dunkin\'': ['Iced Coffee', 'Donut Box', 'Bagel'],
  };

  Future<void> _placeOrder() async {
    setState(() => _placing = true);
    final res = await _service.placeOrder(vendor: _vendor, item: _item, quantity: _qty);
    setState(() => _placing = false);

    if (!mounted) return;
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Order Placed'),
        content: Text('Ticket: ${res.ticketId}\nVendor: $_vendor\nItem: $_item x$_qty\nETA: ${res.etaMinutes} min'),
        actions: [TextButton(onPressed: () => Navigator.pop(context), child: const Text('OK'))],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final vendorItems = items[_vendor]!;
    if (!vendorItems.contains(_item)) _item = vendorItems.first;

    return Scaffold(
      appBar: AppBar(title: const Text('Food + Coffee Runner')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            DropdownButtonFormField<String>(
              value: _vendor,
              items: vendors.map((v) => DropdownMenuItem(value: v, child: Text(v))).toList(),
              decoration: const InputDecoration(labelText: 'Vendor'),
              onChanged: (v) => setState(() => _vendor = v!),
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              value: _item,
              items: vendorItems.map((v) => DropdownMenuItem(value: v, child: Text(v))).toList(),
              decoration: const InputDecoration(labelText: 'Item'),
              onChanged: (v) => setState(() => _item = v!),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                const Text('Qty'),
                const SizedBox(width: 12),
                DropdownButton<int>(
                  value: _qty,
                  items: [1,2,3,4,5].map((q) => DropdownMenuItem(value: q, child: Text('$q'))).toList(),
                  onChanged: (q) => setState(() => _qty = q!),
                )
              ],
            ),
            const Spacer(),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _placing ? null : _placeOrder,
                child: _placing ? const SizedBox(height: 18, width: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                                : const Text('Place Order'),
              ),
            )
          ],
        ),
      ),
    );
  }
}
