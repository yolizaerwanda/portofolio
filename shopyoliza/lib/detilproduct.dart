import 'package:flutter/material.dart';
import 'cart.dart';

class DetilProductPage extends StatelessWidget {
  final dynamic item;
  final int userId;
  final Widget backPage;

  const DetilProductPage({
    super.key,
    required this.item,
    required this.userId,
    required this.backPage,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.blue),
          onPressed: () {
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(builder: (_) => backPage),
            );
          },
        ),
        title: Text(
          item['name'],
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: Colors.blue,
          ),
        ),
        centerTitle: true,
        backgroundColor: Colors.white,
        actions: const [
          Padding(
            padding: EdgeInsets.only(right: 12),
            child: Icon(Icons.shopping_bag_outlined, color: Colors.blue),
          )
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
            child: Text(item['description'].toString(), style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.black54),),
          ),
          Padding(
            padding: EdgeInsets.fromLTRB(30, 20, 30, 20),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children:<Widget> [ 
                Text("Harga Rp ${item['price'].toString()}", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.black),),
                Row(
                  children:<Widget> [
                    Icon(Icons.favorite, size: 16, color: Colors.red,),
                    Text("Rp ${item['promo'].toString()}", style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.green),),
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
