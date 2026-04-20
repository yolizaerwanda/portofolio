import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shopyoliza/cart.dart';
import 'dart:convert';

import 'package:shopyoliza/homepage.dart';

class GridSepatuPria extends StatefulWidget {
  final int userId;
  const GridSepatuPria({super.key, required this.userId,});

  @override
  State<GridSepatuPria> createState() => _GridSepatuPriaState();
}

class _GridSepatuPriaState extends State<GridSepatuPria> {

  List<dynamic> sepatuPriaProduct = [];

  Future<void> getAllSepatuPria() async{
    String urlSepatuPria = "https://backend-mobile.yoliza277.online/gridsepatupria.php"; // "http://localhost/server_shop_yoliza/gridsepatupria.php";
    try {
      var response = await http.get(Uri.parse(urlSepatuPria));
      setState(() {
        sepatuPriaProduct = jsonDecode(response.body);
      });
    } catch(exc) {
      if (kDebugMode) {
        print(exc);
      }
    }
  }

  @override
  void initState() {
    super.initState();
    getAllSepatuPria();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(onPressed: () {
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(
              builder: (context) => HomePage(userId: widget.userId,),
            ),
          );
        },
         icon: const Icon(Icons.arrow_back, size: 25, color: Colors.white,),),
        title: const Text("Men's Shoe Product", style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white),),
        centerTitle: true,
        backgroundColor: Colors.green.shade400,
      ),
      body: Center(
        child: GridView.builder(
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            mainAxisSpacing: 5,
            crossAxisSpacing: 5,
            childAspectRatio: 0.75,
          ), 
          itemCount: sepatuPriaProduct.length,
          itemBuilder: (context, int index) {
            final item = sepatuPriaProduct[index];
            return GestureDetector(
              onTap: () {
                Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(
                    builder: (context) => DetilSepatuPria(item: item, userId: widget.userId,),
                  ),
                );
              },
              child: Card(
                child: Column(
                  children:<Widget> [
                    Image.network(item['images'].toString(), width: 125, height: 150,),
                    Padding(
                      padding: EdgeInsets.fromLTRB(10, 5, 0, 5),
                      child: Text(
                        item['name'].toString(), 
                        maxLines: 2, 
                        overflow: TextOverflow.ellipsis, 
                        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.black54),
                      ),
                    ),
                    Padding(
                      padding: EdgeInsets.fromLTRB(8, 4, 8, 8),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children:<Widget> [ 
                          Text("Rp ${item['price'].toString()}", style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.black),),
                          Row(
                            children:<Widget> [
                              Icon(Icons.favorite, size: 13, color: Colors.red,),
                              Text("Rp ${item['promo'].toString()}", style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.green),),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
      ),
      ),
    );
  }
}

class DetilSepatuPria extends StatelessWidget {

  final dynamic item;
  final int userId;

  const DetilSepatuPria({super.key, required this.item, required this.userId,});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(onPressed: () {
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(
              builder: (context) => GridSepatuPria(userId: userId),
            ),
          );
        },
         icon: const Icon(Icons.arrow_back, size: 25, color: Colors.blue,),),
        title: Text(
          item['name'].toString(), 
          maxLines: 2, 
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.blue),
        ),
        centerTitle: true,
        backgroundColor: Colors.white,
        actions: [
          IconButton(onPressed: () {},
         icon: const Icon(Icons.shop_outlined, size: 25, color: Colors.blue,),),
        ],
      ),

      body: SingleChildScrollView(
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.start,
        children:<Widget> [
          Padding(
            padding: EdgeInsets.only(left: 15),
            child: Image.network(item['images'].toString(), width: 400, height: 350,),
          ),
          Padding(
            padding: EdgeInsets.fromLTRB(30, 20, 0, 0),
            child: Text("Product Description", style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.black),),
          ),
          Padding(
            padding: EdgeInsets.fromLTRB(30, 0, 0, 0),
            child: Text(item['description'].toString(), style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.black54),),
          ),
          Padding(
            padding: EdgeInsets.fromLTRB(30, 20, 30, 20),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children:<Widget> [ 
                Text("Harga Rp ${item['price'].toString()}", style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.black),),
                Row(
                  children:<Widget> [
                    Icon(Icons.favorite, size: 13, color: Colors.red,),
                    Text("Rp ${item['promo'].toString()}", style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.green),),
                  ],
                ),
              ],
            ),
          ),
          Padding(
            padding: EdgeInsets.fromLTRB(100, 40, 0, 0),
            child: SizedBox(
              width: 200,
              height: 50,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30))),
                onPressed: () async {
                  await CartService.addCart(
                    userId,
                    int.parse(item['id'].toString()),
                  );

                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => CartPage(userId: userId),
                    ),
                  );
                },
                child: Text("Add to Cart", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.green),),
              ),
            ),
          ),
        ],
      ),
    ),
    );
  }
}