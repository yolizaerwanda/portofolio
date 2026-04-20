import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:url_launcher/url_launcher.dart';

class CheckoutItem {
  final int cartId;
  final int productId;
  final String name;
  final int price;
  final int quantity;
  final int subtotal;

  CheckoutItem({
    required this.cartId,
    required this.productId,
    required this.name,
    required this.price,
    required this.quantity,
    required this.subtotal,
  });

  Map<String, dynamic> toJson() => {
        "cart_id": cartId,
        "product_id": productId,
        "name": name,
        "price": price,
        "quantity": quantity,
        "subtotal": subtotal,
      };
}

class CheckoutPage extends StatelessWidget {
  final int userId;
  final List<CheckoutItem> items;

  const CheckoutPage({
    super.key,
    required this.userId,
    required this.items,
  });

  int get subtotal => items.fold(0, (sum, item) => sum + item.subtotal);
  int get shippingCost => 20000;
  int get total => subtotal + shippingCost;

  Future<void> openMidtrans(String snapToken) async {
    final url = Uri.parse(
      "https://app.sandbox.midtrans.com/snap/v2/vtweb/$snapToken",
    );

    if (!await launchUrl(
      url,
      mode: LaunchMode.externalApplication,
    )) {
      throw Exception('Tidak bisa membuka halaman pembayaran');
    }
  }

  Future<void> submitCheckout(BuildContext context) async {
    try {
      final res = await http.post(
        Uri.parse("https://backend-mobile.yoliza277.online/checkout.php"), // "http://localhost/server_shop_yoliza/checkout.php"),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({
          "user_id": userId,
          "items": items.map((e) => e.toJson()).toList(),
          "total": total,
        }),
      );

      final json = jsonDecode(res.body);

      if (json['status'] == true && json['snap_token'] != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Redirect ke pembayaran...")),
        );

        await openMidtrans(json['snap_token']);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(json['message'] ?? "Checkout gagal")),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Error: $e")),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Checkout"),
        centerTitle: true,
      ),
      body: Column(
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            margin: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              color: Colors.grey.shade100,
            ),
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "Alamat Pengiriman",
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
                SizedBox(height: 6),
                Text("Yoliza Erwanda"),
                Text("Dalam Koto No. 27"),
                Text("Padang, Sumatera Barat"),
              ],
            ),
          ),

          Expanded(
            child: ListView(
              children: items.map((item) {
                return ListTile(
                  title: Text(item.name,
                      style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle:
                      Text("${item.quantity} x Rp ${item.price}"),
                  trailing: Text(
                    "Rp ${item.subtotal}",
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                );
              }).toList(),
            ),
          ),

          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  blurRadius: 6,
                  color: Colors.black.withOpacity(0.1),
                  offset: const Offset(0, -2),
                )
              ],
            ),
            child: Column(
              children: [
                _row("Subtotal", subtotal),
                _row("Ongkir", shippingCost),
                const Divider(),
                _row("Total", total, bold: true),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () => submitCheckout(context),
                    child: const Text(
                      "Next",
                      style:
                          TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _row(String label, int value, {bool bold = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label),
          Text(
            "Rp $value",
            style: TextStyle(
              fontWeight: bold ? FontWeight.bold : FontWeight.normal,
            ),
          ),
        ],
      ),
    );
  }
}
