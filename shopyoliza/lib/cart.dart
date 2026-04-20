import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'checkout.dart';

class Cart {
  final int id;
  final int productId;
  final String name;
  final String image;
  final int price;
  int quantity;
  final int subtotal;

  Cart({
    required this.id,
    required this.productId,
    required this.name,
    required this.image,
    required this.price,
    required this.quantity,
    required this.subtotal,
  });

  factory Cart.fromJson(Map<String, dynamic> json) {
    return Cart(
      id: int.parse(json['id'].toString()),
      productId: int.parse(json['product_id'].toString()),
      name: json['name'],
      image: json['images'],
      price: int.parse(json['price'].toString()),
      quantity: int.parse(json['quantity'].toString()),
      subtotal: int.parse(json['subtotal'].toString()),
    );
  }
}

class CartService {
  static const String baseUrl =
      "https://backend-mobile.yoliza277.online/cart.php"; // "http://localhost/server_shop_yoliza/cart.php";

  static Future<List<Cart>> getCart(int userId) async {
    final res =
        await http.get(Uri.parse("$baseUrl?action=get&user_id=$userId"));

    final jsonData = jsonDecode(res.body);
    return (jsonData['data'] as List)
        .map((e) => Cart.fromJson(e))
        .toList();
  }

  
  static Future<void> addCart(int userId, int productId) async {
    await http.post(
      Uri.parse("$baseUrl?action=add"),
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({
        "user_id": userId,
        "product_id": productId,
        "quantity": 1,
      }),
    );
  }

  static Future<void> updateCart(int id, int qty) async {
    await http.post(
      Uri.parse("$baseUrl?action=update"),
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({
        "id": id,
        "quantity": qty,
      }),
    );
  }

  static Future<void> deleteCart(int id) async {
    await http.post(
      Uri.parse("$baseUrl?action=delete"),
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({"id": id}),
    );
  }
}

class CartPage extends StatefulWidget {
  final int userId;
  const CartPage({super.key, required this.userId});

  @override
  State<CartPage> createState() => _CartPageState();
}

class _CartPageState extends State<CartPage> {
  late Future<List<Cart>> future;

  final Set<int> selectedCartIds = {};

  @override
  void initState() {
    super.initState();
    future = CartService.getCart(widget.userId);
  }

  void refresh() {
    setState(() {
      future = CartService.getCart(widget.userId);
    });
  }

  int totalSelected(List<Cart> carts) {
    return carts
        .where((c) => selectedCartIds.contains(c.id))
        .fold(0, (sum, c) => sum + c.subtotal);
  }

  List<CheckoutItem> buildCheckoutItems(List<Cart> carts) {
    return carts
        .where((c) => selectedCartIds.contains(c.id))
        .map((c) => CheckoutItem(
              cartId: c.id,
              productId: c.productId,
              name: c.name,
              price: c.price,
              quantity: c.quantity,
              subtotal: c.subtotal,
            ))
        .toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Cart", style: TextStyle(fontWeight: FontWeight.bold)),
        centerTitle: true,
      ),
      body: FutureBuilder<List<Cart>>(
        future: future,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return const Center(child: Text("Your cart is empty"));
          }

          final carts = snapshot.data!;

          return Column(
            children: [
              Expanded(
                child: ListView.builder(
                  itemCount: carts.length,
                  itemBuilder: (context, i) {
                    final c = carts[i];
                    final selected = selectedCartIds.contains(c.id);

                    return Card(
                      margin: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 6),
                      child: Padding(
                        padding: const EdgeInsets.all(12),
                        child: Row(
                          children: [
                            Checkbox(
                              value: selected,
                              onChanged: (val) {
                                if (val == null) return;
                                setState(() {
                                  val
                                      ? selectedCartIds.add(c.id)
                                      : selectedCartIds.remove(c.id);
                                });
                              },
                            ),

                            Image.network(
                              c.image,
                              width: 70,
                              height: 70,
                              fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) =>
                                  const Icon(Icons.image, size: 70),
                            ),
                            const SizedBox(width: 10),

                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(c.name,
                                      style: const TextStyle(
                                          fontWeight: FontWeight.bold)),
                                  Text("Rp ${c.price}"),
                                  Text("Subtotal: Rp ${c.subtotal}"),
                                ],
                              ),
                            ),

                            Column(
                              children: [
                                IconButton(
                                  icon: const Icon(Icons.remove),
                                  onPressed: c.quantity > 1
                                      ? () async {
                                          await CartService.updateCart(
                                              c.id, c.quantity - 1);
                                          refresh();
                                        }
                                      : null,
                                ),
                                Text(c.quantity.toString()),
                                IconButton(
                                  icon: const Icon(Icons.add),
                                  onPressed: () async {
                                    await CartService.updateCart(
                                        c.id, c.quantity + 1);
                                    refresh();
                                  },
                                ),
                              ],
                            ),

                            IconButton(
                              icon:
                                  const Icon(Icons.delete, color: Colors.red),
                              onPressed: () async {
                                selectedCartIds.remove(c.id);
                                await CartService.deleteCart(c.id);
                                refresh();
                              },
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),

              Container(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    Text(
                      "Total: Rp ${totalSelected(carts)}",
                      style: const TextStyle(
                          fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 10),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: selectedCartIds.isEmpty
                            ? null
                            : () {
                                final items =
                                    buildCheckoutItems(carts);

                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => CheckoutPage(
                                      userId: widget.userId,
                                      items: items,
                                    ),
                                  ),
                                );
                              },
                        child: const Text("Checkout",
                            style: TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.bold)),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
